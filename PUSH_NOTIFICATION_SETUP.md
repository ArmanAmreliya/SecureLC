# Push Notification Setup Instructions

## Frontend Setup (Completed ✅)

The following has been implemented in your app:

1. **Notification Service** (`src/services/notificationService.js`)
   - Requests notification permissions
   - Gets Expo push token
   - Saves token to Firestore user document

2. **Login Integration** (`src/(auth)/login.js`)
   - Automatically sets up notifications after successful login
   - Saves push token to user's Firestore document

3. **App Configuration** (`app.json`)
   - Added expo-notifications plugin configuration
   - Set notification icon and color

## Backend Setup (Requires Senior Developer)

### Prerequisites

1. **Install Firebase CLI** (if not already done):
   ```bash
   npm install -g firebase-cli
   firebase login
   ```

2. **Initialize Firebase Functions**:
   ```bash
   cd C:\Projects\SecureLC\SecureLC
   firebase init functions
   ```
   - Select JavaScript
   - Install dependencies when prompted

3. **Install Required Dependencies**:
   ```bash
   cd functions
   npm install expo-server-sdk
   ```

### Implementation Steps

1. **Copy the Cloud Function Code**:
   - Copy the contents of `firebase-functions-template.js` to `functions/index.js`

2. **Deploy the Functions**:
   ```bash
   firebase deploy --only functions
   ```

3. **Test the Setup**:
   - Login to the app to register push token
   - Manually change a request status to "approved" in Firebase Console
   - Check if notification is received

### Testing

1. **Test Push Token Registration**:
   - Login to the app
   - Check Firebase Console → Firestore → users collection
   - Verify user document has `pushToken` field

2. **Test Notification Function**:
   - Create a test request
   - Manually change status to "approved" in Firestore
   - Check device for notification

### Troubleshooting

1. **No Push Token Saved**:
   - Check device permissions for notifications
   - Verify internet connection during login
   - Check console logs for errors

2. **Notifications Not Received**:
   - Verify Cloud Function is deployed successfully
   - Check Function logs in Firebase Console
   - Ensure Expo push token is valid
   - Check device notification settings

3. **Invalid Push Token Error**:
   - Update to latest Expo SDK
   - Ensure app is running on physical device (not simulator for push notifications)

### Security Considerations

1. **Firestore Rules**: Ensure users can only read/write their own documents
2. **Function Security**: Cloud Functions automatically authenticate with Firebase Admin SDK
3. **Token Management**: Push tokens are automatically refreshed by Expo

### Future Enhancements

1. **Notification Categories**: Add different notification types (denied, completed)
2. **Notification History**: Store sent notifications for user reference
3. **Notification Preferences**: Allow users to customize notification settings
4. **Rich Notifications**: Add action buttons for quick responses