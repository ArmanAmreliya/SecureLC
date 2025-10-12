// File: functions/index.js
// This file should be created in your Firebase Functions directory
// Run 'firebase init functions' in your project root to set up Firebase Functions

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create Expo SDK client
const expo = new Expo();

/**
 * Cloud Function that triggers when a request document is updated
 * Sends push notification when status changes to "approved"
 */
exports.sendApprovalNotification = functions.firestore
  .document("requests/{requestId}")
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();

      // Check if status changed to "approved"
      if (beforeData.status !== "approved" && afterData.status === "approved") {
        console.log("Request approved, sending notification...");

        // Get user document to retrieve push token
        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(afterData.userId)
          .get();

        if (!userDoc.exists) {
          console.log("User document not found");
          return;
        }

        const userData = userDoc.data();
        const pushToken = userData.pushToken;

        if (!pushToken) {
          console.log("No push token found for user");
          return;
        }

        // Verify the push token is valid
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error("Invalid Expo push token:", pushToken);
          return;
        }

        // Create the notification message
        const message = {
          to: pushToken,
          sound: "default",
          title: "✅ Request Approved!",
          body: `Your Line Clear request for ${afterData.substation} has been approved.`,
          data: {
            requestId: context.params.requestId,
            status: "approved",
            substation: afterData.substation,
          },
          channelId: "default",
        };

        // Send the notification
        const ticket = await expo.sendPushNotificationsAsync([message]);
        console.log("Notification sent:", ticket);

        // Optional: Store notification in Firestore for tracking
        await admin.firestore().collection("notifications").add({
          userId: afterData.userId,
          requestId: context.params.requestId,
          title: message.title,
          body: message.body,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          ticket: ticket[0],
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

/**
 * Optional: Function to send test notifications
 * Can be triggered manually for testing purposes
 */
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;

    // Get user's push token
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User document not found"
      );
    }

    const userData = userDoc.data();
    const pushToken = userData.pushToken;

    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid push token"
      );
    }

    // Send test notification
    const message = {
      to: pushToken,
      sound: "default",
      title: "🔔 Test Notification",
      body: "This is a test notification from SecureLC!",
      data: { test: true },
    };

    const ticket = await expo.sendPushNotificationsAsync([message]);

    return { success: true, ticket: ticket[0] };
  } catch (error) {
    console.error("Error sending test notification:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to send test notification"
    );
  }
});
