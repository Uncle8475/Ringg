import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { signInWithEmail, signUpWithEmail, signOut } from '../lib/authHelpers';
import { useAuth } from '../lib/authContext';
import { createUserProfile } from '../lib/dbHelpers';

/**
 * ============================================================================
 * LOGIN/SIGNUP SCREEN - SUPABASE INTEGRATION EXAMPLE
 * ============================================================================
 * Demonstrates:
 * - Email/Password signup with user profile creation
 * - Email/Password login with session restoration
 * - Error handling and loading states
 * - Graceful failure recovery
 * ============================================================================
 */

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const { loadUserProfile, isAuthenticated } = useAuth();

  /**
   * Handle email/password signup
   * Creates auth user AND profile in database
   */
  const handleSignUp = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validate inputs
      if (!email.trim() || !password.trim() || !fullName.trim()) {
        setError('Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Sign up with Supabase Auth
      const { user, session, error: signUpError } = await signUpWithEmail(email, password);

      if (signUpError) {
        setError(signUpError);
        return;
      }

      if (!user) {
        setError('Sign up failed. Please try again.');
        return;
      }

      // Create user profile in database
      const { error: profileError } = await createUserProfile(user.id, {
        name: fullName,
        email: email,
      });

      if (profileError) {
        setError(`Profile creation failed: ${profileError}`);
        return;
      }

      // Load profile into context
      await loadUserProfile();

      Alert.alert(
        'Success',
        'Account created! Please verify your email if required.',
        [{ text: 'OK', onPress: () => navigation.replace('Home') }]
      );
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle email/password login
   */
  const handleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validate inputs
      if (!email.trim() || !password.trim()) {
        setError('Please enter email and password');
        return;
      }

      // Sign in with Supabase Auth
      const { user, session, error: signInError } = await signInWithEmail(email, password);

      if (signInError) {
        setError(signInError);
        return;
      }

      if (!user) {
        setError('Sign in failed. Please check your credentials.');
        return;
      }

      // Load profile into context
      await loadUserProfile();

      // Navigate to home (will be automatically done by App.js checking isAuthenticated)
      navigation.replace('Home');
    } catch (err) {
      console.error('[Auth] Signin error:', err);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, show logout button
  if (isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Already Logged In</Text>
          <Text style={styles.subtitle}>You are already authenticated</Text>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={async () => {
              try {
                const { error } = await signOut();
                if (error) {
                  Alert.alert('Error', error);
                } else {
                  navigation.replace('Auth');
                }
              } catch (err) {
                Alert.alert('Error', 'Failed to sign out');
              }
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Cosmic Attire</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Full Name Input (only for signup) */}
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          )}

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {/* Sign In / Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle between Sign In and Sign Up */}
          <TouchableOpacity
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail('');
              setPassword('');
              setFullName('');
            }}
            disabled={loading}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Demo Info:</Text>
          <Text style={styles.infoText}>
            • All data is stored securely in Supabase{'\n'}
            • Session persists on device{'\n'}
            • RLS ensures your data stays private{'\n'}
            • Try signing up and checking Supabase console
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a3f5f',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#6366f1',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#1a3a3a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  infoTitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#d1fae5',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default AuthScreen;
