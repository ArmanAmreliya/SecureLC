import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { Audio } from "expo-audio";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { uploadAudioToCloudinary } from "../../services/cloudinaryService";
import { db, auth } from "../../firebaseConfig"; // Ensure firebaseConfig exports auth

export default function NewRequestScreen() {
  const [substation, setSubstation] = useState("");
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  // 1. Refactored function to handle the actual upload and Firestore save
  async function submitRequest(uri) {
    setIsLoading(true);

    try {
      // Upload the audio file to Cloudinary
      const cloudinaryUrl = await uploadAudioToCloudinary(uri);

      if (cloudinaryUrl && auth.currentUser) {
        // Save the request to Firestore
        await addDoc(collection(db, "requests"), {
          userId: auth.currentUser.uid,
          substation: substation,
          audioURL: cloudinaryUrl,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        Alert.alert("Success", "Your Line Clear request has been submitted.");
        setSubstation(""); // Clear the input field
      } else {
        Alert.alert(
          "Error",
          "Upload failed. Please check your connection and Cloudinary logs."
        );
      }
    } catch (e) {
      console.error("Error during submission process: ", e);
      Alert.alert(
        "Error",
        "A critical error occurred while saving your request."
      );
    } finally {
      setRecording(null);
      setIsLoading(false); // Hide loading spinner
    }
  }

  // Function to start audio recording
  async function startRecording() {
    if (!substation.trim()) {
      Alert.alert(
        "Required",
        "Please enter the Feeder & Substation before starting the recording."
      );
      return;
    }

    try {
      // Request permissions for recording
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission", "Audio recording permission is required.");
        return;
      }

      console.log("Starting recording..");
      const recording = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  }

  // Function to stop audio recording and trigger the confirmation pop-up
  async function stopRecording() {
    console.log("Stopping recording...");

    // Stop and unload the recording immediately to get the URI.
    // This must happen before the Alert, as Alert is asynchronous.
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // 2. Implement the Confirmation Pop-up (Alert.alert)
    Alert.alert(
      "Confirm Submission",
      "Submit this Line Clear request?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Submission cancelled. Discarding recording.");
            // Reset state without submitting the data
            setIsRecording(false);
            setRecording(null);
          },
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: () => {
            // ONLY execute submission logic if the user taps 'Submit'
            setIsRecording(false); // Reset recording state immediately
            submitRequest(uri);
          },
        },
      ],
      { cancelable: false }
    );
  }

  // Conditional Style for Visual Feedback (Pulsing Effect)
  const recordButtonStyle = [
    styles.button,
    // Change to red/error color when recording
    isRecording && { backgroundColor: theme.colors.error },
    // Apply visual "pulse" via shadow/elevation change
    isRecording && styles.recordingActiveStyle,
  ];

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        New LC Request
      </Text>

      {/* 3. Feeder & Substation TextInput is DISABLED during recording */}
      <TextInput
        label="Feeder & Substation"
        value={substation}
        onChangeText={setSubstation}
        style={styles.input}
        // KEY PROP: Disabled if recording or loading
        disabled={isRecording || isLoading}
      />

      {/* Main Record Button */}
      <Button
        mode="contained"
        onPress={isRecording ? stopRecording : startRecording}
        // Disabled when loading OR when not recording and the input is empty
        disabled={isLoading || (!isRecording && !substation.trim())}
        icon={isRecording ? "stop-circle-outline" : "record-circle"}
        style={recordButtonStyle}
        contentStyle={styles.buttonContent}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      {/* Optional: Visual Status Text */}
      {isRecording && (
        <Text style={{ ...styles.statusText, color: theme.colors.error }}>
          🔴 Recording in progress...
        </Text>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={styles.loadingText}>Submitting request...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 12,
    padding: 8,
  },
  buttonContent: {
    height: 40,
  },
  // Visual Indicator for Active Recording ("Pulsing" effect via shadow)
  recordingActiveStyle: {
    shadowColor: "red",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  statusText: {
    marginTop: 15,
    textAlign: "center",
    fontWeight: "600",
  },
});
