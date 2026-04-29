import React, { useState, useEffect, useRef } from "react";
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
import { verifyEmailOTP, sendEmailOTP } from "../lib/authHelpers";
import { updateUserProfile } from "../lib/dbHelpers";

/**
 * ============================================================================
 * MANDATORY OTP VERIFICATION SCREEN
 * ============================================================================
 * OTP verification required for ALL users (email/password + OAuth)
 * Cannot skip or bypass
 * Must complete before accessing app
 * ============================================================================
 */

const OTPVerificationScreen = ({ route, navigation }) => {
  const { user, markOTPVerified, updateLocalProfile } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(true); // OTP sent in signup flow

  const otpInputRef = useRef(null);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /**
   * Verify OTP code
   */
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP code");
      return;
    }

    if (otp.length < 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      Keyboard.dismiss();

      // Verify OTP with user's email
      const { data, error: verifyError } = await verifyEmailOTP(
        user?.email,
        otp,
      );

      if (verifyError) {
        setError(verifyError);
        Alert.alert("Verification Failed", verifyError);
        return;
      }

      // Update user profile to mark OTP as verified
      const { error: updateError } = await updateUserProfile(
        {
          otp_verified: true,
        },
        user?.id,
      );

      if (updateError) {
        console.warn("[OTP] Profile update warning:", updateError);
      }

      // Update context
      markOTPVerified();

      Alert.alert("Success", "Your email has been verified!");

      // Navigate based on setup stage
      // If user has profile, go to home; otherwise profile setup
      navigation.navigate("UserProfile");
    } catch (err) {
      const errorMsg = err.message || "Verification failed";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP code
   */
  const handleResendOTP = async () => {
    try {
      setResending(true);
      setError(null);

      const { error: resendError } = await sendEmailOTP(user?.email);

      if (resendError) {
        setError(resendError);
        Alert.alert("Resend Failed", resendError);
        return;
      }

      setOtpSent(true);
      setResendCountdown(60); // 60 second cooldown
      setOtp("");
      otpInputRef.current?.focus();

      Alert.alert("Code Sent", "A new OTP has been sent to your email");
    } catch (err) {
      const errorMsg = err.message || "Failed to resend OTP";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setResending(false);
    }
  };

  /**
   * Handle numeric input only
   */
  const handleOTPChange = (text) => {
    // Remove non-digits
    const numericText = text.replace(/[^0-9]/g, "");
    // Limit to 6 digits
    const limitedText = numericText.slice(0, 6);
    setOtp(limitedText);
    if (error) setError(null);

    // Auto-verify on 6 digits
    if (limitedText.length === 6) {
      setTimeout(() => {
        handleVerifyOTP();
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {"\n"}
            <Text style={styles.email}>{user?.email}</Text>
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Email verification is required for security. This step cannot be
            skipped.
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpSection}>
          <Text style={styles.label}>Enter Verification Code</Text>
          <TextInput
            ref={otpInputRef}
            style={[styles.otpInput, error && styles.otpInputError]}
            placeholder="000000"
            placeholderTextColor="#CCCCCC"
            value={otp}
            onChangeText={handleOTPChange}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
            autoFocus
            selectTextOnFocus
          />
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Individual Digit Display */}
        <View style={styles.digitDisplay}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.digitBox,
                index < otp.length && styles.digitBoxFilled,
              ]}
            >
              <Text style={styles.digit}>{otp[index] || ""}</Text>
            </View>
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.length < 6}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Code</Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendCountdown > 0 || resending}
          >
            <Text
              style={[
                styles.resendButton,
                (resendCountdown > 0 || resending) &&
                  styles.resendButtonDisabled,
              ]}
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : resending
                  ? "Sending..."
                  : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipItem}>
            • Check spam folder if not in inbox
          </Text>
          <Text style={styles.tipItem}>• Code expires in 10 minutes</Text>
          <Text style={styles.tipItem}>• Use 6 digits only, no spaces</Text>
        </View>

        {/* Cannot Skip Notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ⚠️ This step is required and cannot be skipped to proceed with
            setup.
          </Text>
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
    marginBottom: 32,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },

  email: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
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

  // OTP Section
  otpSection: {
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },

  otpInput: {
    borderWidth: 2,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
    letterSpacing: 8,
    marginBottom: 12,
  },

  otpInputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },

  errorBox: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 3,
    borderLeftColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  errorText: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "500",
  },

  // Digit Display
  digitDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 28,
  },

  digitBox: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },

  digitBoxFilled: {
    borderColor: "#000000",
    backgroundColor: "#F0F0F0",
  },

  digit: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },

  // Verify Button
  verifyButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Resend Section
  resendSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  resendText: {
    fontSize: 14,
    color: "#666666",
  },

  resendButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
  },

  resendButtonDisabled: {
    color: "#CCCCCC",
  },

  // Tips Section
  tipsSection: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  tipsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },

  tipItem: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 18,
    marginBottom: 4,
  },

  // Notice Box
  noticeBox: {
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  noticeText: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "500",
    lineHeight: 18,
  },
});

export default OTPVerificationScreen;
