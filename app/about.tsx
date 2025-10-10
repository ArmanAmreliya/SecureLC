import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About SecureLC</Text>
      <Text style={styles.description}>
        This is a test app for the SecureLC library, which appears to be 
        a custom implementation or fork of Expo Router.
      </Text>
      
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Back to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  link: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});