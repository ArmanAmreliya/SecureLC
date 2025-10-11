import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, Chip, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

const RequestCard = ({ substation, status, date, audioURL }) => {
  const theme = useTheme();
  const navigation = useNavigation(); // Get the navigation object

  // Function to determine chip style and icon
  const getStatusProps = (currentStatus) => {
    // ... (Your existing getStatusProps logic)
    switch (currentStatus) {
      case "Pending":
        return { color: "orange", icon: "schedule" };
      case "In Progress":
        return { color: "blue", icon: "hourglass-full" };
      case "Completed":
        return { color: "green", icon: "check-circle" };
      default:
        return { color: "gray", icon: "help-outline" };
    }
  };

  const { color, icon } = getStatusProps(status);

  // Function to handle card press
  const handlePress = () => {
    navigation.navigate("RequestDetails", {
      request: {
        substation,
        status,
        date,
        audioURL,
      },
    });
  };

  return (
    // Make the Card pressable
    <Card
      style={styles.card}
      onPress={handlePress} // Use the onPress prop
    >
      <Card.Content>
        {/* Row for Substation and Status */}
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.substationText}>
            Substation: {substation}
          </Text>
          <Chip
            icon={() => <MaterialIcons name={icon} size={18} color="white" />}
            style={[styles.chip, { backgroundColor: color }]}
            textStyle={{ color: "white", fontWeight: "bold" }}
          >
            {status}
          </Chip>
        </View>

        {/* Date/Time Row */}
        <View style={styles.detailRow}>
          <MaterialIcons
            name="event"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodySmall" style={styles.detailText}>
            Date: {new Date(date).toLocaleString()}
          </Text>
        </View>

        {/* Audio Indicator Row (optional) */}
        <View style={styles.detailRow}>
          <MaterialIcons
            name="mic"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodySmall" style={styles.detailText}>
            Audio Attached: {audioURL ? "Yes" : "No"}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2, // Shadow for Android
    shadowOpacity: 0.1, // Shadow for iOS
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  substationText: {
    flexShrink: 1, // Allows the text to wrap if needed
  },
  chip: {
    height: 32,
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    marginLeft: 4,
  },
});

export default RequestCard;
