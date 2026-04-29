import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '../theme';
import { useAuth } from '../lib/authContext';
import { Text, Card, Button } from '../uikit';

WebBrowser.maybeCompleteAuthSession();

export default function AuthenticationManager({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, signOut, signInWithProvider, loading, session } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [connectedMethods, setConnectedMethods] = useState([]);

  useEffect(() => {
    loadConnectedMethods();
  }, [session]);

  const loadConnectedMethods = () => {
    const methods = [];
    if (user?.email) {
      methods.push({
        id: 'email',
        name: 'Email',
        icon: 'email-outline',
        value: user.email,
      });
    }
    
    if (user?.user_metadata?.providers?.includes('google')) {
      methods.push({
        id: 'google',
        name: 'Google',
        icon: 'google',
        value: 'Connected',
      });
    }

    if (user?.user_metadata?.providers?.includes('apple')) {
      methods.push({
        id: 'apple',
        name: 'Apple',
        icon: 'apple',
        value: 'Connected',
      });
    }

    setConnectedMethods(methods);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            setSigningOut(true);
            try {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Error', error);
              } else {
                Alert.alert('Success', 'Signed out successfully');
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to sign out');
            } finally {
              setSigningOut(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleOAuth = async (provider) => {
    setOAuthLoading(true);
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { url, error } = await signInWithProvider(provider, redirectTo);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (!url) {
        Alert.alert('Error', 'No authentication URL received');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);
      if (result.type === 'success') {
        Alert.alert('Success', `${provider} connected successfully`);
        loadConnectedMethods();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setOAuthLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons 
              name="chevron-left" 
              size={28} 
              color={theme.textPrimary} 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Authentication</Text>
          <View style={styles.backButton} />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <Card style={styles.card}>
            <View style={styles.accountInfo}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons 
                  name="account-circle" 
                  size={48} 
                  color={theme.secondary} 
                />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.email} numberOfLines={1}>
                  {user?.email || 'Not logged in'}
                </Text>
                <Text style={[styles.accountStatus, { color: theme.success || '#4CAF50' }]}>
                  ✓ Active
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Connected Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Methods</Text>
          
          {connectedMethods.length > 0 ? (
            connectedMethods.map((method, index) => (
              <Card key={method.id} style={styles.methodCard}>
                <View style={styles.methodContent}>
                  <MaterialCommunityIcons 
                    name={method.icon} 
                    size={24} 
                    color={theme.secondary} 
                  />
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodValue}>{method.value}</Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={24} 
                    color={theme.success || '#4CAF50'} 
                  />
                </View>
              </Card>
            ))
          ) : (
            <Card style={[styles.card, styles.emptyState]}>
              <MaterialCommunityIcons 
                name="lock-outline" 
                size={48} 
                color={theme.textSecondary} 
              />
              <Text style={styles.emptyStateText}>
                No authentication methods connected
              </Text>
            </Card>
          )}
        </View>

        {/* Add More Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect More Methods</Text>
          
          <TouchableOpacity
            style={[styles.oauthButton, oauthLoading && styles.buttonDisabled]}
            onPress={() => handleOAuth('google')}
            disabled={oauthLoading}
          >
            <MaterialCommunityIcons 
              name="google" 
              size={24} 
              color={theme.textPrimary} 
            />
            <Text style={styles.oauthButtonText}>
              {oauthLoading ? 'Connecting...' : 'Connect Google'}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.oauthButton, oauthLoading && styles.buttonDisabled]}
              onPress={() => handleOAuth('apple')}
              disabled={oauthLoading}
            >
              <MaterialCommunityIcons 
                name="apple" 
                size={24} 
                color={theme.textPrimary} 
              />
              <Text style={styles.oauthButtonText}>
                {oauthLoading ? 'Connecting...' : 'Connect Apple'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity 
            style={styles.securityOption}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <MaterialCommunityIcons 
              name="shield-lock-outline" 
              size={24} 
              color={theme.secondary} 
            />
            <View style={styles.securityInfo}>
              <Text style={styles.securityLabel}>Security Settings</Text>
              <Text style={styles.securityDescription}>
                Manage passcode and app lock
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.securityOption}
            onPress={() => Alert.alert('Info', 'Change password feature coming soon')}
          >
            <MaterialCommunityIcons 
              name="key-outline" 
              size={24} 
              color={theme.secondary} 
            />
            <View style={styles.securityInfo}>
              <Text style={styles.securityLabel}>Change Password</Text>
              <Text style={styles.securityDescription}>
                Update your account password
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.securityOption}
            onPress={() => Alert.alert('Info', 'Two-factor authentication feature coming soon')}
          >
            <MaterialCommunityIcons 
              name="shield-check-outline" 
              size={24} 
              color={theme.secondary} 
            />
            <View style={styles.securityInfo}>
              <Text style={styles.securityLabel}>Two-Factor Authentication</Text>
              <Text style={styles.securityDescription}>
                Add an extra layer of security
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutButton, signingOut && styles.buttonDisabled]}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons 
                  name="logout" 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.signOutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textSecondary,
    marginBottom: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  card: {
    marginBottom: 12,
    borderRadius: 18,
    padding: 18,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: `${theme.border}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  accountStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  methodCard: {
    marginBottom: 12,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  methodValue: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: `${theme.border}30`,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  oauthButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: `${theme.card}80`,
    borderWidth: 1,
    borderColor: `${theme.border}30`,
    marginBottom: 12,
  },
  securityInfo: {
    flex: 1,
    gap: 2,
  },
  securityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  securityDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    height: 20,
  },
});
