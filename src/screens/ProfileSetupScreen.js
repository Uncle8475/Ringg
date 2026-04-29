import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { useAuth } from "../lib/authContext";
import { updateUserProfile } from "../lib/dbHelpers";

/**
 * ============================================================================
 * PROFILE SETUP SCREEN (ENHANCED)
 * ============================================================================
 * Mandatory profile completion after OTP verification
 * All fields left-aligned (NOT centered)
 * Cannot skip or proceed without completing
 * ============================================================================
 */

const ProfileSetupScreen = ({ navigation }) => {
  const { user, profile, updateLocalProfile, markProfileCompleted } = useAuth();

  const [fullName, setFullName] = useState(profile?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || "");
  const [emailId, setEmailId] = useState(
    profile?.email || (user && user.email) || "",
  );
  const [bio, setBio] = useState(profile?.bio || "");
  const [designation, setDesignation] = useState(profile?.designation || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Validate phone number format
   */
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return null; // Phone is optional
    const phoneRegex = /^[0-9\s+\-()]{7,}$/;
    return phoneRegex.test(phone) ? null : "Invalid phone number format";
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!emailId.trim()) {
      newErrors.emailId = "Email is required";
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle profile save
   */
  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});
      Keyboard.dismiss();

      // Update profile in database
      const { error } = await updateUserProfile(
        {
          name: fullName.trim(),
          phone: phoneNumber.trim() || null,
          email: emailId.trim(),
          bio: bio.trim() || null,
          designation: designation.trim() || null,
        },
        user?.id,
      );

      if (error) {
        setErrors({ submit: error });
        Alert.alert("Save Failed", error);
        return;
      }

      // Update local state
      updateLocalProfile({
        name: fullName.trim(),
        phone: phoneNumber.trim() || null,
        email: emailId.trim(),
        bio: bio.trim() || null,
        designation: designation.trim() || null,
      });

      // Mark profile as completed
      markProfileCompleted();

      // Navigate to completion screen
      navigation.navigate("Complete");
    } catch (err) {
      const errorMsg = err.message || "Failed to save profile";
      setErrors({ submit: errorMsg });
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format phone number as user types
   */
  const handlePhoneChange = (text) => {
    // Allow only digits, spaces, +, -, ()
    const filtered = text.replace(/[^\d\s+\-()]/g, "");
    setPhoneNumber(filtered);
    if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: null });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Add your details to get started</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Profile information helps us personalize your experience and improve
            our service.
          </Text>
        </View>

        {/* Form Section - ALL LEFT-ALIGNED */}
        <View style={styles.formSection}>
          {/* Full Name (Required) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Text style={styles.required}>*</Text> Full Name
            </Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="John Doe"
              placeholderTextColor="#CCCCCC"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
              editable={!loading}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* Phone Number (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#CCCCCC"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              editable={!loading}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Email ID (Required) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Text style={styles.required}>*</Text> Email ID
            </Text>
            <TextInput
              style={[styles.input, errors.emailId && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor="#CCCCCC"
              value={emailId}
              onChangeText={(text) => {
                setEmailId(text);
                if (errors.emailId) setErrors({ ...errors, emailId: null });
              }}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.emailId && (
              <Text style={styles.errorText}>{errors.emailId}</Text>
            )}
          </View>

          {/* Bio (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#CCCCCC"
              value={bio}
              onChangeText={setBio}
              editable={!loading}
              multiline
              maxLength={150}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* Designation (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Designation (Optional)</Text>
            <TextInput
              style={[styles.input]}
              placeholder="e.g., Engineer, Designer, Manager"
              placeholderTextColor="#CCCCCC"
              value={designation}
              onChangeText={setDesignation}
              editable={!loading}
            />
          </View>

          {/* Submit Error */}
          {errors.submit && (
            <View style={styles.submitError}>
              <Text style={styles.submitErrorText}>{errors.submit}</Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>

          {/* Cannot Skip Notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              ⚠️ Profile completion is required to continue setup. All fields
              marked with * are mandatory.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
    textAlign: "left", // LEFT-ALIGNED
  },

  subtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "left", // LEFT-ALIGNED
  },

  // Info Box
  infoBox: {
    backgroundColor: "#E8F4F8",
    borderLeftWidth: 4,
    borderLeftColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  infoIcon: {
    fontSize: 18,
    marginTop: 2,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0066CC",
    fontWeight: "500",
    lineHeight: 18,
  },

  // Form Section
  formSection: {
    gap: 20,
  },

  inputGroup: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    textAlign: "left", // LEFT-ALIGNED
  },

  required: {
    color: "#FF3B30",
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000000",
    backgroundColor: "#FAFAFA",
    textAlign: "left", // LEFT-ALIGNED
  },

  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },

  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },

  charCount: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
  },

  errorText: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "500",
    textAlign: "left", // LEFT-ALIGNED
  },

  submitError: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 3,
    borderLeftColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  submitErrorText: {
    color: "#FF3B30",
    fontSize: 13,
    fontWeight: "500",
  },

  saveButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  noticeBox: {
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },

  noticeText: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "left", // LEFT-ALIGNED
  },
});

export default ProfileSetupScreen;
