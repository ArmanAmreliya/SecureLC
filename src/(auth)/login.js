import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
} from "react-native-paper";
// routing handled by AuthContext + conditional rendering in app/_layout.js
import * as LocalAuthentication from "expo-local-authentication";
import { signIn as firebaseSignIn } from "../../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const theme = useTheme();

  const validate = () => {
    if (!email) return "Employee ID is required";
    if (!password) return "Password is required";
    return "";
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const isSupported = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (mounted) setBiometricAvailable(Boolean(isSupported && isEnrolled));
      } catch (e) {
        if (mounted) setBiometricAvailable(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const onLogin = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Use Firebase Auth - AuthContext listens for auth state change and will render Home
      await firebaseSignIn(email, password);
    } catch (e) {
      console.error("Login error", e);
      setError(e?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      if (!isSupported)
        return alert("Biometric authentication is not available.");

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return alert("No biometrics enrolled on this device.");

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to SecureLC",
      });

      if (result.success) {
        // On success the AuthContext will update and render Home
      } else {
        alert("Biometric authentication failed.");
      }
    } catch (e) {
      console.error("Biometric auth error", e);
      alert("Biometric authentication error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          SecureLC Login
        </Text>

        <TextInput
          label="Employee ID"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={onLogin}
          loading={loading}
          style={styles.button}
        >
          Sign In
        </Button>

        {biometricAvailable ? (
          <Button
            mode="outlined"
            onPress={handleBiometricAuth}
            style={[styles.button, styles.biometricButton]}
          >
            Login with Biometrics
          </Button>
        ) : null}

        <Text style={styles.small}>Forgot password? Contact HR.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
  small: {
    marginTop: 18,
    textAlign: "center",
    color: "#666",
  },
});
