import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "./src/lib/authContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

// App Screens
import Home from "./src/screens/Home";
import Payments from "./src/screens/Payments";
import Insights from "./src/screens/Insights";
import TransactionDetail from "./src/screens/TransactionDetail";
import SafetySecurity from "./src/screens/SafetySecurity";
import RingPage from "./src/screens/RingPage";
import Settings from "./src/screens/Settings";
import Profile from "./src/screens/Profile";
import Offers from "./src/screens/Offers";
import WalletSettings from "./src/screens/WalletSettings";
import TransactionLimits from "./src/screens/TransactionLimits";
import SecuritySettings from "./src/screens/SecuritySettings";
import AppLock from "./src/screens/AppLock";
import Notifications from "./src/screens/Notifications";
import Appearance from "./src/screens/Appearance";
import Support from "./src/screens/Support";
import About from "./src/screens/About";
import Privacy from "./src/screens/Privacy";
import HelpSupport from "./src/screens/HelpSupport";
import { ThemeProvider, useTheme } from "./src/theme";
import BottomTabs from "./src/components/BottomTabs";

// Auth & Setup Screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import RingDetection from "./src/screens/RingDetection";
import SecurePairing from "./src/screens/SecurePairing";
import Personalization from "./src/screens/Personalization";
import UserProfile from "./src/screens/UserProfile";
import OTPVerification from "./src/screens/OTPVerification";
import Complete from "./src/screens/Complete";
import AuthenticationManager from "./src/screens/AuthenticationManager";
import SignUp from "./src/screens/SignUp";
import SignIn from "./src/screens/SignIn";

import { useAuth, SETUP_STAGES } from "./src/lib/authContext";

const Stack = createNativeStackNavigator();

// Auth Stack - for sign up and sign in
function AuthStack() {
  const theme = { background: "#000000" }; // Default fallback

  return (
    <Stack.Navigator
      initialRouteName="SignUp"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: theme.background },
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignIn" component={SignIn} />
    </Stack.Navigator>
  );
}

// Setup Stack - for onboarding and authentication
function SetupStack() {
  const { setupStage } = useAuth();
  const theme = { background: "#000000" }; // Default fallback
  const initialRouteName = "RingDetection";

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: theme.background },
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="RingDetection" component={RingDetection} />

      <Stack.Screen name="SecurePairing" component={SecurePairing} />
      <Stack.Screen name="Personalization" component={Personalization} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Complete" component={Complete} />
    </Stack.Navigator>
  );
}

// Main App Stack - for authenticated users with ring paired
function AppStack({ currentRouteName, onNavigate }) {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "android" ? "none" : "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Payments" component={Payments} />
        <Stack.Screen name="Insights" component={Insights} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
        <Stack.Screen name="Safety" component={SafetySecurity} />
        <Stack.Screen name="Ring" component={RingPage} />
        <Stack.Screen name="RingDetection" component={RingDetection} />
        <Stack.Screen name="SecurePairing" component={SecurePairing} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="Personalization" component={Personalization} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Offers" component={Offers} />
        <Stack.Screen name="WalletSettings" component={WalletSettings} />
        <Stack.Screen name="TransactionLimits" component={TransactionLimits} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
        <Stack.Screen name="AppLock" component={AppLock} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Appearance" component={Appearance} />
        <Stack.Screen name="Support" component={Support} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="HelpSupport" component={HelpSupport} />
        <Stack.Screen name="Authentication" component={AuthenticationManager} />
      </Stack.Navigator>
      <BottomTabs currentRouteName={currentRouteName} onNavigate={onNavigate} />
    </View>
  );
}

// Root Navigator - Handles switching between Auth, Setup and Main App
function RootNavigator({ navigationRef, currentRouteName }) {
  const { authLoading, user, setupStage } = useAuth();

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#BFA668" />
      </View>
    );
  }

  // Show auth stack if no user is authenticated
  if (!user) {
    return <AuthStack />;
  }

  // Show setup stack if user exists but setup is not complete
  const isSetupComplete = setupStage === SETUP_STAGES.COMPLETE;
  if (!isSetupComplete) {
    return <SetupStack />;
  }

  // Show main app if user exists AND setup is complete
  return (
    <AppStack
      currentRouteName={currentRouteName}
      onNavigate={(name) => navigationRef.current?.navigate(name)}
    />
  );
}

export default function App() {
  const navigationRef = useRef(null);
  const [currentRouteName, setCurrentRouteName] = useState(null);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    // Safety timeout to hide splash screen if onReady doesn't fire
    const timeout = setTimeout(async () => {
      if (!splashHidden) {
        console.log("Safety timeout: Hiding splash screen");
        await SplashScreen.hideAsync().catch(() => {});
        setSplashHidden(true);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [splashHidden]);

  // Deep linking configuration
  const linking = {
    prefixes: ["cosmicattire://", "exp://"],
    config: {
      screens: {
        Home: "home",
        Auth: "auth",
        OTPVerification: "otp",
        UserProfile: "profile",
        RingDetection: "ring",
      },
    },
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer
            ref={navigationRef}
            linking={linking}
            fallback={<ActivityIndicator color="#BFA668" />}
            onReady={async () => {
              const route = navigationRef.current?.getCurrentRoute();
              setCurrentRouteName(route?.name || "Home");
              if (!splashHidden) {
                await SplashScreen.hideAsync().catch(() => {});
                setSplashHidden(true);
              }
            }}
            onStateChange={() => {
              const route = navigationRef.current?.getCurrentRoute();
              setCurrentRouteName(route?.name || "Home");
            }}
          >
            {/* We need a consumer to access theme for SafeAreaView background, 
                 or we can move SafeAreaView inside a Child component. 
                 For now, let's use a Wrapper component or just hardcode the root background 
                 since SafeAreaView style needs the theme. 
                 Actually, the prompt said "Ensure NavigationContainer is inside ThemeProvider".
                 Let's create a RootWrapper to handle the themed background. */}
            <RootApp
              navigationRef={navigationRef}
              currentRouteName={currentRouteName}
              setCurrentRouteName={setCurrentRouteName}
            />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

// Separate component to consume theme hook
function RootApp({ navigationRef, currentRouteName, setCurrentRouteName }) {
  const theme = useTheme(); // Now safely inside Provider

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <RootNavigator
        navigationRef={navigationRef}
        currentRouteName={currentRouteName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
