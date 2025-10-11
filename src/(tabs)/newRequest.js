// File: src/(tabs)/newRequest.js

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { Audio } from "expo-av";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { uploadAudioToCloudinary } from "../../services/cloudinaryService";
import { db, auth } from "../../firebaseConfig"; // Make sure your firebaseConfig exports auth

export default function NewRequestScreen() {
  const [substation, setSubstation] = useState("");
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const theme = useTheme();

  // Function to start audio recording
  async function startRecording() {
    try {
      // Request permission if not already granted
      if (permissionResponse.status !== "granted") {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  }

  // Function to stop audio recording and process the file
  async function stopRecording() {
    console.log("Stopping recording..");
    setIsRecording(false);
    setIsLoading(true); // Show loading spinner
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);

    // 1. Upload the audio file to Cloudinary
    const cloudinaryUrl = await uploadAudioToCloudinary(uri);

    if (cloudinaryUrl && auth.currentUser) {
      // 2. If upload is successful, save the request to Firestore
      try {
        await addDoc(collection(db, "requests"), {
          userId: auth.currentUser.uid,
          substation: substation,
          audioURL: cloudinaryUrl,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        Alert.alert("Success", "Your Line Clear request has been submitted.");
        setSubstation(""); // Clear the input field
      } catch (e) {
        console.error("Error adding document: ", e);
        Alert.alert("Error", "Failed to save your request.");
      }
    } else {
      Alert.alert("Error", "Upload failed. Please try again.");
    }
    setRecording(null);
    setIsLoading(false); // Hide loading spinner
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        New LC Request
      </Text>

      <TextInput
        label="Feeder & Substation"
        value={substation}
        onChangeText={setSubstation}
        style={styles.input}
        disabled={isRecording || isLoading}
      />

      <Button
        mode="contained"
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!substation || isLoading}
        icon={isRecording ? "stop-circle-outline" : "record-circle"}
        style={[
          styles.button,
          isRecording && { backgroundColor: theme.colors.error },
        ]}
        contentStyle={styles.buttonContent}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

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
    padding: 24,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    padding: 8,
  },
  buttonContent: {
    height: 40,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
});
