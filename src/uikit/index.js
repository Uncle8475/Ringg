/**
 * Premium UI Kit for COSMIC ATTIRE
 * Uses standard React Native components with enhanced styling
 * No external dependencies - fully compatible with Expo 48
 */

import React, { useMemo, useRef } from 'react';
import {
  View,
  Text as RNText,
  TouchableOpacity as RNTouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { useTheme } from '../theme';

// Enhanced Card Component
export const Card = ({ children, style, padding = 16, onPress, ...props }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const Wrapper = onPress ? RNTouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.card, { padding }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

// Enhanced Text Components
export const Text = ({ children, style, variant = 'body', ...props }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const textStyle = styles[variant] || styles.body;
  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

// Enhanced Button Component
export const Button = ({ label, onPress, style, variant = 'primary', ...props }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useRef(new Animated.Value(1)).current;

  const buttonStyles = useMemo(() => {
    if (variant === 'danger') return styles.buttonDanger;
    if (variant === 'secondary') return styles.buttonSecondary;
    return styles.buttonPrimary;
  }, [styles, variant]);

  const textStyles = useMemo(() => {
    if (variant === 'danger') return styles.buttonTextOnDanger;
    if (variant === 'secondary') return styles.buttonTextOnDark;
    return styles.buttonTextDark;
  }, [styles, variant]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }).start();
  };

  return (
    <Animated.View style={[styles.buttonScale, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.button, buttonStyles, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <RNText style={textStyles}>{label}</RNText>
      </Pressable>
    </Animated.View>
  );
};

// Enhanced TouchableOpacity with better defaults
export const TouchableOpacity = RNTouchableOpacity;

const createStyles = (theme) => StyleSheet.create({
  // Card Styles
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: `${theme.colors.border}30`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  // Typography Variants
  h1: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  h3: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    color: theme.colors.textPrimary,
    letterSpacing: 0.1,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: theme.colors.textSecondary,
    opacity: 0.85,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    color: theme.colors.textMuted,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Button Styles
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 0,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.4,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: `${theme.colors.border}40`,
  },
  buttonDanger: {
    backgroundColor: theme.colors.accent,
    borderWidth: 0,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.4,
  },
  buttonTextOnDark: {
    color: theme.colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonTextOnDanger: {
    color: theme.colors.textOnDanger,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonTextDark: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonScale: {},
});
