import React, { useState } from 'react';
import {
  SafeAreaView,
  View as RNView,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme';
import { Card, Text, TouchableOpacity } from '../uikit';
import { useAuth } from '../lib/authContext';
import RingAnimation from '../components/RingAnimation';

export default function SignIn({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Sign In Failed', error);
        return;
      }

      // Navigation happens automatically in authContext when user is set
      Alert.alert('Success', 'Signed in successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.inner} contentContainerStyle={styles.innerContent}>
        <RingAnimation size={100} />
        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Sign into your account</Text>

        {/* Email */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="your@email.com"
            placeholderTextColor={theme.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {errors.email && <Text style={[styles.errorText, { color: theme.secondary }]}>{errors.email}</Text>}
        </RNView>

        {/* Password */}
        <RNView style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Password *</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="••••••••"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry
            editable={!loading}
          />
          {errors.password && <Text style={[styles.errorText, { color: theme.secondary }]}>{errors.password}</Text>}
        </RNView>
      </ScrollView>

      {/* Button Container */}
      <RNView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.secondary }]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.textOnDark} />
          ) : (
            <Text style={[styles.btnText, { color: theme.textOnDark }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.replace('SignUp')}
          disabled={loading}
        >
          <Text style={[styles.linkText, { color: theme.secondary }]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </RNView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1 },
    innerContent: { justifyContent: 'flex-start', alignItems: 'stretch', padding: 24 },
    title: { fontSize: 22, fontWeight: '800', marginTop: 16, textAlign: 'left' },
    subtitle: { marginTop: 6, color: theme.muted, textAlign: 'left' },
    fieldGroup: { marginBottom: 18, width: '100%' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.text,
    },
    inputError: { borderColor: theme.secondary },
    errorText: { fontSize: 12, marginTop: 4, fontWeight: '500' },
    buttonContainer: { padding: 24 },
    btn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, alignItems: 'center' },
    btnText: { fontWeight: '700', fontSize: 16 },
    linkButton: { marginTop: 16, alignItems: 'center' },
    linkText: { fontSize: 14, fontWeight: '600' },
  });
