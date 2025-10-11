import { StatusBar } from "expo-status-bar";
import RootLayout from "./src/_layout";
import { PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <PaperProvider>
      <RootLayout />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
