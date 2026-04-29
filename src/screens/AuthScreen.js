import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const theme = useTheme();
  const styles = createStyles(theme);
  const { authenticate } = useAuth();
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(18)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslateY, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryOpacity, entryTranslateY]);

  const animatedContainerStyle = useMemo(
    () => ({
      opacity: entryOpacity,
      transform: [{ translateY: entryTranslateY }],
    }),
    [entryOpacity, entryTranslateY]
  );

  const animatedButtonStyle = useMemo(
    () => ({
      transform: [{ scale: buttonScale }],
    }),
    [buttonScale]
  );

  const validateEmail = (emailInput) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleContinue = async () => {
    setEmailError('');
    setPasswordError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authenticate({
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      if (result.error) {
        if (result.error.includes('Invalid login credentials') ||
            result.error.includes('User not found')) {
          Alert.alert('Authentication Failed', 'Invalid email or password. Please try again.');
        } else {
          Alert.alert('Authentication Failed', result.error);
        }
        return;
      }

      if (result.isNewUser) {
        Alert.alert('Welcome!', 'Your account has been created successfully.');
      } else {
        Alert.alert('Welcome back!', 'Successfully signed in.');
      }
    } catch (error) {
      Alert.alert(
        'Authentication Error',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 6,
    }).start();
  };

  return (
    <LinearGradient
      colors={[theme.background, theme.card, theme.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.contentContainer, animatedContainerStyle]}>
          <View style={styles.topSection}>
            <Image
              source={require('../../assets/images/logo.jpg')}
              style={styles.logo}
              resizeMode="cover"
            />
            <Text style={styles.appName}>COSMIC ATTIRE</Text>
            <Text style={styles.subtitle}>Welcome back</Text>
          </View>

          <View style={styles.middleSection}>
            <View style={styles.glowOrb} />
            <BlurView intensity={50} tint="dark" style={styles.glassCard}>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                editable={!loading}
              />
              {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

              <Animated.View style={animatedButtonStyle}>
                <Pressable
                  onPress={handleContinue}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  disabled={loading}
                  style={[styles.button, loading && styles.buttonDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.textOnDark || theme.textPrimary} />
                  ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                  )}
                </Pressable>
              </Animated.View>
            </BlurView>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.privacyText}>By continuing, you agree to our privacy standards.</Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 28,
      paddingTop: 72,
      paddingBottom: 28,
    },
    topSection: {
      alignItems: 'center',
    },
    logo: {
      width: 84,
      height: 84,
      borderRadius: 22,
      marginBottom: 18,
    },
    appName: {
      color: theme.textPrimary,
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: 2.5,
      marginBottom: 8,
    },
    subtitle: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: '500',
      opacity: 0.65,
    },
    middleSection: {
      marginTop: 20,
      marginBottom: 20,
      justifyContent: 'center',
    },
    glowOrb: {
      position: 'absolute',
      alignSelf: 'center',
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: theme.secondary,
      opacity: 0.14,
    },
    glassCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      overflow: 'hidden',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    input: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      fontSize: 15,
      marginBottom: 10,
    },
    inputError: {
      borderColor: theme.warning,
    },
    errorText: {
      color: theme.warning,
      fontSize: 11,
      marginBottom: 8,
      marginLeft: 2,
    },
    button: {
      backgroundColor: theme.secondary,
      paddingVertical: 15,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 4,
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 18,
      elevation: 10,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.textOnDark,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    bottomSection: {
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    privacyText: {
      color: theme.textPrimary,
      opacity: 0.45,
      fontSize: 12,
      textAlign: 'center',
    },
  });
