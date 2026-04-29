import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View as RNView,
  StyleSheet,
  Animated,
} from "react-native";
import RingAnimation from "../components/RingAnimation";
import { Text } from "../uikit";
import { useTheme } from "../theme";

export default function SecurePairing({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [prog] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log(
      "[SecurePairing] Navigation object:",
      navigation ? "exists" : "null",
    );

    Animated.timing(prog, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: false,
    }).start(() => {
      console.log(
        "[SecurePairing] Animation completed, waiting 400ms before navigation",
      );
      // After pairing completes, move to profile setup
      setTimeout(() => {
        console.log("[SecurePairing] Attempting to navigate to UserProfile");
        if (navigation && navigation.replace) {
          console.log("[SecurePairing] Using navigation.replace()");
          navigation.replace("UserProfile");
        } else if (navigation && navigation.navigate) {
          console.log("[SecurePairing] Using navigation.navigate()");
          navigation.navigate("UserProfile");
        } else {
          console.error("[SecurePairing] Navigation methods not available!");
        }
      }, 400);
    });
  }, [navigation]);

  const width = prog.interpolate({
    inputRange: [0, 1],
    outputRange: ["6%", "86%"],
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <RNView style={styles.inner}>
        <RingAnimation size={140} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Securing your ring
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Linking your ring to your account
        </Text>
        <Animated.View
          style={[styles.progress, { backgroundColor: theme.secondary, width }]}
        />
      </RNView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    inner: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    title: { fontSize: 20, fontWeight: "700", marginTop: 18 },
    subtitle: { marginTop: 6, color: theme.textSecondary },
    progress: { height: 8, borderRadius: 8, marginTop: 28 },
  });
