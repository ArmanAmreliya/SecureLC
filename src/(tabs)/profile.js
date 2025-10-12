import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Avatar,
  Button,
  Divider,
  List,
  Switch,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut, initializing } = useAuth();
  const [enableInAppSounds, setEnableInAppSounds] = useState(true);

  // Generate user initials from email
  const getUserInitials = (email) => {
    if (!email) return "U";
    const name = email.split("@")[0];
    const nameParts = name.split(".");
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (initializing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={getUserInitials(user?.email)}
            style={styles.avatar}
            color="#000000"
            labelStyle={{ color: "#000000", fontSize: 28, fontWeight: "bold" }}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.email?.split("@")[0] || "User"}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email || "No email"}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Email:
            </Text>
            <Text variant="bodyMedium">{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              User ID:
            </Text>
            <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="middle">
              {user?.uid}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Account Created:
            </Text>
            <Text variant="bodyMedium">
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            User Details
          </Text>
          <Divider style={styles.divider} />

          <List.Section>
            <List.Item
              title="Employee ID"
              description="EMP001"
              left={(props) => <List.Icon {...props} icon="badge-account" />}
            />
            <List.Item
              title="Department"
              description="Information Technology"
              left={(props) => <List.Icon {...props} icon="office-building" />}
            />
            <List.Item
              title="Join Date"
              description="January 15, 2023"
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Settings
          </Text>
          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            style={styles.settingButton}
            buttonColor="#FFFFFF"
            textColor="#000000"
            onPress={() => console.log("Notification Settings")}
          >
            Notification Settings
          </Button>

          <Button
            mode="outlined"
            style={styles.settingButton}
            buttonColor="#FFFFFF"
            textColor="#000000"
            onPress={() => console.log("Privacy Settings")}
          >
            Privacy Settings
          </Button>

          <Button
            mode="outlined"
            style={styles.settingButton}
            buttonColor="#FFFFFF"
            textColor="#000000"
            onPress={() => console.log("Change Password")}
          >
            Change Password
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Preferences
          </Text>
          <Divider style={styles.divider} />

          <List.Section>
            <List.Item
              title="Enable In-App Sounds"
              description="Play sounds for notifications and interactions"
              left={(props) => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={enableInAppSounds}
                  onValueChange={setEnableInAppSounds}
                  thumbColor={enableInAppSounds ? "#FFC107" : "#FFFFFF"}
                  trackColor={{ false: "#D0D0D0", true: "#000000" }}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={[styles.button, styles.logoutButton]}
        buttonColor="#000000"
        textColor="#FFFFFF"
        icon="logout"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFC107",
    borderRadius: 12,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: "#FFC107",
    borderWidth: 3,
    borderColor: "#000000",
  },
  name: {
    marginBottom: 4,
    textTransform: "capitalize",
    color: "#000000",
    fontWeight: "bold",
    fontSize: 20,
  },
  email: {
    color: "#000000",
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: 8,
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: "#FFC107",
    height: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  label: {
    fontWeight: "600",
    color: "#000000",
    fontSize: 16,
  },
  settingButton: {
    marginBottom: 12,
    borderColor: "#FFC107",
    borderWidth: 2,
    borderRadius: 8,
  },
  button: {
    marginTop: 12,
    borderRadius: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
