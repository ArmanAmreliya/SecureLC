import * as Notifications from "expo-notifications";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permissions and gets the Expo push token
 * @returns {Promise<string|null>} The Expo push token or null if failed
 */
export async function requestNotificationPermissions() {
  try {
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
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Listen for notifications received while app is in foreground
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}
