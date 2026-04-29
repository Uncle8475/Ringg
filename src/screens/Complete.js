import React from 'react';
import { SafeAreaView, View as RNView, StyleSheet, Image } from 'react-native';
import RingAnimation from '../components/RingAnimation';
import { Text, TouchableOpacity } from '../uikit';

import { useTheme } from '../theme';

import { useAuth, SETUP_STAGES } from '../lib/authContext';

export default function Complete({ navigation, onGoHome }) {
  const theme = useTheme();
  const { setSetupStage } = useAuth();

  const handleGoHome = () => {
    setSetupStage(SETUP_STAGES.COMPLETE);
    // Force app to re-render and show main app
    // The RootNavigator will detect setupStage is COMPLETE and switch to AppStack
    if (onGoHome) {
      onGoHome();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <RNView style={styles.inner}>
        <RingAnimation size={200} glow />
        <Text style={[styles.title, { color: theme.textPrimary || theme.text }]}>Your Cosmic Ring is ready</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary || theme.muted }]}>You’re all set</Text>
        <RNView style={styles.confettiPlaceholder} />
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.secondary || theme.primary }]} onPress={handleGoHome}>
          <Text style={[styles.btnText, { color: theme.textOnDark || theme.textPrimary }]}>Go to Home</Text>
        </TouchableOpacity>

        {/* COSMIC ATTIRE Logo - Subtle Watermark */}
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.watermarkLogo}
          resizeMode="contain"
        />
      </RNView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  subtitle: { marginTop: 6 },
  confettiPlaceholder: { width: 160, height: 80, marginTop: 16 },
  btn: { marginTop: 28, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  btnText: { fontWeight: '700', fontSize: 16 },
  watermarkLogo: {
    position: 'absolute',
    bottom: 30,
    width: 80,
    height: 40,
    opacity: 0.15
  }
});
