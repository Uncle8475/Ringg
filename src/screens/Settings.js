import React from 'react';
import { View as RNView, StyleSheet, SectionList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useAuth } from '../lib/authContext';
import Header from '../components/Header';
import { Card, Text } from '../uikit';

const SECTIONS = [
  { title: 'Account', data: [{ key: 'Profile', to: 'Profile' }, { key: 'Offers & Rewards', to: 'Offers' }] },
  { title: 'Payments', data: [{ key: 'Wallet & Payments', to: 'WalletSettings' }, { key: 'Transaction Limits', to: 'TransactionLimits' }] },
  { title: 'Security', data: [{ key: 'Authentication', to: 'Authentication' }, { key: 'Security & Privacy', to: 'SecuritySettings' }, { key: 'App Lock', to: 'AppLock' }] },
  { title: 'Preferences', data: [{ key: 'Notifications', to: 'Notifications' }, { key: 'Appearance', to: 'Appearance' }] },
  { title: 'Support & Info', data: [{ key: 'Help & Support', to: 'Support' }, { key: 'E-Summit', to: 'ESummit' }, { key: 'About COSMIC ATTIRE', to: 'About' }] },
  { title: 'System', data: [{ key: 'Logout', to: 'Logout' }] }
];

export default function Settings() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { logout, profile } = useAuth();

  const onPress = async (to) => {
    if (to === 'Logout') {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out', style: 'destructive', onPress: async () => {
            try {
              await logout();
              // App.js will handle navigation back to AuthEntry based on user state
            } catch (error) {
              Alert.alert('Error', 'Failed to log out');
            }
          }
        }
      ]);
      return;
    }
    navigation.navigate(to);
  };

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Settings" />

      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 12 }}
        renderSectionHeader={({ section: { title } }) => (
          <Text variant="label" style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <Card
            style={[styles.row, item.to === 'Logout' && styles.logoutRow]}
            padding={16}
            onPress={() => onPress(item.to)}
          >
            <Text variant="body" style={[item.to === 'Logout' ? styles.logoutRowText : null]}>{item.key}</Text>
            <Text style={[styles.chev, { color: theme.chevron }, item.to === 'Logout' ? styles.logoutText : null]}>›</Text>
          </Card>
        )}
        ItemSeparatorComponent={() => null}
      />

      {/* Golden Rule: Super Admin Access */}
      {profile?.role === 'super_admin' && (
        <RNView>
          <Card
            style={{ marginHorizontal: 18, marginTop: 20, borderColor: '#E05A5A', borderWidth: 1 }}
            padding={16}
            onPress={() => navigation.navigate('AdminPanel')}
          >
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyStrong" style={{ color: '#E05A5A' }}>Admin Panel</Text>
              <Text style={{ color: '#E05A5A', fontSize: 18 }}>›</Text>
            </RNView>
          </Card>

          <Card
            style={{ marginHorizontal: 18, marginTop: 12, borderColor: '#3DDC97', borderWidth: 1 }}
            padding={16}
            onPress={() => navigation.navigate('UploadTest')}
          >
            <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyStrong" style={{ color: '#3DDC97' }}>Test File Upload</Text>
              <Text style={{ color: '#3DDC97', fontSize: 18 }}>›</Text>
            </RNView>
          </Card>
        </RNView>
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { 
    marginTop: 24, 
    marginBottom: 14, 
    paddingHorizontal: 22,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.85,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginHorizontal: 22, 
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutRow: { 
    borderWidth: 1.5,
    borderColor: 'rgba(224,90,90,0.25)',
    shadowColor: 'rgba(224,90,90,0.4)',
    shadowOpacity: 0.2,
  },
  chev: { 
    fontSize: 20,
    fontWeight: '700',
  },
  logoutText: { color: '#E05A5A', fontWeight: '700' },
  logoutRowText: { color: '#E05A5A', fontWeight: '700' }
});
