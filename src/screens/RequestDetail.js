import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native"; // <-- IMPORTANT: To read parameters
import { Audio } from "expo-audio"; // <-- IMPORTANT: For bonus audio playback

const RequestDetail = () => {
  const route = useRoute();
  const theme = useTheme();

  // State for audio playback
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // --- TASK 2 REQUIREMENT: Extract parameters passed from RequestCard ---
  const { substation, status, date, audioURL } = route.params || {};

  // Helper function for status styling
  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return "orange";
      case "In Progress":
        return "blue";
      case "Completed":
        return "green";
      default:
        return "gray";
    }
  };

  // --- BONUS: Audio Playback Logic ---
  async function playSound() {
    if (!audioURL) {
      Alert.alert(
        "No Audio",
        "This request does not have an audio file attached."
      );
      return;
    }

    try {
      setIsBuffering(true);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const newSound = await Audio.Sound.createAsync({ uri: audioURL });

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsBuffering(status.isBuffering || false);
          setIsPlaying(status.isPlaying || false);
          if (status.didJustFinish) {
            setIsPlaying(false);
            newSound.unloadAsync();
            setSound(null);
          }
        }
      });

      await newSound.playAsync();
      setSound(newSound);
    } catch (error) {
      console.error("Error playing sound:", error);
      Alert.alert(
        "Audio Error",
        "Could not play the audio file. Check the URL and network connection."
      );
      setIsBuffering(false);
      setIsPlaying(false);
    }
  }

  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }

  // Cleanup: unload audio when screen is left
  React.useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Handle case where params are missing (shouldn't happen with proper navigation)
  if (!substation) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text variant="titleMedium">Error: Request details not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.detailCard}>
        <Card.Content>
          {/* Substation */}
          <View style={styles.infoRow}>
            <Text variant="titleLarge" style={styles.label}>
              Substation:
            </Text>
            <Text variant="headlineSmall">{substation}</Text>
          </View>

          {/* Status */}
          <View style={styles.infoRow}>
            <Text variant="titleLarge" style={styles.label}>
              Status:
            </Text>
            <Text
              variant="headlineSmall"
              style={{ color: getStatusColor(status), fontWeight: "bold" }}
            >
              {status}
            </Text>
          </View>

          {/* Date/Time */}
          <View style={styles.infoRow}>
            <Text variant="titleLarge" style={styles.label}>
              Date & Time:
            </Text>
            <Text variant="bodyLarge">{new Date(date).toLocaleString()}</Text>
          </View>

          {/* Audio Playback Section */}
          <View style={styles.audioSection}>
            <Text variant="titleLarge" style={styles.label}>
              Audio Recording:
            </Text>

            <Button
              icon={isPlaying ? "stop" : "play-arrow"}
              mode="contained"
              onPress={isPlaying ? stopSound : playSound}
              disabled={isBuffering || !audioURL}
              loading={isBuffering}
              style={{ backgroundColor: theme.colors.primary, marginTop: 10 }}
            >
              {isBuffering
                ? "Loading..."
                : isPlaying
                ? "Stop Audio"
                : "Play Audio"}
            </Button>

            {!audioURL && (
              <Text
                variant="bodySmall"
                style={{ marginTop: 8, color: theme.colors.error }}
              >
                No audio file available for this request.
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  detailCard: {
    elevation: 4,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    color: "gray",
    marginBottom: 4,
  },
  audioSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});

export default RequestDetail;
