// Notification Service for SecureLC
// Note: Push notifications are not supported in Expo Go for SDK 53+
// This service gracefully handles the limitation and works in production builds

import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

// Simple flag to check if notifications are supported
let notificationsSupported = false;
let Notifications = null;
let Constants = null;

// Try to import notification modules safely
try {
  // Only import if not in Expo Go environment
  if (typeof __DEV__ === "undefined" || !__DEV__) {
    Notifications = require("expo-notifications");
    Constants = require("expo-constants").default;
    notificationsSupported = true;
  } else {
    console.log("Development mode: Notifications will be skipped in Expo Go");
  }
} catch (error) {
  console.log(
    "Notifications not available in this environment:",
    error.message
  );
  notificationsSupported = false;
}

// Configure notification handler only if supported
if (notificationsSupported && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Requests notification permissions and gets the Expo push token
 * @returns {Promise<string|null>} The Expo push token or null if failed
 */
export async function requestNotificationPermissions() {
  try {
    // Check if notifications are supported in this environment
    if (!notificationsSupported || !Notifications) {
      console.log(
        "Push notifications are not supported in this environment (Expo Go SDK 53+)"
      );
      return null;
    }

    // Request permission for notifications
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    // Get the push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "your-expo-project-id", // Replace with your actual Expo project ID
    });

    console.log("Expo Push Token:", token.data);
    return token.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Saves the push token to the user's document in Firestore
 * @param {string} pushToken - The Expo push token
 */
export async function savePushTokenToFirestore(pushToken) {
  try {
    if (!auth.currentUser || !pushToken) {
      console.log("No authenticated user or push token");
      return;
    }

    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "users", userId);

    // Check if user document exists, if not create it
    const userDoc = await getDoc(userDocRef);

    const userData = {
      pushToken: pushToken,
      lastTokenUpdate: new Date(),
    };

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, userData);
    } else {
      // Create new document with user info
      await updateDoc(userDocRef, {
        ...userData,
        email: auth.currentUser.email,
        createdAt: new Date(),
      });
    }

    console.log("Push token saved to Firestore successfully");
  } catch (error) {
    console.error("Error saving push token to Firestore:", error);
  }
}

/**
 * Complete setup for push notifications - requests permission and saves token
 */
export async function setupPushNotifications() {
  try {
    // Check if notifications are supported
    if (!notificationsSupported) {
      console.log(
        "📱 Running in Expo Go - Push notifications will be available in production build"
      );
      return null;
    }

    const pushToken = await requestNotificationPermissions();

    if (pushToken) {
      await savePushTokenToFirestore(pushToken);
      return pushToken;
    }

    return null;
  } catch (error) {
    console.error("Error setting up push notifications:", error);
    return null;
  }
}

/**
 * Listen for notification responses (when user taps on notification)
 */
export function addNotificationResponseListener(callback) {
  if (!notificationsSupported || !Notifications) {
    console.log("Notification listeners not available in this environment");
    return null;
  }
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Listen for notifications received while app is in foreground
 */
export function addNotificationReceivedListener(callback) {
  if (!notificationsSupported || !Notifications) {
    console.log("Notification listeners not available in this environment");
    return null;
  }
  return Notifications.addNotificationReceivedListener(callback);
}
