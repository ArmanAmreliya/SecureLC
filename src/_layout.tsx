import React, { useEffect } from 'react';
import '../firebaseConfig'; // Initialize Firebase
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from './(auth)/login';
import HomeScreen from './(tabs)/index';

function AppRoutes() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) console.log('Auth ready, user:', user ? 'signed in' : 'signed out');
  }, [user, initializing]);

  if (initializing) return null;

  // Simple conditional rendering instead of expo-router navigation
  return user ? <HomeScreen /> : <LoginScreen />;
}

export default function RootLayout() {
  useEffect(() => {
    // Firebase is initialized when firebaseConfig is imported
    console.log('Firebase initialized in SecureLC app');
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}