import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View as RNView,
  StyleSheet,
  Vibration,
  Platform,
} from "react-native";
import RingAnimation from "../components/RingAnimation";
import { Text, TouchableOpacity } from "../uikit";
import { useTheme } from "../theme";

export default function RingDetection({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [status, setStatus] = useState("searching");

  useEffect(() => {
    const t = setTimeout(() => {
      setStatus("detected");
      // Skip vibration on web platform (causes browser security warnings)
      // Vibration only works on native mobile apps
      if (Platform.OS !== "web") {
        try {
          Vibration.vibrate(50);
        } catch (e) {
          console.warn("[RingDetection] Vibration not available:", e.message);
        }
      }
    }, 2300);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate("SecurePairing");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <RNView style={styles.inner}>
        <RingAnimation size={160} glow={status === "detected"} />
        <Text style={[styles.title, { color: theme.text }]}>
          Bring your ring close
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          We're looking for your Cosmic Ring
        </Text>
        <Text
          style={[
            styles.status,
            {
              color:
                status === "detected" ? theme.secondary : theme.textSecondary,
            },
          ]}
        >
          {status === "searching" ? "Searching…" : "Ring detected ✓"}
        </Text>
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor:
                status === "detected" ? theme.secondary : theme.card,
            },
          ]}
          onPress={handleContinue}
          disabled={status !== "detected"}
        >
          <Text style={[styles.btnText, { color: theme.textOnDark }]}>
            Continue
          </Text>
        </TouchableOpacity>
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
    status: { marginTop: 16, fontWeight: "600" },
    btn: {
      marginTop: 32,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    btnText: { fontWeight: "700", fontSize: 16 },
  });
