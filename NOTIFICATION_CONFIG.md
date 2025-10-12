# Push Notification Configuration

## Current Status
Push notifications are temporarily disabled in Expo Go due to SDK 53+ limitations.

## For Production/Development Builds
When creating a production build or development build (not Expo Go), add this to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#FFC107",
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

## What Works Now
✅ App runs without notification errors in Expo Go
✅ Notification service gracefully handles Expo Go limitation
✅ All other features (audio recording, Firebase, etc.) work perfectly
✅ Ready for production build with notifications

## Next Steps for Full Notification Support
1. Create a development build: `npx expo run:android` or `npx expo run:ios`
2. Add the plugin configuration back to app.json
3. Test push notifications in the development build

## Backend Setup
The Firebase Cloud Function template is ready in `firebase-functions-template.js` for when notifications are fully enabled.