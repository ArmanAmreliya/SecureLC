import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
// Assuming authService.js is in the correct path relative to this file
import { resetPassword } from "../services/authService";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // Call the Firebase service function
      await resetPassword(email);

      // Show success alert
      Alert.alert(
        "Success! 🎉",
        `A password reset link has been sent to ${email}. Check your inbox (and spam folder)!`,
        [
          // Go back to the login screen after the user acknowledges the alert
          { text: "OK", onPress: () => navigation.goBack() },
        ]
      );
      setEmail(""); // Clear the email field
    } catch (error) {
      // Display a user-friendly error based on the Firebase error code
      let errorMessage = "Failed to send reset link. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "The email address you entered is not registered.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address format is invalid.";
      }

      Alert.alert("Error", errorMessage);
      console.error("Password Reset Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter the email address associated with your account, and we'll send
          you a link to reset your password.
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          outlineColor="#79747E"
          activeOutlineColor="#FFC107"
          left={<TextInput.Icon icon="email" color="#79747E" />}
        />

        <Button
          mode="contained"
          onPress={handleSendResetLink}
          loading={loading}
          disabled={loading || !email}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          buttonColor="#FFC107" // Professional gold/amber
        >
          Send Reset Link
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          labelStyle={styles.backButtonLabel}
        >
          Back to Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6", // Light clean gray background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E", // Almost black
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#79747E", // Muted gray
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  backButton: {
    marginTop: 20,
  },
  backButtonLabel: {
    color: "#79747E",
    fontSize: 14,
  },
});
