// File: theme.js
import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme, // Inherit default values
  colors: {
    ...DefaultTheme.colors, // Inherit default colors

    // --- Your Custom Professional Yellow Palette ---

    // Primary color (buttons, active elements)
    primary: "#FFC107", // A strong, professional gold/amber
    onPrimary: "#000000", // Black text on primary buttons

    // Background color of screens
    background: "#F6F6F6", // A very light, clean gray

    // Surface color (cards, dialogs, menus)
    surface: "#FFFFFF", // Pure white
    onSurface: "#1C1C1E", // Almost black for text

    // Accent colors for containers, etc.
    primaryContainer: "#FFF8E1", // A light cream/yellow for backgrounds
    onPrimaryContainer: "#271B00",

    secondaryContainer: "#E8E0D5", // A neutral accent
    onSecondaryContainer: "#1E1B16",

    // Outline color for text inputs, etc.
    outline: "#79747E",
  },
};
