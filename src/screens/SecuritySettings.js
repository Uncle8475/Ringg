import React, { useEffect, useState } from 'react';
import { View as RNView, StyleSheet, Switch, Alert, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useTheme } from '../theme';
import { Card, Text, Button, TouchableOpacity } from '../uikit';

const STORAGE_KEY = 'securityPrivacySettings';
const APP_LOCK_KEY = 'appLockSettings';

export default function SecuritySettings() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [blockStatus, setBlockStatus] = useState(null); // null | 'temporary' | 'permanent'
  const [autoSafety, setAutoSafety] = useState(false);
  const [lastActivity, setLastActivity] = useState('Ring used at Campus Cafe · 09:15 AM');
  const [profileVisible, setProfileVisible] = useState(true);
  const [shareActivity, setShareActivity] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authMethod, setAuthMethod] = useState('pin'); // 'pin' | 'biometric'

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const s = JSON.parse(saved);
          setBlockStatus(s.blockStatus || null);
          setAutoSafety(!!s.autoSafety);
          setProfileVisible(s.profileVisible !== false);
          setShareActivity(!!s.shareActivity);
          if (s.lastActivity) setLastActivity(s.lastActivity);
        }
      } catch (e) { }
    })();
  }, []);

  const save = async () => {
    const payload = { blockStatus, autoSafety, lastActivity, profileVisible, shareActivity };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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
            Alert.alert('Ring Blocked', 'Your ring is now temporarily blocked.');
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
    } else if (blockStatus === 'permanent') {
      Alert.alert('Cannot Unblock', 'A permanently blocked ring cannot be unblocked. Contact support.');
    }
  };

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Security & Privacy" />
      <ScrollView style={{ padding: 18, paddingBottom: 40 }} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* BLOCK RING SECTION */}
        <Text variant="label" style={{ marginBottom: 8 }}>Block Ring</Text>
        <Card padding={16} style={{ marginBottom: 16 }}>
          {blockStatus === null ? (
            <RNView>
              <TouchableOpacity onPress={handleTemporaryBlock} style={[styles.blockOption, styles.tempOption]}>
                <RNView style={styles.blockOptionLeft}>
                  <MaterialCommunityIcons name="pause-circle-outline" size={22} color={theme.accent} />
                  <RNView style={{ marginLeft: 12 }}>
                    <Text variant="bodyStrong">Temporary Block</Text>
                    <Text variant="caption" style={{ marginTop: 2 }}>Can be reversed anytime</Text>
                  </RNView>
                </RNView>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.chevron} />
              </TouchableOpacity>
              <RNView style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />
              <TouchableOpacity onPress={handlePermanentBlock} style={[styles.blockOption, styles.permOption]}>
                <RNView style={styles.blockOptionLeft}>
                  <MaterialCommunityIcons name="lock-outline" size={22} color="#E05A5A" />
                  <RNView style={{ marginLeft: 12 }}>
                    <Text variant="bodyStrong" style={{ color: '#E05A5A' }}>Permanent Block</Text>
                    <Text variant="caption" style={{ marginTop: 2, color: '#E05A5A' }}>Cannot be undone</Text>
                  </RNView>
                </RNView>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#E05A5A" />
              </TouchableOpacity>
            </RNView>
          ) : (
            <RNView>
              <RNView style={styles.statusBlock}>
                <MaterialCommunityIcons
                  name={blockStatus === 'temporary' ? 'pause-circle' : 'lock'}
                  size={28}
                  color={blockStatus === 'temporary' ? theme.accent : '#E05A5A'}
                />
                <Text variant="h3" style={{ marginLeft: 12, color: blockStatus === 'temporary' ? theme.accent : '#E05A5A' }}>
                  {blockStatus === 'temporary' ? 'Temporarily Blocked' : 'Permanently Blocked'}
                </Text>
              </RNView>
              <Text variant="caption" style={{ marginTop: 12 }}>
                {blockStatus === 'temporary'
                  ? 'Your ring is disabled. You can unblock it anytime.'
                  : 'Your ring is permanently disabled. Contact support for a new ring.'}
              </Text>
              <Button label="Unblock Ring" style={{ marginTop: 16 }} onPress={unblockRing} variant={blockStatus === 'permanent' ? 'secondary' : 'primary'} />
            </RNView>
          )}
        </Card>

        {/* SECURITY SETTINGS */}
        <Text variant="label" style={{ marginBottom: 8 }}>Security</Text>
        <Card padding={16} style={{ marginBottom: 16 }}>
          <RNView style={styles.rowJustify}>
            <Text variant="bodyStrong">Auto Safety Mode</Text>
            <Switch
              value={autoSafety}
              onValueChange={async (v) => {
                setAutoSafety(v);
                const newActivity = `Safety mode ${v ? 'enabled' : 'disabled'} · ${new Date().toLocaleString()}`;
                setLastActivity(newActivity);

                // Auto-save
                const payload = { blockStatus, autoSafety: v, lastActivity: newActivity, profileVisible, shareActivity };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
              }}
            />
          </RNView>
          <RNView style={{ marginTop: 12 }}>
            <Text variant="subtext">Last ring activity</Text>
            <Text variant="bodyStrong" style={{ marginTop: 6 }}>{lastActivity}</Text>
          </RNView>
        </Card>

      </ScrollView>

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <RNView style={styles.modalOverlay}>
          <Card padding={20} style={styles.authModal}>
            <Text variant="h3" style={{ marginBottom: 4 }}>Verify Identity</Text>
            <Text variant="caption" style={{ marginBottom: 20 }}>Permanent block requires authentication.</Text>

            {authMethod === 'pin' && (
              <RNView>
                <Text variant="subtext" style={{ marginBottom: 8 }}>Enter App Lock PIN</Text>
                <TextInput
                  value={pinInput}
                  onChangeText={setPinInput}
                  placeholder="••••"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.pinInput}
                />
              </RNView>
            )}

            {authMethod === 'biometric' && (
              <RNView style={{ alignItems: 'center', marginBottom: 20 }}>
                <MaterialCommunityIcons name="fingerprint" size={48} color={theme.accent} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  rowJustify: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  tempOption: { paddingRight: 0 },
  permOption: { paddingRight: 0 },
  blockOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusBlock: { flexDirection: 'row', alignItems: 'center' },
  historyEntry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  historyIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(109,94,246,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  authModal: { width: '85%' },
  pinInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 16, textAlign: 'center', letterSpacing: 8, marginBottom: 16 }
});
