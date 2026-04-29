/**
 * BACKGROUND ORBS - Ambient Glow Effect
 * Creates floating blurred orbs for depth and premium feel
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';

const { width, height } = Dimensions.get('window');

export default function BackgroundOrbs({ show = true, reduceMotion = false }) {
  const theme = useTheme();
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb1X = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!show) {
      opacity.setValue(0);
      return;
    }

    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (reduceMotion) return;

    // Floating animation for orb 1
    const orb1Animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1Y, {
            toValue: -20,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1X, {
            toValue: 10,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1Y, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1X, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Floating animation for orb 2
    const orb2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Y, {
          toValue: 15,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(orb2Y, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    orb1Animation.start();
    orb2Animation.start();

    return () => {
      orb1Animation.stop();
      orb2Animation.stop();
    };
  }, [show, reduceMotion]);

  if (!show) return null;

  const accentColor = theme.colors.secondary;
  const primaryColor = theme.colors.primary;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      {/* Orb 1 - Top accent glow */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            backgroundColor: accentColor,
            transform: [
              { translateY: orb1Y },
              { translateX: orb1X },
            ],
          },
        ]}
      />

      {/* Orb 2 - Bottom right glow */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            backgroundColor: primaryColor,
            transform: [{ translateY: orb2Y }],
          },
        ]}
      />

      {/* Orb 3 - Middle left subtle glow */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            backgroundColor: accentColor,
          },
        ]}
      />

      {/* Blur overlay for iOS */}
      {Platform.OS === 'ios' && (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.08,
  },
  orb1: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
    opacity: 0.12,
  },
  orb2: {
    width: 320,
    height: 320,
    bottom: -100,
    right: -80,
    opacity: 0.06,
  },
  orb3: {
    width: 200,
    height: 200,
    top: height * 0.4,
    left: -60,
    opacity: 0.05,
  },
});
