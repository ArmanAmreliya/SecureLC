import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Avatar,
  useTheme,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import RequestCard from "../components/RequestCard";

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);

  // Get user display name from email
  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const name = user.email.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "User";
  };

  // Function to mark active job as complete
  const markJobComplete = async () => {
    if (!activeJob) return;

    try {
      await updateDoc(doc(db, "requests", activeJob.id), {
        status: "completed",
      });
      // Stop GPS tracking here if implemented
      console.log("Job marked as complete, GPS tracking stopped");
    } catch (error) {
      console.error("Error marking job complete:", error);
    }
  };

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

      // Find active job (approved status)
      const activeRequest = requestsData.find(
        (req) => req.status === "approved"
      );
      setActiveJob(activeRequest || null);

      setRequests(requestsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const renderRequestCard = ({ item }) => (
    <RequestCard
      item={item}
      substation={item.substation}
      status={item.status}
      date={item.createdAt?.toDate?.() || new Date()}
      audioURL={item.audioURL}
      faultType={item.faultType}
    />
  );

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text variant="bodyLarge" style={styles.welcomeText}>
              Welcome back,
            </Text>
            <Text variant="headlineSmall" style={styles.userName}>
              {getUserName()}
            </Text>
          </View>
          <Avatar.Icon
            size={48}
            icon="account"
            style={styles.avatar}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Job Card - Only shown when there's an approved request */}
        {activeJob && (
          <Card style={styles.activeJobCard}>
            <Card.Content style={styles.activeJobContent}>
              <View style={styles.activeJobHeader}>
                <MaterialIcons
                  name="work"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.activeJobTitle}>
                  Active Job
                </Text>
              </View>

              <Text variant="bodyLarge" style={styles.activeJobSubstation}>
                {activeJob.substation}
              </Text>

              <View style={styles.gpsTrackingContainer}>
                <MaterialIcons
                  name="gps-fixed"
                  size={18}
                  color="#FFC107"
                  style={styles.gpsIcon}
                />
                <Text variant="bodyMedium" style={styles.activeJobDescription}>
                  Live GPS tracking is active for this job
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={markJobComplete}
                style={styles.completeButton}
                labelStyle={styles.completeButtonText}
              >
                Mark as Complete
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Streamlined Recent Requests */}
        <View style={styles.requestsSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Requests
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                animating={true}
                size="large"
                color={theme.colors.primary}
              />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : requests.length > 0 ? (
            <FlatList
              data={requests}
              renderItem={renderRequestCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContainer}>
                <MaterialIcons
                  name="assignment"
                  size={48}
                  color={theme.colors.outline}
                  style={styles.emptyIcon}
                />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No requests yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Create your first line clear request to get started
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6", // theme.colors.background
  },
  header: {
    backgroundColor: "#FFFFFF", // theme.colors.surface
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D5", // theme.colors.outline with opacity
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: "#79747E", // theme.colors.outline
    marginBottom: 2,
  },
  userName: {
    color: "#1C1C1E", // theme.colors.onSurface
    fontWeight: "600",
  },
  avatar: {
    backgroundColor: "#FFF8E1", // theme.colors.primaryContainer
  },
  scrollView: {
    flex: 1,
  },
  activeJobCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF", // theme.colors.surface
    borderWidth: 2,
    borderColor: "#FFC107", // theme.colors.primary
    elevation: 4,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeJobContent: {
    paddingVertical: 20,
  },
  activeJobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activeJobTitle: {
    marginLeft: 8,
    color: "#1C1C1E", // theme.colors.onSurface
    fontWeight: "600",
  },
  activeJobSubstation: {
    color: "#1C1C1E", // theme.colors.onSurface
    fontWeight: "bold",
    marginBottom: 8,
  },
  activeJobDescription: {
    color: "#79747E", // theme.colors.outline
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: "#FFC107", // theme.colors.primary
    marginTop: 8,
  },
  completeButtonText: {
    color: "#000000", // theme.colors.onPrimary
    fontWeight: "600",
  },
  requestsSection: {
    padding: 16,
  },
  sectionTitle: {
    color: "#1C1C1E", // theme.colors.onSurface
    fontWeight: "700",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#79747E", // theme.colors.outline
  },
  emptyCard: {
    backgroundColor: "#FFFFFF", // theme.colors.surface
    borderWidth: 1,
    borderColor: "#E8E0D5", // theme.colors.secondaryContainer
    borderStyle: "dashed",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    color: "#1C1C1E", // theme.colors.onSurface
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#79747E", // theme.colors.outline
    textAlign: "center",
    paddingHorizontal: 20,
  },
  gpsTrackingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  gpsIcon: {
    marginRight: 8,
  },
});
