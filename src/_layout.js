import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import "../firebaseConfig"; // Initialize Firebase
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginScreen from "./(auth)/login";
import TabsLayout from "./(tabs)/_layout";

function AppRoutes() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing)
      console.log("Auth ready, user:", user ? "signed in" : "signed out");
  }, [user, initializing]);

  if (initializing) return null;

  // Now, render the TabsLayout if logged in
  return user ? <TabsLayout /> : <LoginScreen />;
}

export default function RootLayout() {
  useEffect(() => {
    console.log("Firebase initialized in SecureLC app");
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </AuthProvider>
  );
}
