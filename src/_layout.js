import React, { useEffect } from "react";
import "../firebaseConfig"; // Initialize Firebase
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginScreen from "./(auth)/login";
import HomeScreen from "./(tabs)/index";

function AppRoutes() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing)
      console.log("Auth ready, user:", user ? "signed in" : "signed out");
  }, [user, initializing]);

  if (initializing) return null;

  // Simple conditional rendering instead of expo-router navigation
  return user
    ? React.createElement(HomeScreen)
    : React.createElement(LoginScreen);
}

export default function RootLayout() {
  useEffect(() => {
    // Firebase is initialized when firebaseConfig is imported
    console.log("Firebase initialized in SecureLC app");
  }, []);

  return React.createElement(
    AuthProvider,
    null,
    React.createElement(AppRoutes)
  );
}
