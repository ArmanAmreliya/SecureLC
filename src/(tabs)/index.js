import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome to SecureLC!
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Hello, {user?.email?.split("@")[0] || "User"}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Your secure learning center dashboard
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => console.log("Create new request")}
            >
              Create New Request
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => console.log("View documents")}
            >
              View My Documents
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => console.log("Recent activity")}
            >
              Recent Activity
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Learning Progress
            </Text>
            <Text variant="bodyMedium">
              Complete your learning modules and track progress here.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6", // Light clean gray background
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: "#FFC107", // Professional gold/amber
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF", // Pure white
  },
  title: {
    color: "#000000", // Black text on primary (yellow)
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#000000", // Black text on primary (yellow)
    textAlign: "center",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  description: {
    color: "#271B00", // Dark brown/black for contrast on yellow
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
    color: "#1C1C1E", // Almost black
  },
  actionButton: {
    marginBottom: 8,
  },
});
