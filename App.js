import { StatusBar } from "expo-status-bar";
import RootLayout from "./src/_layout";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./theme"; // <-- IMPORT YOUR NEW THEME

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <RootLayout />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
