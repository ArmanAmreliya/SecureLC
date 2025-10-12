import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Avatar,
  useTheme,
  Chip,
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
import {
  startGPSTracking,
  stopGPSTracking,
  isGPSTrackingActive,
  getCurrentLocation,
} from "../../services/locationService";

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

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
      setGpsLoading(true);

      // Stop GPS tracking
      await stopGPSTracking();
      setGpsActive(false);

      // Mark job as complete
      await updateDoc(doc(db, "requests", activeJob.id), {
        status: "completed",
        completedAt: new Date(),
      });

      console.log("✅ Job marked as complete, GPS tracking stopped");
    } catch (error) {
      console.error("Error marking job complete:", error);
    } finally {
      setGpsLoading(false);
    }
  };

  // Function to start GPS tracking for active job
  const handleStartGPSTracking = async () => {
    if (!activeJob) {
      console.log("❌ No active job to track");
      return;
    }

    try {
      setGpsLoading(true);
      console.log("🚀 Starting GPS tracking for active job:", activeJob.id);

      const success = await startGPSTracking(activeJob.id);

      if (success) {
        setGpsActive(true);
        console.log("✅ GPS tracking started successfully");

        // Get initial location
        const location = await getCurrentLocation();
        if (location) {
          setCurrentLocation(location.coords);
        }
      } else {
        console.log("❌ Failed to start GPS tracking");
      }
    } catch (error) {
      console.error("Error starting GPS tracking:", error);
    } finally {
      setGpsLoading(false);
    }
  };

  // Function to stop GPS tracking
  const handleStopGPSTracking = async () => {
    try {
      setGpsLoading(true);
      await stopGPSTracking();
      setGpsActive(false);
      console.log("🛑 GPS tracking stopped manually");
    } catch (error) {
      console.error("Error stopping GPS tracking:", error);
    } finally {
      setGpsLoading(false);
    }
  };

  // Check GPS tracking status when component mounts or active job changes
  useEffect(() => {
    const checkGPSStatus = async () => {
      try {
        const isActive = await isGPSTrackingActive();
        setGpsActive(isActive);

        if (isActive && activeJob) {
          console.log(
            "📍 GPS tracking is already active for job:",
            activeJob.id
          );

          // Get current location
          const location = await getCurrentLocation();
          if (location) {
            setCurrentLocation(location.coords);
          }
        }
      } catch (error) {
        console.error("Error checking GPS status:", error);
      }
    };

    if (activeJob) {
      checkGPSStatus();
    } else {
      // No active job, ensure GPS is stopped
      setGpsActive(false);
      setCurrentLocation(null);
    }
  }, [activeJob]);

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

              {/* GPS Tracking Status and Controls */}
              <View style={styles.gpsSection}>
                <View style={styles.gpsStatusContainer}>
                  <MaterialIcons
                    name={gpsActive ? "gps-fixed" : "gps-off"}
                    size={20}
                    color={gpsActive ? "#4CAF50" : "#757575"}
                    style={styles.gpsIcon}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.gpsStatusText,
                      { color: gpsActive ? "#4CAF50" : "#757575" },
                    ]}
                  >
                    {gpsActive
                      ? "GPS Tracking Active"
                      : "GPS Tracking Inactive"}
                  </Text>
                </View>

                {/* Current Location Display */}
                {currentLocation && gpsActive && (
                  <View style={styles.locationInfoContainer}>
                    <Chip
                      icon="map-marker"
                      textStyle={styles.locationChipText}
                      style={styles.locationChip}
                    >
                      {`${currentLocation.latitude.toFixed(
                        6
                      )}, ${currentLocation.longitude.toFixed(6)}`}
                    </Chip>
                    <Text variant="bodySmall" style={styles.accuracyText}>
                      Accuracy: ±{Math.round(currentLocation.accuracy)}m
                    </Text>
                  </View>
                )}

                {/* GPS Control Buttons */}
                <View style={styles.gpsControlsContainer}>
                  {!gpsActive ? (
                    <Button
                      mode="contained"
                      onPress={handleStartGPSTracking}
                      loading={gpsLoading}
                      disabled={gpsLoading}
                      style={styles.gpsButton}
                      labelStyle={styles.gpsButtonText}
                      icon="play"
                    >
                      Start GPS Tracking
                    </Button>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={handleStopGPSTracking}
                      loading={gpsLoading}
                      disabled={gpsLoading}
                      style={styles.gpsStopButton}
                      labelStyle={styles.gpsStopButtonText}
                      icon="stop"
                    >
                      Stop GPS Tracking
                    </Button>
                  )}
                </View>
              </View>

              <Button
                mode="contained"
                onPress={markJobComplete}
                loading={gpsLoading}
                disabled={gpsLoading}
                style={styles.completeButton}
                labelStyle={styles.completeButtonText}
                icon="check"
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
    marginBottom: 16,
  },
  // GPS Tracking Styles
  gpsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E0D5",
  },
  gpsStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gpsIcon: {
    marginRight: 8,
  },
  gpsStatusText: {
    fontWeight: "500",
    flex: 1,
  },
  locationInfoContainer: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  locationChip: {
    backgroundColor: "#E3F2FD",
    marginBottom: 4,
  },
  locationChipText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  accuracyText: {
    color: "#757575",
    fontSize: 12,
    marginLeft: 4,
  },
  gpsControlsContainer: {
    marginTop: 8,
  },
  gpsButton: {
    backgroundColor: "#4CAF50",
  },
  gpsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  gpsStopButton: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  gpsStopButtonText: {
    color: "#F44336",
    fontWeight: "600",
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
