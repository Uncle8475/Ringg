import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View as RNView, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RingAnimation from '../components/RingAnimation';
import { Card, Text, TouchableOpacity } from '../uikit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, SETUP_STAGES } from '../lib/authContext';
import { useTheme } from '../theme';

const STORAGE_KEY = 'otpVerification';

export default function OTPVerification({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { updateLocalProfile, setSetupStage } = useAuth();
  const [mobileOTP, setMobileOTP] = useState(['', '', '', '', '', '']);
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileResendTimer, setMobileResendTimer] = useState(0);
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Refs for OTP inputs
  const mobileInputRefs = useRef([]);
  const emailInputRefs = useRef([]);

  // Mock OTPs until backend wiring is ready
  const MOCK_MOBILE_OTP = '123456';
  const MOCK_EMAIL_OTP = '654321';

  useEffect(() => {
    loadUserData();
    // Auto-send OTPs when screen loads
    setTimeout(() => {
      sendMobileOTP();
      sendEmailOTP();
    }, 500);
  }, []);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserPhone(profile.phone || '+91 XXXXX XXXXX');
        setUserEmail(profile.email || 'user@example.com');
      } else {
        setUserPhone('+91 XXXXX XXXXX');
        setUserEmail('user@example.com');
      }
    } catch (e) {
      console.warn('Error loading user data:', e);
    }
  };

  const sendMobileOTP = () => {
    // Mock sending OTP to mobile
    console.log('📱 Sending OTP to mobile:', userPhone);
    Alert.alert('OTP Sent', `A 6-digit code has been sent to ${maskPhone(userPhone)}`);
    setMobileResendTimer(30); // 30 second cooldown
  };

  const sendEmailOTP = () => {
    // Mock sending OTP to email
    console.log('📧 Sending OTP to email:', userEmail);
    Alert.alert('OTP Sent', `A 6-digit code has been sent to ${maskEmail(userEmail)}`);
    setEmailResendTimer(30); // 30 second cooldown
  };

  useEffect(() => {
    if (mobileResendTimer > 0) {
      const timer = setTimeout(() => setMobileResendTimer(mobileResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mobileResendTimer]);

  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setTimeout(() => setEmailResendTimer(emailResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailResendTimer]);

  const handleMobileOTPChange = (text, index) => {
    const newOTP = [...mobileOTP];
    newOTP[index] = text;
    setMobileOTP(newOTP);

    // Auto-focus next input
    if (text && index < 5) {
      mobileInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOTP.every(digit => digit !== '') && !mobileVerified) {
      verifyMobileOTP(newOTP.join(''));
    }
  };

  const handleEmailOTPChange = (text, index) => {
    const newOTP = [...emailOTP];
    newOTP[index] = text;
    setEmailOTP(newOTP);

    // Auto-focus next input
    if (text && index < 5) {
      emailInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOTP.every(digit => digit !== '') && !emailVerified) {
      verifyEmailOTP(newOTP.join(''));
    }
  };

  const verifyMobileOTP = (code) => {
    if (code === MOCK_MOBILE_OTP) {
      setMobileVerified(true);
      Alert.alert('✅ Verified', 'Mobile number verified successfully!');
    } else {
      Alert.alert('❌ Invalid OTP', 'The mobile OTP you entered is incorrect. Please try again.');
      setMobileOTP(['', '', '', '', '', '']);
      mobileInputRefs.current[0]?.focus();
    }
  };

  const verifyEmailOTP = (code) => {
    if (code === MOCK_EMAIL_OTP) {
      setEmailVerified(true);
      Alert.alert('✅ Verified', 'Email verified successfully!');
    } else {
      Alert.alert('❌ Invalid OTP', 'The email OTP you entered is incorrect. Please try again.');
      setEmailOTP(['', '', '', '', '', '']);
      emailInputRefs.current[0]?.focus();
    }
  };

  const handleContinue = async () => {
    if (!mobileVerified) {
      Alert.alert('Mobile Not Verified', 'Please verify your mobile number first.');
      return;
    }
    if (!emailVerified) {
      Alert.alert('Email Not Verified', 'Please verify your email address first.');
      return;
    }

    // Save verification status
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        mobileVerified: true,
        emailVerified: true,
        verifiedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Error saving verification:', e);
    }

    try {
      await updateLocalProfile({
        setup_progress: SETUP_STAGES.COMPLETE,
        otp_verified: true
      });
      // Explicitly navigate to the next screen to ensure progression
      setSetupStage(SETUP_STAGES.PROFILE_SETUP);
      navigation.navigate('UserProfile');
    } catch (e) {
      console.warn("Navigation error", e);
      Alert.alert('Error', 'Failed to complete verification. Please try again.');
    }
  };

  const maskPhone = (phone) => {
    if (!phone || phone.length < 10) return phone;
    return phone.slice(0, -4).replace(/\d/g, 'X') + phone.slice(-4);
  };

  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return email;
    const [user, domain] = email.split('@');
    if (user.length <= 3) return email;
    return user.slice(0, 2) + 'XXX' + user.slice(-1) + '@' + domain;
  };

  const isComplete = mobileVerified && emailVerified;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.inner} contentContainerStyle={styles.innerContent} showsVerticalScrollIndicator={false}>
        <RingAnimation size={100} glow />

        <Text style={[styles.title, { color: theme.text }]}>Verify Your Identity</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          We've sent verification codes to secure your COSMIC Ring
        </Text>

        {/* Mobile OTP Section */}
        <Card style={styles.otpSection} padding={20}>
          <RNView style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cellphone" size={24} color={mobileVerified ? theme.secondary : theme.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Mobile Verification</Text>
            {mobileVerified && <MaterialCommunityIcons name="check-circle" size={20} color={theme.secondary} />}
          </RNView>

          <Text style={[styles.infoText, { color: theme.muted }]}>
            Code sent to {maskPhone(userPhone)}
          </Text>

          <RNView style={styles.otpContainer}>
            {mobileOTP.map((digit, index) => (
              <TextInput
                key={`mobile-${index}`}
                ref={ref => mobileInputRefs.current[index] = ref}
                value={digit}
                onChangeText={(text) => handleMobileOTPChange(text, index)}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: mobileVerified ? 'rgba(142, 240, 168, 0.1)' : '#141822',
                    borderColor: mobileVerified ? '#8ef0a8' : 'rgba(255,255,255,0.12)',
                    color: mobileVerified ? '#8ef0a8' : '#FFFFFF',
                  }
                ]}
                keyboardType="numeric"
                maxLength={1}
                editable={!mobileVerified}
                selectTextOnFocus
              />
            ))}
          </RNView>

          {!mobileVerified && (
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={sendMobileOTP}
              disabled={mobileResendTimer > 0}
            >
              <Text style={[styles.resendText, { color: mobileResendTimer > 0 ? theme.muted : theme.accent }]}>
                {mobileResendTimer > 0 ? `Resend in ${mobileResendTimer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Email OTP Section */}
        <Card style={styles.otpSection} padding={20}>
          <RNView style={styles.sectionHeader}>
            <MaterialCommunityIcons name="email" size={24} color={emailVerified ? theme.secondary : theme.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Email Verification</Text>
            {emailVerified && <MaterialCommunityIcons name="check-circle" size={20} color={theme.secondary} />}
          </RNView>

          <Text style={[styles.infoText, { color: theme.muted }]}>
            Code sent to {maskEmail(userEmail)}
          </Text>

          <RNView style={styles.otpContainer}>
            {emailOTP.map((digit, index) => (
              <TextInput
                key={`email-${index}`}
                ref={ref => emailInputRefs.current[index] = ref}
                value={digit}
                onChangeText={(text) => handleEmailOTPChange(text, index)}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: emailVerified ? 'rgba(142, 240, 168, 0.1)' : '#141822',
                    borderColor: emailVerified ? '#8ef0a8' : 'rgba(255,255,255,0.12)',
                    color: emailVerified ? '#8ef0a8' : '#FFFFFF',
                  }
                ]}
                keyboardType="numeric"
                maxLength={1}
                editable={!emailVerified}
                selectTextOnFocus
              />
            ))}
          </RNView>

          {!emailVerified && (
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={sendEmailOTP}
              disabled={emailResendTimer > 0}
            >
              <Text style={[styles.resendText, { color: emailResendTimer > 0 ? theme.muted : theme.accent }]}>
                {emailResendTimer > 0 ? `Resend in ${emailResendTimer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

      </ScrollView>

      {/* Continue Button */}
      <RNView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: isComplete ? theme.secondary : theme.card,
              opacity: isComplete ? 1 : 0.6
            }
          ]}
          disabled={!isComplete}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: theme.textOnDark }]}>
            {isComplete ? 'Complete Setup' : 'Verify Both OTPs to Continue'}
          </Text>
        </TouchableOpacity>
      </RNView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  innerContent: { justifyContent: 'center', alignItems: 'center', padding: 24, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  subtitle: { marginTop: 6, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  otpSection: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#141822',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  infoText: { fontSize: 13, marginBottom: 16, color: theme.textSecondary },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  otpInput: {
    width: 45,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: { fontSize: 14, fontWeight: '600' },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
