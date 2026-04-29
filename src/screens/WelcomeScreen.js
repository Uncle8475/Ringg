import React from 'react';
import { SafeAreaView, View as RNView, StyleSheet, Image } from 'react-native';
import RingAnimation from '../components/RingAnimation';
import { Text, TouchableOpacity } from '../uikit';

import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  const onStart = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <RNView style={styles.inner}>
        <RingAnimation size={180} glow />
        <Text style={[styles.title, { color: theme.text }]}>Let's set up your Cosmic Ring</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>This will only take a moment</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={onStart}>
          <Text style={styles.btnText}>Start Setup</Text>
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
  logo: { fontSize: 24, fontWeight: '900', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 24 },
  subtitle: { marginTop: 8, color: '#9aa4b2' },
  btn: { marginTop: 32, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  watermarkLogo: {
    position: 'absolute',
    bottom: 30,
    width: 80,
    height: 40,
    opacity: 0.15
  }
});
