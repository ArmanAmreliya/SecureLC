import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Avatar, Button, Divider } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { signOutUser } from "../../services/authService";

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Icon size={80} icon="account" style={styles.avatar} />
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
            Settings
          </Text>
          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            style={styles.settingButton}
            onPress={() => console.log("Notification Settings")}
          >
            Notification Settings
          </Button>

          <Button
            mode="outlined"
            style={styles.settingButton}
            onPress={() => console.log("Privacy Settings")}
          >
            Privacy Settings
          </Button>

          <Button
            mode="outlined"
            style={styles.settingButton}
            onPress={() => console.log("Change Password")}
          >
            Change Password
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={[styles.button, styles.logoutButton]}
        buttonColor="#d32f2f"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
    textTransform: "capitalize",
  },
  email: {
    color: "#666",
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontWeight: "600",
    color: "#333",
  },
  settingButton: {
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
});
