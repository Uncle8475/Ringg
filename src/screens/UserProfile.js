import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View as RNView,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import RingAnimation from "../components/RingAnimation";
import { Card, Text, TouchableOpacity } from "../uikit";
import { useTheme } from "../theme";
import { useAuth } from "../lib/authContext";
import supabase from "../lib/supabase";
import { getUserProfile, updateUserProfile } from "../lib/dbHelpers";

export default function UserProfile({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { authLoading, user } = useAuth();
  const [fullName, setFullName] = useState("");

  // Sceen Guard: If no user is mapped, show loading to prevent crash
  if (!user && !authLoading) {
    // This might happen momentarily during transition
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <RNView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.secondary} />
        </RNView>
      </SafeAreaView>
    );
  }

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedRingId, setLinkedRingId] = useState("CR-00123");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        console.log("[UserProfile] authLoading:", authLoading);
        if (authLoading) {
          return;
        }

        const { profile } = await getUserProfile();
        if (profile && isMounted) {
          setFullName(profile.full_name || "");

          setPhone(profile.phone || "");
          setEmail(profile.email || "");
          setDesignation(profile.role || "");
          setBio(profile.bio || "");
        }
      } catch (e) {
        console.warn("Unexpected error loading profile", e);
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  const isComplete =
    fullName.trim() &&
    phone.trim() &&
    email.trim() &&
    designation.trim() &&
    bio.trim();

  const isButtonDisabled = !isComplete || saving || authLoading || !user;

  useEffect(() => {
    console.log("[UserProfile] Button state:", {
      isComplete,
      saving,
      authLoading,
      user: user ? "exists" : "null",
      isButtonDisabled,
    });
  }, [isComplete, saving, authLoading, user]);

  const save = async () => {
    console.log("[UserProfile] Save button clicked");
    console.log("[UserProfile] isComplete:", isComplete);
    console.log("[UserProfile] saving:", saving);

    if (!isComplete) {
      console.warn("[UserProfile] Form is incomplete");
      Alert.alert("Incomplete Profile", "Please fill all required fields");
      return;
    }

    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedDesignation = designation.trim();
    const trimmedBio = bio.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      console.warn("[UserProfile] Invalid email format:", trimmedEmail);
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (saving) {
      console.warn("[UserProfile] Already saving, ignoring duplicate click");
      return;
    }
    setSaving(true);

    try {
      console.log("[UserProfile] Calling updateUserProfile with:", {
        full_name: trimmedFullName,
        phone: trimmedPhone,
        email: trimmedEmail,
        role: trimmedDesignation,
        bio: trimmedBio,
        userId: user?.id,
      });

      const { error: saveError } = await updateUserProfile(
        {
          full_name: trimmedFullName,
          phone: trimmedPhone,
          email: trimmedEmail,
          role: trimmedDesignation,
          bio: trimmedBio,
        },
        user?.id,
      );

      if (saveError) {
        console.error("[UserProfile] Save error:", saveError);
        throw new Error(saveError);
      }

      console.log("[UserProfile] Profile saved successfully!");
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            console.log(
              "[UserProfile] Alert OK pressed, navigating to Complete",
            );
            navigation.navigate("Complete");
          },
        },
      ]);
      setProfileLoading(false);
    } catch (e) {
      console.error("[UserProfile] Error during save:", e);
      Alert.alert(
        "Error",
        e.message || "Failed to save profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <RNView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.secondary} />
          <Text style={[styles.loadingText, { color: theme.muted }]}>
            Loading your session...
          </Text>
        </RNView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.inner}
        contentContainerStyle={styles.innerContent}
        showsVerticalScrollIndicator={false}
      >
        <RingAnimation size={100} />

        <Text style={[styles.title, { color: theme.text }]}>Your Profile</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Link your identity to your COSMIC Ring
        </Text>

        {/* Ring Linking Info */}
        <Card style={styles.ringInfo} padding={16}>
          <Text style={[styles.ringLabel, { color: theme.muted }]}>
            Ring ID
          </Text>
          <Text style={[styles.ringValue, { color: theme.text }]}>
            {linkedRingId}
          </Text>
          <Text style={[styles.ringNote, { color: theme.muted }]}>
            This profile will be linked to your COSMIC Ring
          </Text>
        </Card>

        {/* Full Name */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Full Name *</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholderTextColor={theme.textTertiary}
            placeholder="Enter your full name"
          />
        </RNView>

        {/* Phone Number */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Phone Number *
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholderTextColor={theme.textTertiary}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          />
        </RNView>

        {/* Email */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email ID *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor={theme.textTertiary}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </RNView>

        {/* Designation */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Designation / Role *
          </Text>
          <TextInput
            value={designation}
            onChangeText={setDesignation}
            style={styles.input}
            placeholderTextColor={theme.textTertiary}
            placeholder="e.g., Student, Engineer, Manager"
          />
        </RNView>

        {/* Bio */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Bio / About You *
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.inputMultiline]}
            placeholderTextColor={theme.textTertiary}
            placeholder="Tell us about yourself (1-2 lines)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </RNView>

        <Text style={[styles.requiredNote, { color: theme.muted }]}>
          * Required fields
        </Text>
      </ScrollView>

      {/* Button Container */}
      <RNView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: isComplete ? theme.secondary : theme.card,
              opacity: isComplete && !saving ? 1 : 0.6,
            },
          ]}
          disabled={isButtonDisabled}
          onPress={save}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={theme.textOnDark} />
          ) : (
            <Text style={[styles.btnText, { color: theme.textOnDark }]}>
              {isComplete ? "Save and Continue" : "Fill All Required Fields"}
            </Text>
          )}
        </TouchableOpacity>
      </RNView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1 },
    innerContent: {
      justifyContent: "flex-start",
      alignItems: "stretch",
      padding: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      marginTop: 16,
      textAlign: "left",
      width: "100%",
    },
    subtitle: {
      marginTop: 6,
      color: theme.textSecondary,
      textAlign: "left",
      width: "100%",
    },
    ringInfo: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
      width: "100%",
    },
    ringLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
    ringValue: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
    ringNote: { fontSize: 12, lineHeight: 18 },
    fieldGroup: { marginBottom: 18, width: "100%" },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "left",
    },
    helperText: { fontSize: 12, marginTop: 4, lineHeight: 18 },
    input: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 4,
      textAlign: "left",
      backgroundColor: theme.card,
      borderColor: theme.border,
      color: theme.textPrimary,
    },
    inputMultiline: { height: 80 },
    requiredNote: { fontSize: 12, marginTop: 8, fontStyle: "italic" },
    buttonContainer: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      paddingTop: 12,
      width: "100%",
    },
    btn: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
      width: "100%",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    loadingText: { marginTop: 12, fontSize: 14 },
    btnText: { fontWeight: "700", fontSize: 16 },
    btnTextSecondary: {
      color: theme.textOnDark,
      fontWeight: "700",
      fontSize: 14,
    },
  });
