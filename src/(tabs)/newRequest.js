import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { signOutUser } from "../../services/authService";

export default function NewRequestScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            New Request
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Create a new learning request or upload materials
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Request Types</Text>
          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => console.log("Learning Material Request")}
          >
            Learning Material Request
          </Button>
          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => console.log("Course Enrollment")}
          >
            Course Enrollment
          </Button>
          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => console.log("Upload Document")}
          >
            Upload Document
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={[styles.button, styles.logoutButton]}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
  },
  button: {
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 24,
  },
});
