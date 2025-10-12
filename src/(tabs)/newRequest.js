// File: src/tabs/newRequest.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  IconButton,
  ActivityIndicator,
  useTheme,
  TextInput,
  Button,
  Card,
  Menu,
} from "react-native-paper";
import { Audio } from "expo-av";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { uploadAudioToCloudinary } from "../../services/cloudinaryService";
import { db, auth } from "../../firebaseConfig";
import SuccessOverlay from "../components/SuccessOverlay";

const substationList = [
  { label: "Feeder 1 - Substation A", value: "Feeder 1 - Substation A" },
  { label: "Feeder 2 - Substation A", value: "Feeder 2 - Substation A" },
  { label: "Feeder 3 - Substation B", value: "Feeder 3 - Substation B" },
  { label: "Feeder 4 - Substation C", value: "Feeder 4 - Substation C" },
  { label: "Feeder 5 - Substation C", value: "Feeder 5 - Substation C" },
];

const faultTypeList = [
  { label: "Line Break", value: "Line Break" },
  { label: "Transformer Issue", value: "Transformer Issue" },
  { label: "Pole Damage", value: "Pole Damage" },
  { label: "Insulator Flashover", value: "Insulator Flashover" },
  { label: "Vegetation Interference", value: "Vegetation Interference" },
  { label: "Other", value: "Other" },
];

export default function NewRequestScreen() {
  const [substation, setSubstation] = useState("");
  const [faultType, setFaultType] = useState("");
  const [notes, setNotes] = useState("");

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSound, setAudioSound] = useState(null);

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showSubstationMenu, setShowSubstationMenu] = useState(false);
  const [showFaultTypeMenu, setShowFaultTypeMenu] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    return audioSound
      ? () => {
          audioSound.unloadAsync();
        }
      : undefined;
  }, [audioSound]);

  const resetForm = (isRecordingAgain = false) => {
    setRecordedUri(null);
    setRecording(null);
    if (audioSound) {
      audioSound.unloadAsync();
      setAudioSound(null);
    }
    setIsPlaying(false);
    setIsLoading(false);

    if (!isRecordingAgain) {
      setSubstation("");
      setFaultType("");
      setNotes("");
    }
  };

  async function submitRequest() {
    setIsLoading(true);
    try {
      const cloudinaryUrl = await uploadAudioToCloudinary(recordedUri);
      if (cloudinaryUrl && auth.currentUser) {
        await addDoc(collection(db, "requests"), {
          userId: auth.currentUser.uid,
          substation,
          faultType,
          notes,
          audioURL: cloudinaryUrl,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        setShowSuccessOverlay(true);
      } else {
        Alert.alert("Error", "Upload failed. Please try again.");
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Error submitting request:", e);
      Alert.alert("Error", "Failed to save your request.");
      setIsLoading(false);
    }
  }

  const handleSuccessOverlayDismiss = () => {
    setShowSuccessOverlay(false);
    resetForm();
  };

  // --- All other functions (play/pause, start/stop recording etc.) remain the same ---
  async function playRecording() {
    if (!recordedUri) return;
    try {
      if (audioSound) await audioSound.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      setAudioSound(sound);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish) setIsPlaying(false);
      });
      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing recording:", error);
    }
  }

  async function pauseRecording() {
    if (audioSound) {
      await audioSound.pauseAsync();
      setIsPlaying(false);
    }
  }

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setIsRecording(false);
      setRecording(null);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }

  const handleRecordButtonPress = () => {
    if (isRecording) stopRecording();
    else {
      if (!substation.trim() || !faultType.trim()) {
        Alert.alert(
          "Required",
          "Please select a Feeder/Substation and Fault Type."
        );
        return;
      }
      startRecording();
    }
  };

  return (
    <>
      <SuccessOverlay
        visible={showSuccessOverlay}
        onDismiss={handleSuccessOverlayDismiss}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Feeder & Substation Dropdown */}
        <Menu
          visible={showSubstationMenu}
          onDismiss={() => setShowSubstationMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowSubstationMenu(true)}
              disabled={isRecording || isLoading}
              style={[styles.input, substation ? styles.selectedInput : {}]}
              contentStyle={styles.dropdownButton}
              labelStyle={substation ? styles.selectedText : {}}
              buttonColor="#FFFFFF"
              textColor={substation ? "#000000" : "#79747E"}
              outlineColor="#FFC107"
            >
              {substation || "Select Feeder & Substation"}
            </Button>
          }
        >
          {substationList.map((item) => (
            <Menu.Item
              key={item.value}
              onPress={() => {
                setSubstation(item.value);
                setShowSubstationMenu(false);
              }}
              title={item.label}
            />
          ))}
        </Menu>

        {/* Line Fault Type Dropdown */}
        <Menu
          visible={showFaultTypeMenu}
          onDismiss={() => setShowFaultTypeMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowFaultTypeMenu(true)}
              disabled={isRecording || isLoading}
              style={[styles.input, faultType ? styles.selectedInput : {}]}
              contentStyle={styles.dropdownButton}
              labelStyle={faultType ? styles.selectedText : {}}
              buttonColor="#FFFFFF"
              textColor={faultType ? "#000000" : "#79747E"}
              outlineColor="#FFC107"
            >
              {faultType || "Select Line Fault Type"}
            </Button>
          }
        >
          {faultTypeList.map((item) => (
            <Menu.Item
              key={item.value}
              onPress={() => {
                setFaultType(item.value);
                setShowFaultTypeMenu(false);
              }}
              title={item.label}
            />
          ))}
        </Menu>

        <TextInput
          label="Additional Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          mode="outlined"
          style={styles.notesInput}
          activeOutlineColor={theme.colors.primary}
          outlineColor={theme.colors.primary}
          disabled={isRecording || isLoading}
        />

        <View style={styles.centerContent}>
          {isLoading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : recordedUri ? (
            <Card style={styles.audioReviewCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Review Your Recording
                </Text>
                <Text variant="bodyMedium" style={styles.cardSubtitle}>
                  Listen to your voice note and choose an action below.
                </Text>

                <View style={styles.audioPlayerSection}>
                  <IconButton
                    icon={isPlaying ? "pause-circle" : "play-circle"}
                    size={80}
                    iconColor="#FFC107"
                    onPress={isPlaying ? pauseRecording : playRecording}
                  />
                </View>

                <View style={styles.actionButtonsRow}>
                  <View style={styles.actionButtonContainer}>
                    <IconButton
                      icon="refresh"
                      size={40}
                      mode="contained"
                      containerColor="#F6F6F6"
                      iconColor="#79747E"
                      onPress={() => resetForm(true)}
                    />
                    <Text variant="labelMedium" style={styles.actionLabel}>
                      Record Again
                    </Text>
                  </View>

                  <View style={styles.actionButtonContainer}>
                    <IconButton
                      icon="check"
                      size={40}
                      mode="contained"
                      containerColor="#FFC107"
                      iconColor="#000000"
                      onPress={submitRequest}
                    />
                    <Text variant="labelMedium" style={styles.actionLabel}>
                      Submit Request
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ) : (
            <>
              <Text variant="headlineSmall" style={styles.title}>
                {isRecording ? "Recording..." : "Tap to Record"}
              </Text>
              <IconButton
                icon={isRecording ? "stop" : "microphone"}
                mode="contained"
                size={80}
                onPress={handleRecordButtonPress}
                disabled={!substation || !faultType}
                containerColor={isRecording ? "#000000" : "#FFC107"}
                iconColor={isRecording ? "#FFFFFF" : "#000000"}
                style={styles.recordButton}
              />
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  input: {
    marginBottom: 20,
  },
  notesInput: {
    marginBottom: 20,
    backgroundColor: "#FFFBF0",
  },
  selectedInput: {
    backgroundColor: "#FFF8E1", // theme.colors.primaryContainer
    borderColor: "#FFC107", // theme.colors.primary
    borderWidth: 2,
  },
  selectedText: {
    color: "#271B00", // theme.colors.onPrimaryContainer
    fontWeight: "600",
  },
  notesWithContent: {
    backgroundColor: "#FFF8E1", // theme.colors.primaryContainer
    borderColor: "#FFC107", // theme.colors.primary
    borderWidth: 2,
  },
  dropdownButton: {
    justifyContent: "flex-start",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    minHeight: 250,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  audioReviewCard: {
    width: "100%",
    paddingVertical: 16,
    marginBottom: 16,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  cardSubtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  audioPlayerSection: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  actionButtonContainer: {
    alignItems: "center",
  },
  actionLabel: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
});
