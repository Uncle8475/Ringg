import React, { useEffect, useState } from "react";
import {
  View as RNView,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import { useTheme } from "../theme";
import { Card, Text, Button, TouchableOpacity } from "../uikit";
import { getUserProfile, updateUserProfile } from "../lib/dbHelpers";

const STORAGE_KEY = "userProfile";
const THEME_STORAGE_KEY = "profileTheme";

// Profile accent color presets
const ACCENT_COLORS = [
  { name: "Cosmic Violet", color: "#6D5EF6" },
  { name: "Ocean Blue", color: "#4FA3FF" },
  { name: "Emerald Green", color: "#3DDC97" },
  { name: "Coral Red", color: "#E05A5A" },
  { name: "Sunset Orange", color: "#FF9A56" },
  { name: "Rose Pink", color: "#FF6B9D" },
];

// Profile font presets
const FONT_STYLES = [
  { name: "Default", style: "default" },
  { name: "Serif", style: "serif" },
  { name: "Rounded", style: "rounded" },
];

import { useAuth } from "../lib/authContext";

export default function Profile() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [mode, setMode] = useState("view"); // 'view', 'edit', 'preview'
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    phone: "+91 90000 00000",
    email: "",
    age: "",
    role: "Student",
    bio: "Cosmic Attire ring user.",
    idType: "",
    idNumber: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    ringName: "OmniKey Ring",
    ringId: "CA-1234-5678-9012",
    ringStatus: "Active",
  });
  const [originalProfile, setOriginalProfile] = useState({ ...profile });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileTheme, setProfileTheme] = useState({
    accentColor: "#6D5EF6",
    fontStyle: "default",
  });

  useEffect(() => {
    (async () => {
      try {
        const { profile: loadedProfile } = await getUserProfile();
        if (loadedProfile) {
          setProfile({
            fullName: loadedProfile.full_name || "",
            phone: loadedProfile.phone || "",
            email: loadedProfile.email || "",
            role: loadedProfile.role || "",
            bio: loadedProfile.bio || "",
            idType: "", // Not in schema yet
            idNumber: "", // Not in schema yet
            ringName: "COSMIC Ring",
            ringId: "Linked",
            ringStatus: "Active",
          });
          setOriginalProfile({
            fullName: loadedProfile.full_name || "",
            phone: loadedProfile.phone || "",
            email: loadedProfile.email || "",
            role: loadedProfile.role || "",
            bio: loadedProfile.bio || "",
          });
        }

        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) setProfileTheme(JSON.parse(savedTheme));

        const savedPhoto = await AsyncStorage.getItem("profilePhoto");
        if (savedPhoto) setProfilePhoto(savedPhoto);
      } catch (e) {
        console.warn("Error loading profile:", e);
      }
    })();
  }, []);

  const saveProfile = async () => {
    try {
      const { error } = await updateUserProfile(
        {
          full_name: profile.fullName,
          phone: profile.phone,
          email: profile.email,

          role: profile.role,
          bio: profile.bio,
        },
        user?.id,
      );

      if (error) {
        if (
          error.includes("session missing") ||
          error.includes("Auth session missing")
        ) {
          Alert.alert("Session Expired", "Please log in again.", [
            { text: "OK", onPress: () => logout() },
          ]);
          return;
        }
        throw new Error(error);
      }

      setOriginalProfile({ ...profile });
      setMode("view");
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e) {
      Alert.alert("Error", "Failed to update profile: " + e.message);
    }
  };

  const cancelEdit = () => {
    setProfile({ ...originalProfile });
    setMode("view");
  };

  const saveProfileTheme = async (newTheme) => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
    setProfileTheme(newTheme);
  };

  const handlePhotoAction = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        {
          text: "Add Photo",
          onPress: async () => {
            // Mock image picker - in production use expo-image-picker
            const mockPhoto = "https://i.pravatar.cc/300";
            setProfilePhoto(mockPhoto);
            await AsyncStorage.setItem("profilePhoto", mockPhoto);
            Alert.alert("Success", "Profile photo updated!");
          },
        },
        profilePhoto && {
          text: "Remove Photo",
          style: "destructive",
          onPress: async () => {
            setProfilePhoto(null);
            await AsyncStorage.removeItem("profilePhoto");
          },
        },
        { text: "Cancel", style: "cancel" },
      ].filter(Boolean),
    );
  };

  const maskValue = (v) => {
    if (!v) return "";
    const visible = v.slice(-4);
    return `••••••••${visible}`;
  };

  const getFontFamily = (style) => {
    switch (style) {
      case "serif":
        return "serif";
      case "rounded":
        return "System";
      default:
        return "System";
    }
  };

  // Preview Mode Renderer
  if (mode === "preview") {
    return (
      <RNView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Profile Preview" onBack={() => setMode("view")} />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 90 }}>
          {/* Profile Photo */}
          <RNView style={styles.previewPhotoContainer}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.previewPhoto}
              />
            ) : (
              <RNView
                style={[
                  styles.previewPhotoPlaceholder,
                  { borderColor: profileTheme.accentColor },
                ]}
              >
                <Text
                  style={[
                    styles.previewPhotoText,
                    { color: profileTheme.accentColor },
                  ]}
                >
                  {profile.fullName?.charAt(0) || "U"}
                </Text>
              </RNView>
            )}
          </RNView>

          {/* Name and Role */}
          <Text
            style={[
              styles.previewName,
              {
                color: profileTheme.accentColor,
                fontFamily: getFontFamily(profileTheme.fontStyle),
              },
            ]}
          >
            {profile.fullName || "User Name"}
          </Text>

          <Text
            style={[
              styles.previewRole,
              { fontFamily: getFontFamily(profileTheme.fontStyle) },
            ]}
          >
            {profile.role || "Role"}
          </Text>

          {/* Bio */}
          {profile.bio && (
            <Card
              padding={16}
              style={{
                marginTop: 20,
                borderLeftWidth: 3,
                borderLeftColor: profileTheme.accentColor,
              }}
            >
              <Text
                variant="subtext"
                style={[
                  { marginBottom: 6, color: profileTheme.accentColor },
                  { fontFamily: getFontFamily(profileTheme.fontStyle) },
                ]}
              >
                About
              </Text>
              <Text
                style={{ fontFamily: getFontFamily(profileTheme.fontStyle) }}
              >
                {profile.bio}
              </Text>
            </Card>
          )}

          {/* Contact */}
          <Card padding={16} style={{ marginTop: 12 }}>
            <Text
              variant="subtext"
              style={[
                { marginBottom: 12, color: profileTheme.accentColor },
                { fontFamily: getFontFamily(profileTheme.fontStyle) },
              ]}
            >
              Contact
            </Text>
            {profile.phone && (
              <PreviewRow
                label="Phone"
                value={profile.phone}
                fontStyle={profileTheme.fontStyle}
              />
            )}
            {profile.email && (
              <PreviewRow
                label="Email"
                value={profile.email}
                fontStyle={profileTheme.fontStyle}
              />
            )}
          </Card>

          {/* Ring Info */}
          <Card padding={16} style={{ marginTop: 12 }}>
            <Text
              variant="subtext"
              style={[
                { marginBottom: 12, color: profileTheme.accentColor },
                { fontFamily: getFontFamily(profileTheme.fontStyle) },
              ]}
            >
              Ring Association
            </Text>
            <PreviewRow
              label="Ring Name"
              value={profile.ringName}
              fontStyle={profileTheme.fontStyle}
            />
            <PreviewRow
              label="Status"
              value={profile.ringStatus}
              fontStyle={profileTheme.fontStyle}
            />
          </Card>

          <Text
            variant="subtext"
            style={{ textAlign: "center", marginTop: 24, opacity: 0.5 }}
          >
            This is how your profile appears to others
          </Text>
        </ScrollView>
      </RNView>
    );
  }

  // Main Profile View/Edit Mode
  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 90 }}>
        {/* Profile Photo */}
        <RNView style={styles.photoContainer}>
          {profilePhoto ? (
            <TouchableOpacity onPress={handlePhotoAction}>
              <Image source={{ uri: profilePhoto }} style={styles.photo} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handlePhotoAction}>
              <RNView style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {profile.fullName?.charAt(0) || "+"}
                </Text>
              </RNView>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handlePhotoAction}>
            <Text
              variant="subtext"
              style={{ color: theme.secondary, marginTop: 8 }}
            >
              {profilePhoto ? "Change Photo" : "Add Photo"}
            </Text>
          </TouchableOpacity>
        </RNView>

        {/* Actions */}
        <RNView style={styles.rowActions}>
          {mode === "edit" ? (
            <>
              <Button
                label="Save Changes"
                onPress={saveProfile}
                style={{ flex: 1 }}
              />
              <Button
                label="Cancel"
                variant="secondary"
                onPress={cancelEdit}
                style={{ flex: 1 }}
              />
            </>
          ) : (
            <>
              <Button
                label="Edit Profile"
                onPress={() => setMode("edit")}
                style={{ flex: 1 }}
              />
              <Button
                label="View Profile"
                variant="secondary"
                onPress={() => setMode("preview")}
                style={{ flex: 1 }}
              />
            </>
          )}
        </RNView>

        {/* Personal Information */}
        <Text variant="label" style={styles.sectionTitle}>
          Personal Information
        </Text>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Field
            label="Full Name"
            value={profile.fullName}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, fullName: t })}
          />
          <Field
            label="Phone Number"
            value={profile.phone}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, phone: t })}
          />
          <Field
            label="Email (optional)"
            value={profile.email}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, email: t })}
          />

          <Field
            label="Designation / Role"
            value={profile.role}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, role: t })}
          />
          <Field
            label="Short Bio"
            value={profile.bio}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, bio: t })}
            multiline
          />
        </Card>

        {/* Profile Appearance */}
        <Text variant="label" style={styles.sectionTitle}>
          Profile Appearance
        </Text>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Text variant="subtext" style={{ marginBottom: 12 }}>
            Accent Color
          </Text>
          <RNView style={styles.colorGrid}>
            {ACCENT_COLORS.map((item) => (
              <TouchableOpacity
                key={item.color}
                onPress={() =>
                  saveProfileTheme({ ...profileTheme, accentColor: item.color })
                }
                style={[
                  styles.colorOption,
                  { backgroundColor: item.color },
                  profileTheme.accentColor === item.color &&
                    styles.colorOptionSelected,
                ]}
              >
                {profileTheme.accentColor === item.color && (
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </RNView>

          <Text variant="subtext" style={{ marginBottom: 12, marginTop: 16 }}>
            Font Style
          </Text>
          <RNView style={styles.fontGrid}>
            {FONT_STYLES.map((item) => (
              <TouchableOpacity
                key={item.style}
                onPress={() =>
                  saveProfileTheme({ ...profileTheme, fontStyle: item.style })
                }
                style={[
                  styles.fontOption,
                  profileTheme.fontStyle === item.style && {
                    backgroundColor: "rgba(109,94,246,0.15)",
                    borderColor: theme.accent,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: getFontFamily(item.style),
                    color:
                      profileTheme.fontStyle === item.style
                        ? theme.accent
                        : theme.textSecondary,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </RNView>

          <Text
            variant="subtext"
            style={{ marginTop: 12, opacity: 0.6, fontSize: 12 }}
          >
            These settings apply only to your profile preview
          </Text>
        </Card>

        {/* Identity */}
        <Text variant="label" style={styles.sectionTitle}>
          Identity (Optional)
        </Text>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Field
            label="ID Type"
            value={profile.idType}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, idType: t })}
            placeholder="College / Office / Govt"
          />
          <Field
            label="ID Number"
            value={
              mode === "edit" ? profile.idNumber : maskValue(profile.idNumber)
            }
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, idNumber: t })}
          />
        </Card>

        {/* Socials */}
        <Text variant="label" style={styles.sectionTitle}>
          Socials (Optional)
        </Text>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Field
            label="LinkedIn"
            value={profile.linkedin}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, linkedin: t })}
            placeholder="https://linkedin.com/in/..."
          />
          <Field
            label="Instagram"
            value={profile.instagram}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, instagram: t })}
            placeholder="@handle"
          />
          <Field
            label="X (Twitter)"
            value={profile.twitter}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, twitter: t })}
            placeholder="@handle"
          />
        </Card>

        {/* Ring Association */}
        <Text variant="label" style={styles.sectionTitle}>
          Ring Association
        </Text>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Field
            label="Linked Ring Name"
            value={profile.ringName}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, ringName: t })}
          />
          <Field
            label="Ring ID"
            value={mode === "edit" ? profile.ringId : maskValue(profile.ringId)}
            editable={mode === "edit"}
            onChange={(t) => setProfile({ ...profile, ringId: t })}
          />
          <Row label="Ring Status" value={profile.ringStatus} />
        </Card>

        {/* Logout */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Log out", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log Out",
                style: "destructive",
                onPress: () => logout(),
              },
            ])
          }
        >
          <Text
            variant="bodyStrong"
            style={{ color: theme.accent, textAlign: "center", marginTop: 8 }}
          >
            Logout
          </Text>
        </TouchableOpacity>

        {/* Privacy */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Privacy")}
          style={{ marginTop: 20 }}
        >
          <Card
            padding={16}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text variant="bodyStrong">Privacy</Text>
            <Text style={{ color: theme.chevron, fontSize: 20 }}>›</Text>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </RNView>
  );
}

const Field = ({
  label,
  value,
  editable,
  onChange,
  multiline,
  keyboardType,
  placeholder,
}) => {
  const theme = useTheme();
  return (
    <RNView style={{ marginBottom: 12 }}>
      <Text variant="subtext" style={{ marginBottom: 6 }}>
        {label}
      </Text>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          style={{
            backgroundColor: theme.card,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: theme.textPrimary,
          }}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      ) : (
        <Text variant="bodyStrong">{value ? value : "—"}</Text>
      )}
    </RNView>
  );
};

const Row = ({ label, value }) => (
  <RNView
    style={{
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Text variant="subtext">{label}</Text>
    <Text variant="bodyStrong">{value}</Text>
  </RNView>
);

const PreviewRow = ({ label, value, fontStyle }) => (
  <RNView
    style={{
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    }}
  >
    <Text
      variant="subtext"
      style={{ fontFamily: fontStyle === "serif" ? "serif" : "System" }}
    >
      {label}
    </Text>
    <Text
      variant="bodyStrong"
      style={{
        fontFamily: fontStyle === "serif" ? "serif" : "System",
        flex: 1,
        textAlign: "right",
      }}
    >
      {value}
    </Text>
  </RNView>
);

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    sectionTitle: { marginBottom: 8, marginTop: 12 },
    rowActions: { flexDirection: "row", gap: 8, marginBottom: 12 },
    photoContainer: {
      alignItems: "center",
      marginBottom: 16,
      marginTop: 8,
    },
    photo: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    photoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(109,94,246,0.15)",
      borderWidth: 2,
      borderColor: "#6D5EF6",
      justifyContent: "center",
      alignItems: "center",
    },
    photoPlaceholderText: {
      fontSize: 36,
      color: "#6D5EF6",
      fontWeight: "600",
    },
    colorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    colorOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorOptionSelected: {
      borderColor: "rgba(255,255,255,0.4)",
      transform: [{ scale: 1.1 }],
    },
    fontGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    fontOption: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    previewPhotoContainer: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 16,
    },
    previewPhoto: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    previewPhotoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.card,
      borderWidth: 3,
      justifyContent: "center",
      alignItems: "center",
    },
    previewPhotoText: {
      fontSize: 48,
      fontWeight: "600",
    },
    previewName: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 12,
    },
    previewRole: {
      fontSize: 16,
      color: "rgba(255,255,255,0.65)",
      textAlign: "center",
      marginTop: 4,
    },
  });
