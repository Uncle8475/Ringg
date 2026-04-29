import React, { useEffect, useState } from 'react';
import { View as RNView, StyleSheet, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

import Header from '../components/Header';
import { useTheme } from '../theme';
import { Card, Text, TouchableOpacity, Button } from '../uikit';

const STORAGE_KEY = 'appLockSettings';

export default function AppLock() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState('pin');
  const [autoLock, setAutoLock] = useState('immediate');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const s = JSON.parse(saved);
          setEnabled(!!s.enabled);
          setMethod(s.method || 'pin');
          setAutoLock(s.autoLock || 'immediate');
        }
      } catch (e) { }
    })();
  }, []);

  const handleToggle = async (value) => {
    if (value) {
      // Enabling App Lock
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Not Available', 'Your device does not have secure lock set up (PIN/Pattern/Biometrics). Please set it up in device settings first.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to Enable App Lock',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel'
      });

      if (result.success) {
        setEnabled(true);
        saveSettings(true, method, autoLock);
      } else {
        // Only disable if user cancelled or failed. Do not change state if cancelling "Disable".
        // Wait, logic: value is true (enabling). If fail, keep false.
        setEnabled(false);
      }
    } else {
      // Disabling App Lock
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to Disable App Lock',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setEnabled(false);
        saveSettings(false, method, autoLock);
      } else {
        // Failed to auth to disable -> keep enabled
        setEnabled(true);
      }
    }
  };

  const saveSettings = async (isEnabled, limitMethod, timing) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: isEnabled, method: limitMethod, autoLock: timing }));
  };

  const handleManualSave = () => {
    saveSettings(enabled, method, autoLock);
    Alert.alert('App Lock', 'Settings saved.');
  };

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="App Lock" />
      <RNView style={{ padding: 18 }}>
        <Card padding={16} style={{ marginBottom: 16 }}>
          <RNView style={styles.row}>
            <Text variant="bodyStrong">Enable App Lock</Text>
            <Switch value={enabled} onValueChange={handleToggle} />
          </RNView>
          <Text variant="caption" style={{ marginTop: 8 }}>Current status: {enabled ? 'Enabled' : 'Disabled'}</Text>
        </Card>

        <Text variant="label" style={{ marginBottom: 8 }}>Lock Method</Text>
        <Card padding={16} style={{ marginBottom: 16 }}>
          <Option label="Device PIN / Pattern" selected={method === 'pin'} onPress={() => setMethod('pin')} theme={theme} />
          <Option label="Biometric (if available)" selected={method === 'biometric'} onPress={() => setMethod('biometric')} theme={theme} />
        </Card>

        <Text variant="label" style={{ marginBottom: 8 }}>Auto-lock timing</Text>
        <Card padding={16}>
          <Option label="Immediately" selected={autoLock === 'immediate'} onPress={() => setAutoLock('immediate')} theme={theme} />
          <Option label="After 30 seconds" selected={autoLock === '30s'} onPress={() => setAutoLock('30s')} theme={theme} />
          <Option label="After 1 minute" selected={autoLock === '1m'} onPress={() => setAutoLock('1m')} theme={theme} />
        </Card>

        <Button label="Save" style={{ marginTop: 16 }} onPress={handleManualSave} />
      </RNView>
    </RNView>
  );
}

const Option = ({ label, selected, onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text variant="bodyStrong">{label}</Text>
    <RNView style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: selected ? theme.secondary : theme.border, alignItems: 'center', justifyContent: 'center' }}>
      {selected ? <RNView style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.secondary }} /> : null}
    </RNView>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
});
