import React, { useState } from 'react';
import { SafeAreaView, View as RNView, StyleSheet, TextInput } from 'react-native';
import RingAnimation from '../components/RingAnimation';
import { Text, TouchableOpacity } from '../uikit';
import { useTheme } from '../theme';

import { useAuth, SETUP_STAGES } from '../lib/authContext';

export default function Personalization({ navigation }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { setSetupStage, updateLocalProfile } = useAuth();
  const [name, setName] = useState('');

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    // Finalize Setup
    await updateLocalProfile({ ring_nickname: trimmed });
    setSetupStage(SETUP_STAGES.COMPLETE);

    // Navigate to Complete screen
    if (navigation && navigation.navigate) {
      navigation.navigate('Complete');
    }
  };

  const isComplete = name.trim().length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <RNView style={styles.inner}>
        <RingAnimation size={110} />

        <Text style={[styles.title, { color: theme.text }]}>Make it yours</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Give your ring a nickname</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder="My Cosmic Ring"
          placeholderTextColor={theme.textSecondary}
          maxLength={50}
        />

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
          <Text style={[styles.btnText, { color: theme.textOnDark }]}>Continue</Text>
        </TouchableOpacity>
      </RNView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  subtitle: { marginTop: 6, marginBottom: 24, color: theme.textSecondary },
  input: { marginBottom: 32, width: '86%', padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 16, backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary },
  btn: { paddingVertical: 16, paddingHorizontal: 28, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  btnText: { fontWeight: '700', fontSize: 16 }
});
