# GPS Tracking Implementation for SecureLC Lineman App

## 🎯 **Overview**
Complete GPS tracking system for field workers (linemen) during active line clear operations. Location data is stored in real-time to Firestore for supervisor monitoring via a separate web application.

## 📱 **Lineman App Features**

### **GPS Tracking Functionality**
- ✅ **Automatic location permissions** - Requests both foreground and background location access
- ✅ **Real-time GPS tracking** - Updates every 30 seconds or 10 meters movement
- ✅ **Battery optimized** - Uses high accuracy mode with smart intervals
- ✅ **Background tracking** - Continues tracking when app is minimized
- ✅ **Visual feedback** - Shows GPS status, coordinates, and accuracy
- ✅ **Manual controls** - Start/stop GPS tracking buttons
- ✅ **Request association** - Links GPS data to active line clear requests

### **Location Data Storage**
All location data is automatically saved to Firestore with the following structure:

```javascript
// Collection: "locations"
{
  userId: "user_auth_id",
  userEmail: "lineman@company.com",
  requestId: "active_request_id", // Links to the line clear request
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 5.2, // meters
  altitude: 10.5, // meters (if available)
  heading: 45.0, // degrees (if available)
  speed: 2.3, // m/s (if available)
  timestamp: FirestoreTimestamp, // Server timestamp
  deviceTimestamp: Date, // Device local time
}

// Also updates the request document:
// Collection: "requests"
{
  // ... existing request fields
  lastKnownLocation: {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 5.2,
    timestamp: FirestoreTimestamp
  }
}
```

## 🚀 **How to Use (Lineman)**

### **1. Login and Get Active Request**
- Lineman logs into the app
- When a request is approved (status: "approved"), it becomes an "Active Job"
- The Active Job card appears on the home screen

### **2. Start GPS Tracking**
- In the Active Job card, tap **"Start GPS Tracking"**
- App will request location permissions (allow both options)
- GPS status changes to "GPS Tracking Active" with green indicator
- Current coordinates and accuracy are displayed in real-time

### **3. GPS Runs in Background**
- Location tracking continues even when app is minimized
- Updates every 30 seconds or when moving 10+ meters
- Shows system notification indicating active tracking
- Battery optimized for all-day use

### **4. Complete Job**
- When work is finished, tap **"Mark as Complete"**
- This automatically stops GPS tracking
- Final location is saved with job completion

## 🛠 **Technical Implementation**

### **Core Components**

#### **1. Location Service (`services/locationService.js`)**
- `startGPSTracking(requestId)` - Begins location tracking for a request
- `stopGPSTracking()` - Stops location tracking
- `getCurrentLocation()` - Gets single location point
- `saveLocationToFirestore(location, requestId)` - Saves location data
- `isGPSTrackingActive()` - Checks if tracking is running
- Background task management with TaskManager

#### **2. Home Screen (`src/(tabs)/index.js`)**
- Displays active job card when request is approved
- GPS tracking controls and status display
- Real-time location information
- Integration with location service

#### **3. Permissions (`app.json`)**
```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Track field worker positions during line clear operations",
      "NSLocationAlwaysAndWhenInUseUsageDescription": "Continuous location tracking for safety monitoring"
    }
  },
  "android": {
    "permissions": [
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION", 
      "android.permission.ACCESS_BACKGROUND_LOCATION"
    ]
  }
}
```

## 📊 **Data for Supervisor Web App**

The Firestore collections provide all necessary data for the supervisor web app:

### **Real-time Active Users Query**
```javascript
// Get all users with active requests
db.collection('requests')
  .where('status', '==', 'approved')
  .onSnapshot(/* get active users */);
```

### **Real-time Location Updates Query**
```javascript
// Get latest locations for a specific user
db.collection('locations')
  .where('userId', '==', userId)
  .orderBy('timestamp', 'desc')
  .limit(1)
  .onSnapshot(/* get latest location */);

// Get location history for a request
db.collection('locations')
  .where('requestId', '==', requestId)
  .orderBy('timestamp', 'desc')
  .onSnapshot(/* get location trail */);
```

## 🔧 **Testing Instructions**

### **1. Testing in Expo Go**
```bash
npx expo start --offline
# Scan QR code with Expo Go
```

### **2. Test GPS Functionality**
1. **Login** to the app
2. **Create a new request** (New Request tab)
3. **Approve the request** manually in Firebase Console:
   ```javascript
   // In Firestore, update the request document:
   { status: "approved" }
   ```
4. **Return to Home tab** - Active Job card should appear
5. **Tap "Start GPS Tracking"** - Allow location permissions
6. **Verify GPS status** - Should show "GPS Tracking Active"
7. **Check Firestore** - Location documents should appear in real-time

### **3. Verify Firestore Data**
- Open Firebase Console → Firestore Database
- Check `locations` collection for new documents
- Verify location data structure and timestamps
- Check `requests` collection for `lastKnownLocation` updates

## 🌟 **Production Considerations**

### **Battery Optimization**
- 30-second update intervals balance accuracy with battery life
- 10-meter distance threshold prevents excessive updates
- Background mode shows system notification for transparency

### **Accuracy Requirements**
- High accuracy GPS mode for precise positioning
- Accuracy values stored to assess data quality
- Fallback handling for poor GPS conditions

### **Privacy & Security**
- Location data only collected during active jobs
- Automatic cleanup when job completes
- User email stored for identification

### **Error Handling**
- Graceful permission denial handling
- Network connectivity issues
- GPS hardware problems
- Background task failures

## 🎯 **Ready for Supervisor Web App**

The Firestore database structure provides everything needed for a React-Vite supervisor web application:

- **Real-time user locations** via Firestore listeners
- **Historical location trails** for completed jobs
- **Active job monitoring** with live status updates
- **User identification** via email/userId
- **Request details** linked to location data

The lineman mobile app is now **complete and production-ready** for GPS tracking!