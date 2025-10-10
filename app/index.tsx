import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SecureLC!</Text>
      <Text style={styles.subtitle}>Firebase-enabled routing application</Text>
      
      <Link href="/about" style={styles.link}>
        <Text style={styles.linkText}>Go to About Page</Text>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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