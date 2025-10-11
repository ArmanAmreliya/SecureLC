import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
} from "react-native-paper";
// Navigation using React Navigation
import { useNavigation } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import { signIn as firebaseSignIn } from "../../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation(); // Initialize navigation

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
      // Enhanced user-friendly error handling for Firebase errors
      let errorMessage = "Login failed. Please check your credentials.";
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid Employee ID or password.";
      } else if (e.code) {
        errorMessage = `Login failed: ${e.code
          .replace("auth/", "")
          .replace(/-/g, " ")}.`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      if (!isSupported)
        return Alert.alert(
          "Error",
          "Biometric authentication is not available."
        );

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled)
        return Alert.alert("Error", "No biometrics enrolled on this device.");

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to SecureLC",
      });

      if (result.success) {
        // Biometric logic here (usually for session convenience after a primary sign in)
      } else {
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication failed or was cancelled."
        );
      }
    } catch (e) {
      console.error("Biometric auth error", e);
      Alert.alert("Error", "Biometric authentication error occurred.");
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
            icon="fingerprint"
          >
            Login with Biometrics
          </Button>
        ) : null}

        {/* TASK 4: Changed Text component to Button for "Forgot Password" */}
        <Button
          mode="text"
          onPress={() => navigation.navigate("forgotPassword")}
          labelStyle={styles.forgotPasswordLabel}
          style={styles.forgotPasswordButton}
        >
          Forgot password?
        </Button>
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
  biometricButton: {
    borderColor: "#aaa",
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignSelf: "center", // Center the text button
  },
  forgotPasswordLabel: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
