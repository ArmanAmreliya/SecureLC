import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '../firebaseConfig'; // Initialize Firebase

export default function RootLayout() {
  useEffect(() => {
    // Firebase is initialized when firebaseConfig is imported
    console.log('Firebase initialized in SecureLC app');
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'SecureLC Home' }} />
      <Stack.Screen name="about" options={{ title: 'About SecureLC' }} />
    </Stack>
  );
}