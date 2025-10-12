// File: src/components/RequestCard.js
import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Text, Chip, Avatar, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Government app professional color palette for statuses
const statusConfig = {
  approved: {
    color: "#FFC107", // Government yellow
    icon: "check",
    iconColor: "#000000", // Black icon
    textColor: "#000000", // Black text
  },
  pending: {
    color: "#FFFFFF", // White background
    icon: "clock",
    iconColor: "#FFC107", // Yellow icon
    textColor: "#000000", // Black text
    borderColor: "#FFC107", // Yellow border
  },
  denied: {
    color: "#000000", // Black background
    icon: "close",
    iconColor: "#FFFFFF", // White icon
    textColor: "#FFFFFF", // White text
  },
  completed: {
    color: "#FFC107", // Government yellow
    icon: "check-all",
    iconColor: "#000000", // Black icon
    textColor: "#000000", // Black text
  },
  // Support legacy status names as well
  Pending: {
    color: "#FFFFFF", // White background
    icon: "clock",
    iconColor: "#FFC107", // Yellow icon
    textColor: "#000000", // Black text
    borderColor: "#FFC107", // Yellow border
  },
  "In Progress": {
    color: "#FFC107", // Government yellow
    icon: "progress-check",
    iconColor: "#000000", // Black icon
    textColor: "#000000", // Black text
  },
  Completed: {
    color: "#FFC107", // Government yellow
    icon: "check-all",
    iconColor: "#000000", // Black icon
    textColor: "#000000", // Black text
  },
  Approved: {
    color: "#FFC107", // Government yellow
    icon: "check",
    iconColor: "#000000", // Black icon
    textColor: "#000000", // Black text
  },
  Denied: {
    color: "#000000", // Black background
    icon: "close",
    iconColor: "#FFFFFF", // White icon
    textColor: "#FFFFFF", // White text
  },
  // Add more possible variations
  complete: {
    color: "#FFC107", // Government yellow
    icon: "check-all",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
  },
  approve: {
    color: "#4CAF50",
    icon: "check-circle-outline",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
  },
  deny: {
    color: "#616161",
    icon: "close-circle-outline",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
  },
};

export default function RequestCard({
  item,
  substation,
  status,
  date,
  audioURL,
  faultType,
}) {
  const navigation = useNavigation();

  // Support both new item-based props and legacy individual props
  const requestData = item || {
    substation,
    status,
    date,
    audioURL,
    faultType,
    createdAt: date, // Map date to createdAt for consistency
  };

  const handlePress = () => {
    // Convert Date objects to ISO strings for navigation serialization
    const serializedItem = {
      ...requestData,
      createdAt:
        requestData.createdAt instanceof Date
          ? requestData.createdAt.toISOString()
          : requestData.createdAt,
      date:
        requestData.date instanceof Date
          ? requestData.date.toISOString()
          : requestData.date,
    };

    console.log("Navigating to RequestDetails with:", serializedItem);
    try {
      navigation.navigate("RequestDetails", { request: serializedItem });
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Navigation Error", "Unable to open request details");
    }
  };

  const handleDeleteRequest = async () => {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to delete this line clear request? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Get the document ID - use item.id if available, otherwise requestData.id
              const docId = item?.id || requestData?.id;

              if (!docId) {
                Alert.alert("Error", "Cannot delete request: No ID found");
                return;
              }

              // Delete from Firebase
              await deleteDoc(doc(db, "requests", docId));

              Alert.alert("Success", "Request deleted successfully");
              console.log("Request deleted:", docId);
            } catch (error) {
              console.error("Error deleting request:", error);
              Alert.alert(
                "Error",
                "Failed to delete request. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Handle different date formats
  let displayDate;
  if (requestData.createdAt) {
    if (requestData.createdAt.seconds) {
      // Firestore timestamp
      displayDate = new Date(
        requestData.createdAt.seconds * 1000
      ).toLocaleString();
    } else if (requestData.createdAt.toDate) {
      // Firestore timestamp object
      displayDate = requestData.createdAt.toDate().toLocaleString();
    } else {
      // Regular date string or Date object
      displayDate = new Date(requestData.createdAt).toLocaleString();
    }
  } else if (requestData.date) {
    displayDate = new Date(requestData.date).toLocaleString();
  } else {
    displayDate = "No date";
  }

  // Better status handling - try lowercase first, then exact match
  const statusKey = requestData.status?.toLowerCase() || "pending";
  console.log(
    "RequestCard Debug - Status:",
    requestData.status,
    "StatusKey:",
    statusKey,
    "Available in config:",
    statusKey in statusConfig
  );

  const statusInfo = statusConfig[statusKey] ||
    statusConfig[requestData.status] || {
      color: "#BDBDBD",
      icon: "help-circle",
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
    };

  console.log("RequestCard Debug - StatusInfo:", {
    key: statusKey,
    originalStatus: requestData.status,
    foundConfig: statusConfig[statusKey] ? "YES" : "NO",
    icon: statusInfo.icon,
    color: statusInfo.color,
  });

  // Get fault type with better fallback
  const displayFaultType =
    requestData.faultType ||
    requestData.fault_type ||
    requestData.lineType ||
    "No fault type specified";

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Title
        title={requestData.substation || "Unknown Location"}
        subtitle={`Fault: ${displayFaultType}`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon="flash"
            style={{ backgroundColor: "#FFC107" }}
          />
        )}
        right={(props) => (
          <IconButton
            {...props}
            icon="close"
            iconColor="#000000"
            style={{ backgroundColor: "#FFFFFF" }}
            size={20}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering the card press
              handleDeleteRequest();
            }}
            accessibilityLabel="Close request"
          />
        )}
      />
      <Card.Content>
        <View style={styles.detailsRow}>
          <Chip icon="calendar" mode="outlined" style={styles.detailChip}>
            {displayDate}
          </Chip>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: statusInfo.color },
            statusInfo.borderColor && {
              borderWidth: 2,
              borderColor: statusInfo.borderColor,
            },
          ]}
        >
          <IconButton
            icon={statusInfo.icon}
            iconColor={statusInfo.iconColor}
            size={16}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
            {(requestData.status || "PENDING").toUpperCase()}
          </Text>
        </View>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  detailChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  actions: {
    justifyContent: "flex-end",
    paddingRight: 16,
    paddingBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  statusIcon: {
    margin: 0,
    width: 20,
    height: 20,
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontWeight: "bold",
    fontSize: 12,
  },
});
