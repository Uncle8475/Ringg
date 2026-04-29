import React, { useEffect, useState } from 'react';
import { View as RNView, StyleSheet, Switch, Alert, Image, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import Header from '../components/Header';
import { Card, Text, TouchableOpacity, Button } from '../uikit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getRecentTransactions } from '../lib/dbHelpers';

const STORAGE_KEY = 'securityPrivacySettings';
const APP_LOCK_KEY = 'appLockSettings';

export default function SafetySecurity() {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [blockStatus, setBlockStatus] = useState(null); // null | 'temporary' | 'permanent'
  const [autoSafety, setAutoSafety] = useState(false);
  const [lastActivity, setLastActivity] = useState('No recent activity');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authMethod, setAuthMethod] = useState('pin'); // 'pin' | 'biometric'

  const [ringUsageHistory, setRingUsageHistory] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      // Load Security Settings
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        setBlockStatus(s.blockStatus || null);
        setAutoSafety(!!s.autoSafety);
        // if(s.lastActivity) setLastActivity(s.lastActivity); // Allow DB content to override this
      }

      // Load Recent Transactions (Ring Usage)
      const { transactions, error } = await getRecentTransactions(5);
      if (!error && transactions.length > 0) {
        const history = transactions.map(t => ({
          id: t.id,
          location: t.location || t.merchant || 'Unknown Location',
          time: formatTime(t.created_at),
          action: t.type === 'payment' ? 'Payment' : (t.type === 'topup' ? 'Top-up' : 'Transaction'),
          status: 'success'
        }));
        setRingUsageHistory(history);

        // Update last activity text based on most recent transaction
        const latest = history[0];
        setLastActivity(`${latest.action} at ${latest.location} · ${latest.time}`);
      } else {
        setRingUsageHistory([]);
        setLastActivity('No recent activity found');
      }
    } catch (e) {
      console.warn('Error loading safety data', e);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleTemporaryBlock = () => {
    Alert.alert(
      'Temporarily Block Ring',
      'Your ring will be disabled for payments and access. You can unblock it anytime without authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block', style: 'destructive', onPress: () => {
            setBlockStatus('temporary');
            setLastActivity('Ring temporarily blocked · ' + new Date().toLocaleString());
            Alert.alert('Ring Blocked', 'Your ring is now temporarily blocked. Status: Ring temporarily blocked');
          }
        }
      ]
    );
  };

  const handlePermanentBlock = () => {
    Alert.alert(
      'Permanently Block Ring',
      '⚠️ WARNING: This action CANNOT be undone. Your ring will be permanently disabled.\n\nYou will need to request a new ring.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', style: 'destructive', onPress: () => requestAuthentication() }
      ]
    );
  };

  const requestAuthentication = async () => {
    try {
      const appLockSettings = await AsyncStorage.getItem(APP_LOCK_KEY);
      if (appLockSettings) {
        const settings = JSON.parse(appLockSettings);
        if (settings.enabled) {
          setAuthMethod(settings.method || 'pin');
          setShowAuthModal(true);
          return;
        }
      }
      // If no app lock enabled, proceed without auth
      proceedWithPermanentBlock();
    } catch (e) {
      proceedWithPermanentBlock();
    }
  };

  const verifyAuthentication = () => {
    if (authMethod === 'pin' && pinInput === '') {
      Alert.alert('PIN Required', 'Please enter your App Lock PIN to proceed.');
      return;
    }
    // Mock verification (in real app, verify against actual PIN/biometric)
    if (authMethod === 'pin' && pinInput.length >= 4) {
      proceedWithPermanentBlock();
    } else if (authMethod === 'biometric') {
      // Mock biometric success
      proceedWithPermanentBlock();
    } else {
      Alert.alert('Invalid PIN', 'The PIN you entered is incorrect.');
      setPinInput('');
    }
  };

  const proceedWithPermanentBlock = () => {
    setShowAuthModal(false);
    setPinInput('');
    setBlockStatus('permanent');
    setLastActivity('Ring permanently blocked · ' + new Date().toLocaleString());
    Alert.alert('Ring Permanently Blocked', 'Your ring has been permanently disabled. Please contact support for a replacement.');
  };

  const unblockRing = () => {
    if (blockStatus === 'temporary') {
      Alert.alert(
        'Unblock Ring',
        'Your ring will be re-enabled for payments and access.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unblock', onPress: () => {
              setBlockStatus(null);
              setLastActivity('Ring unblocked · ' + new Date().toLocaleString());
            }
          }
        ]
      );
    }
  };

  const contactSupport = () => {
    navigation.navigate('HelpSupport');
  };

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Safety & Security" />
      <ScrollView style={{ padding: 18, paddingBottom: 40 }} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

        <RNView style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </RNView>

        {/* === BLOCK RING SECTION === */}
        <Text variant="label" style={{ marginBottom: 8 }}>Block Ring</Text>
        <Card padding={16} style={{ marginBottom: 16 }}>
          {blockStatus === null ? (
            <RNView>
              {/* TEMPORARY BLOCK OPTION */}
              <TouchableOpacity onPress={handleTemporaryBlock} style={styles.blockOption}>
                <RNView style={styles.blockOptionLeft}>
                  <MaterialCommunityIcons name="pause-circle-outline" size={22} color={theme.secondary} />
                  <RNView style={{ marginLeft: 12 }}>
                    <Text variant="bodyStrong">🕒 Temporary Block</Text>
                    <Text variant="caption" style={{ marginTop: 2, color: theme.textSecondary }}>Disables ring temporarily • Can be unblocked anytime • No authentication required</Text>
                  </RNView>
                </RNView>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              <RNView style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />

              {/* PERMANENT BLOCK OPTION */}
              <TouchableOpacity onPress={handlePermanentBlock} style={styles.blockOption}>
                <RNView style={styles.blockOptionLeft}>
                  <MaterialCommunityIcons name="lock-outline" size={22} color={theme.accent} />
                  <RNView style={{ marginLeft: 12 }}>
                    <Text variant="bodyStrong" style={{ color: theme.accent }}>⛔ Permanent Block</Text>
                    <Text variant="caption" style={{ marginTop: 2, color: theme.accent }}>Permanently disables ring • This action is irreversible • Requires authentication</Text>
                  </RNView>
                </RNView>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.accent} />
              </TouchableOpacity>
            </RNView>
          ) : (
            <RNView>
              {/* CURRENT BLOCK STATUS */}
              <RNView style={styles.statusBlock}>
                <MaterialCommunityIcons
                  name={blockStatus === 'temporary' ? 'pause-circle' : 'lock'}
                  size={28}
                  color={blockStatus === 'temporary' ? theme.secondary : theme.accent}
                />
                <Text variant="h3" style={{marginLeft:12, color: blockStatus === 'temporary' ? theme.secondary : theme.accent}}>
                  {blockStatus === 'temporary' ? 'Ring temporarily blocked' : 'Ring permanently blocked'}
                </Text>
              </RNView>
              <Text variant="caption" style={{ marginTop: 12 }}>
                {blockStatus === 'temporary'
                  ? 'Your ring is disabled. You can unblock it anytime.'
                  : 'Contact Support to resolve this'}
              </Text>
              {blockStatus === 'temporary' && (
                <Button label="Unblock Ring" style={{ marginTop: 16 }} onPress={unblockRing} variant="primary" />
              )}
              {blockStatus === 'permanent' && (
                <Button label="Contact Support" style={{ marginTop: 16 }} onPress={contactSupport} variant="primary" />
              )}
            </RNView>
          )}
        </Card>

        {/* === RING USAGE & SECURITY INFO SECTION === */}
        <Text variant="label" style={{ marginBottom: 8 }}>Ring Usage & Security</Text>

        {/* Security Status Card */}
        <Card padding={16} style={{ marginBottom: 12 }}>
          <RNView style={styles.rowJustify}>
            <Text variant="bodyStrong">Auto Safety Mode</Text>
            <Switch
              value={autoSafety}
              onValueChange={(v) => { setAutoSafety(v); setLastActivity(`Safety mode ${v ? 'enabled' : 'disabled'} · ` + new Date().toLocaleString()); }}
              trackColor={{ false: 'rgba(255,255,255,0.25)', true: '#3DDC97' }}
              thumbColor="#FFFFFF"
            />
          </RNView>
          <RNView style={{ marginTop: 12 }}>
            <Text variant="subtext">Last ring activity</Text>
            <Text variant="bodyStrong" style={{ marginTop: 6 }}>{lastActivity}</Text>
          </RNView>
        </Card>

        {/* Ring Usage History */}
        <Text variant="label" style={{ marginBottom: 8 }}>Where Ring Was Used</Text>
        <RNView style={{ marginBottom: 16 }}>
          {ringUsageHistory.map((entry, idx) => (
            <Card key={entry.id} padding={14} style={{ marginBottom: 8 }}>
              <RNView style={styles.historyEntry}>
                <RNView style={styles.historyLeft}>
                  <RNView style={styles.historyIcon}>
                    <MaterialCommunityIcons
                      name={entry.action === 'Payment' ? 'credit-card' : 'door-open'}
                      size={18}
                      color={theme.secondary}
                    />
                  </RNView>
                  <RNView style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{entry.location}</Text>
                    <Text variant="caption" style={{ marginTop: 2, color: theme.textSecondary }}>{entry.time}</Text>
                  </RNView>
                </RNView>
                <RNView style={{ alignItems: 'flex-end' }}>
                  <Text variant="caption" style={{ color: entry.status === 'success' ? theme.secondary : theme.accent }}>
                    {entry.status === 'success' ? '✓' : '✗'} {entry.action}
                  </Text>
                </RNView>
              </RNView>
            </Card>
          ))}
        </RNView>
      </ScrollView>

      {/* === AUTHENTICATION MODAL === */}
      {showAuthModal && (
        <RNView style={styles.modalOverlay}>
          <Card padding={20} style={styles.authModal}>
            <Text variant="h3" style={{ marginBottom: 4 }}>Verify Identity</Text>
            <Text variant="caption" style={{ marginBottom: 20, color: theme.textSecondary }}>Permanent block requires authentication.</Text>

            {authMethod === 'pin' && (
              <RNView>
                <Text variant="subtext" style={{ marginBottom: 8 }}>Enter App Lock PIN</Text>
                <TextInput
                  value={pinInput}
                  onChangeText={setPinInput}
                  placeholder="••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.pinInput}
                />
              </RNView>
            )}

            {authMethod === 'biometric' && (
              <RNView style={{ alignItems: 'center', marginBottom: 20 }}>
                <MaterialCommunityIcons name="fingerprint" size={48} color={theme.secondary} />
                <Text variant="bodyStrong" style={{ marginTop: 12 }}>Tap fingerprint sensor</Text>
              </RNView>
            )}

            <RNView style={{ flexDirection: 'row', gap: 8 }}>
              <Button label="Cancel" variant="secondary" onPress={() => { setShowAuthModal(false); setPinInput(''); }} style={{ flex: 1 }} />
              <Button label="Verify" onPress={verifyAuthentication} style={{ flex: 1 }} />
            </RNView>
          </Card>
        </RNView>
      )}
    </RNView>
  );
}

const createStyles = (theme) => ({
  container: { flex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 16, marginTop: 8 },
  logo: { width: 120, height: 60, opacity: 0.85 },
  rowJustify: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  blockOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusBlock: { flexDirection: 'row', alignItems: 'center' },
  historyEntry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  historyIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(109,94,246,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  authModal: { width: '85%' },
  pinInput: { backgroundColor: theme.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: theme.textPrimary, fontSize: 16, textAlign: 'center', letterSpacing: 8, marginBottom: 16 }
});
