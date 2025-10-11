import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import RequestCard from "../components/RequestCard";

export default function HomeScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's requests from Firestore
  useEffect(() => {
    if (!user) return;

    const requestsQuery = query(
      collection(db, "requests"),
      where("userId", "==", user.uid)
      // TODO: Add orderBy("createdAt", "desc") after creating Firestore index
      // orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort manually for now until Firestore index is created
      requestsData.sort((a, b) => {
        const aTime = a.createdAt?.toDate() || new Date(0);
        const bTime = b.createdAt?.toDate() || new Date(0);
        return bTime - aTime; // Newest first
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const renderRequestCard = ({ item }) => (
    <RequestCard
      substation={item.substation}
      status={item.status}
      date={item.createdAt?.toDate?.() || new Date()}
      audioURL={item.audioURL}
    />
  );

  return (
    <View style={styles.container}>
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
                Recent Requests
              </Text>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator animating={true} size="large" />
                  <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
              ) : requests.length > 0 ? (
                <FlatList
                  data={requests}
                  renderItem={renderRequestCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    No requests found. Create your first request!
                  </Text>
                </View>
              )}
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
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
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
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#79747E",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#79747E",
    textAlign: "center",
  },
});
