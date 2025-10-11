# SecureLC - Secure Learning Center

A React Native app built with Expo featuring Firebase authentication, biometric login, and secure file management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm package manager
- Expo CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArmanAmreliya/SecureLC.git
   cd SecureLC
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Start the development server**
   ```bash
   # Using npm
   npm start
   
   # Or using expo directly
   npx expo start
   ```

4. **Open the app**
   - Scan the QR code with Expo Go app on your mobile device
   - Press `w` to open in web browser
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 🔐 Login Credentials

### Test Account
To test the app, you'll need to create a Firebase user account first:

**Method 1: Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `lc-a6271` project
3. Navigate to **Authentication** → **Users**
4. Click **Add user** and create:
   - **Email**: `test@securelc.com`
   - **Password**: `password123`

**Method 2: Use these pre-configured credentials** (if already created):
- **Employee ID**: `test@securelc.com`
- **Password**: `password123`

### Biometric Login
- Available on devices with fingerprint/face recognition enabled
- Must have biometrics enrolled on the device
- Provides quick access after initial email/password login

## 📱 Features

- **Firebase Authentication**: Secure email/password login
- **Biometric Authentication**: Fingerprint/Face ID support
- **File Upload**: Cloudinary integration for audio/media files
- **Responsive UI**: React Native Paper components
- **Cross-platform**: Works on iOS, Android, and web

## 🛠 Development

### Project Structure
```
SecureLC/
├── src/
│   ├── (auth)/
│   │   └── login.js          # Login screen
│   ├── (tabs)/
│   │   └── index.js          # Home screen
│   └── _layout.js            # App navigation layout
├── services/
│   ├── authService.js        # Firebase auth functions
│   └── cloudinaryService.js  # File upload service
├── context/
│   └── AuthContext.js        # Global auth state
├── firebaseConfig.js         # Firebase configuration
├── App.js                    # Main app component
└── package.json
```

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Start on Android
- `npm run ios` - Start on iOS
- `npm run web` - Start web version

### Environment Setup
The app uses the following services:
- **Firebase**: Authentication and analytics
- **Cloudinary**: Media file uploads (configure `CLOUD_NAME` and `UPLOAD_PRESET` in `services/cloudinaryService.js`)

## 🐛 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

**2. Port 8081 already in use**
```bash
# Start on different port
npx expo start --port 8082
```

**3. Firebase connection errors**
- Verify `firebaseConfig.js` contains correct project credentials
- Check Firebase project settings in console
- Ensure Authentication is enabled in Firebase

**4. "Cannot determine Expo SDK version"**
```bash
# Ensure expo is installed
npm install expo
```

## 📦 Dependencies

### Core
- **expo**: ~54.0.13
- **react**: 19.1.0
- **react-native**: 0.81.4

### Authentication
- **firebase**: ^12.4.0
- **expo-local-authentication**: ^17.0.7

### UI Components
- **react-native-paper**: ^5.14.5

### Utilities
- **axios**: ^1.12.2
- **expo-av**: ^16.0.7

## 🔒 Security Features

- Firebase Authentication with email/password
- Biometric authentication (fingerprint/face recognition)
- Secure token management
- Protected routes (authentication required)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure Firebase project is properly configured
4. Check device/emulator compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and confidential.

---

**Last Updated**: October 11, 2025
**Version**: 1.0.0
Lineman Mobile App
