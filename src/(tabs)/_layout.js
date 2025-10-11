import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { Platform } from "react-native";

import HomeScreen from "./index.js";
import NewRequestScreen from "./newRequest.js";
import ProfileScreen from "./profile.js";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Tab Bar Styling
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
        // Header Styling
        headerStyle: {
          backgroundColor: "#F6F6F6", // Light clean gray
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#E8E0D5", // Neutral accent
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
          color: "#1C1C1E", // Almost black
        },
        headerTitleAlign: "center",
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerTitle: "SecureLC Home",
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
