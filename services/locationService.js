// GPS Location Service for SecureLC
// Handles real-time location tracking and Firestore integration

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const LOCATION_TASK_NAME = "background-location-task";
const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
const LOCATION_ACCURACY = Location.Accuracy.High;

// Store the current request ID for background task
let currentRequestId = null;
let isTrackingActive = false; // Track GPS status manually

// Background task definition
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    console.log("Background location update:", locations);
    // Save location to Firestore with current request ID
    if (locations && locations.length > 0) {
      saveLocationToFirestore(locations[0], currentRequestId);
    }
  }
});

/**
 * Request location permissions from the user
 * @returns {Promise<boolean>} Permission granted status
 */
export async function requestLocationPermissions() {
  try {
    console.log("🗺️ Requesting location permissions...");

    // Request foreground permissions
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("❌ Foreground location permission denied");
      return false;
    }

    // Request background permissions for continuous tracking
    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus.status !== "granted") {
      console.log("⚠️ Background location permission denied - foreground only");
      // Still return true as foreground permission is sufficient for basic functionality
    }

    console.log("✅ Location permissions granted");
    return true;
  } catch (error) {
    console.error("Error requesting location permissions:", error);
    return false;
  }
}

/**
 * Get the current location of the user
 * @returns {Promise<object|null>} Current location or null if failed
 */
export async function getCurrentLocation() {
  try {
    console.log("📍 Getting current location...");

    const location = await Location.getCurrentPositionAsync({
      accuracy: LOCATION_ACCURACY,
      timeout: 15000,
    });

    console.log("✅ Current location obtained:", {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    });

    return location;
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
}

/**
 * Start GPS tracking for an active job
 * @param {string} requestId - The ID of the active request
 * @returns {Promise<boolean>} Success status
 */
export async function startGPSTracking(requestId) {
  try {
    if (!auth.currentUser) {
      console.log("❌ No authenticated user for GPS tracking");
      return false;
    }

    if (!requestId) {
      console.log("❌ No request ID provided for GPS tracking");
      return false;
    }

    console.log("🚀 Starting GPS tracking for request:", requestId);

    // Store request ID for background task
    currentRequestId = requestId;

    // Check permissions
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.log("❌ Location permissions not granted");
      return false;
    }

    // Get initial location and save it
    const initialLocation = await getCurrentLocation();
    if (initialLocation) {
      await saveLocationToFirestore(initialLocation, requestId);
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: LOCATION_ACCURACY,
      timeInterval: LOCATION_UPDATE_INTERVAL,
      distanceInterval: 10, // Update every 10 meters
      deferredUpdatesInterval: LOCATION_UPDATE_INTERVAL,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "SecureLC GPS Tracking",
        notificationBody: "Tracking location for active line clear request",
      },
    });

    // Mark tracking as active
    isTrackingActive = true;

    console.log("✅ GPS tracking started successfully");
    return true;
  } catch (error) {
    console.error("Error starting GPS tracking:", error);
    return false;
  }
}

/**
 * Stop GPS tracking
 * @returns {Promise<boolean>} Success status
 */
export async function stopGPSTracking() {
  try {
    console.log("🛑 Stopping GPS tracking...");

    // Clear the current request ID
    currentRequestId = null;

    try {
      // Try to stop location updates
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("✅ GPS tracking stopped successfully");
    } catch (stopError) {
      console.log("ℹ️ GPS tracking was not running or already stopped");
    }

    // Mark tracking as inactive
    isTrackingActive = false;

    return true;
  } catch (error) {
    console.error("Error stopping GPS tracking:", error);
    // Mark as inactive even if there was an error
    isTrackingActive = false;
    return false;
  }
}

/**
 * Save location data to Firestore
 * @param {object} location - Location object from expo-location
 * @param {string} requestId - Optional request ID to associate with location
 */
export async function saveLocationToFirestore(location, requestId = null) {
  try {
    if (!auth.currentUser) {
      console.log("❌ No authenticated user to save location");
      return;
    }

    if (!location || !location.coords) {
      console.log("❌ Invalid location data");
      return;
    }

    const locationData = {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      timestamp: serverTimestamp(),
      deviceTimestamp: new Date(location.timestamp),
      requestId: requestId, // Associate with active request if provided
    };

    // Save to locations collection
    await addDoc(collection(db, "locations"), locationData);

    console.log("✅ Location saved to Firestore:", {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      requestId: requestId,
    });

    // If associated with a request, update the request document with latest location
    if (requestId) {
      await updateDoc(doc(db, "requests", requestId), {
        lastKnownLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: serverTimestamp(),
        },
      });
    }
  } catch (error) {
    console.error("Error saving location to Firestore:", error);
  }
}

/**
 * Get real-time location updates for a specific request
 * @param {string} requestId - The request ID to monitor
 * @param {function} callback - Callback function to receive location updates
 * @returns {function} Unsubscribe function
 */
export function subscribeToRequestLocation(requestId, callback) {
  try {
    if (!requestId) {
      console.log("❌ No request ID provided for location subscription");
      return null;
    }

    console.log("📡 Subscribing to location updates for request:", requestId);

    const locationsQuery = query(
      collection(db, "locations"),
      where("requestId", "==", requestId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(locationsQuery, (snapshot) => {
      const locations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(
        `📍 Received ${locations.length} location updates for request ${requestId}`
      );
      callback(locations);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to location updates:", error);
    return null;
  }
}

/**
 * Get all locations for a specific user
 * @param {string} userId - The user ID to get locations for
 * @param {function} callback - Callback function to receive location updates
 * @returns {function} Unsubscribe function
 */
export function subscribeToUserLocations(userId, callback) {
  try {
    if (!userId) {
      console.log("❌ No user ID provided for location subscription");
      return null;
    }

    console.log("📡 Subscribing to location updates for user:", userId);

    const locationsQuery = query(
      collection(db, "locations"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(locationsQuery, (snapshot) => {
      const locations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(
        `📍 Received ${locations.length} location updates for user ${userId}`
      );
      callback(locations);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to user location updates:", error);
    return null;
  }
}

/**
 * Check if GPS tracking is currently active
 * @returns {Promise<boolean>} GPS tracking status
 */
export async function isGPSTrackingActive() {
  try {
    // Use our manual tracking flag instead of TaskManager API
    return isTrackingActive;
  } catch (error) {
    console.error("Error checking GPS tracking status:", error);
    return false;
  }
}

/**
 * Get distance between two coordinates in meters
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
