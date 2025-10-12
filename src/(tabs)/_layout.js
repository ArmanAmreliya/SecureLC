import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Import for stack navigation
import { FontAwesome5 } from "@expo/vector-icons";
import { Platform } from "react-native";

// Import Screens
import HomeScreen from "./index.js";
import NewRequestScreen from "./newRequest.js";
import ProfileScreen from "./profile.js";
import RequestDetailScreen from "../screens/RequestDetail.js"; // Import the new screen

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator(); // Create the Stack Navigator for the Home tab

// Define the Stack Navigator for the 'Home' Tab
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{
          headerTitle: "SecureLC Home",
          headerStyle: {
            backgroundColor: "#F6F6F6",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 3,
            borderBottomColor: "#FFC107",
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#1C1C1E",
            letterSpacing: 0.5,
          },
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="RequestDetails"
        component={RequestDetailScreen}
        options={({ route }) => ({
          // Customize the header title with a detail or use a default
          headerTitle: route.params?.request?.substation || "Request Details",
          headerBackTitle: "Back", // Optional: Custom back button title
          headerStyle: {
            backgroundColor: "#F6F6F6",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 3,
            borderBottomColor: "#FFC107",
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#1C1C1E",
            letterSpacing: 0.5,
          },
          headerTitleAlign: "center",
        })}
      />
    </HomeStack.Navigator>
  );
}

export default function TabsLayout() {
  // Common header options to apply to all Stack Navigators nested in tabs
  const commonHeaderOptions = {
    headerStyle: {
      backgroundColor: "#F6F6F6", // Light clean gray
      elevation: 2,
      shadowOpacity: 0.1,
      borderBottomWidth: 2, // Thicker yellow line to match New Request
      borderBottomColor: "#FFC107", // Yellow accent line
    },
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1C1C1E", // Almost black
      letterSpacing: 0.5,
    },
    headerTitleAlign: "center",
  };

  return (
    <Tab.Navigator
      screenOptions={{
        // Tab Bar Styling (remains the same)
        tabBarActiveTintColor: "#FFC107", // Professional gold/amber
        tabBarInactiveTintColor: "#79747E", // Muted gray
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // Pure white
          borderTopWidth: 1,
          borderTopColor: "#E8E0D5", // Neutral accent
          paddingBottom: Platform.OS === "ios" ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === "ios" ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        // IMPORTANT: Move common header styling to the nested stacks,
        // but keep the tab header options for NewRequestScreen and ProfileScreen
        ...commonHeaderOptions, // Apply common header options
      }}
    >
      <Tab.Screen
        name="homeStack" // Rename the tab screen name
        component={HomeStackScreen} // Use the new Stack Navigator component
        options={{
          title: "Home",
          headerShown: false, // Hide the header for the Tab.Screen, the Stack will show its own header
          tabBarIcon: ({ color, size = 24 }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="newRequest"
        component={NewRequestScreen}
        options={{
          title: "New Request",
          headerTitle: "New Request",
          tabBarIcon: ({ color, size = 24 }) => (
            <FontAwesome5 name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size = 24 }) => (
            <FontAwesome5 name="user-alt" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
