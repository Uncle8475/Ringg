/**
 * PREMIUM BUTTON COMPONENT
 * iOS 17 Style with Glow and Animation
 */

import React, { useRef } from 'react';
import { StyleSheet, Animated, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
  ...props
}) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
      Animated.timing(glowAnim, {
        toValue: 0.6,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: [theme.colors.secondary, theme.colors.secondary],
          text: theme.colors.textOnDark,
          glow: theme.colors.secondary,
          border: theme.colors.secondary,
        };
      case 'secondary':
        return {
          bg: [theme.colors.primary, theme.colors.primary],
          text: theme.colors.textOnDark,
          glow: theme.colors.primary,
          border: theme.colors.primary,
        };
      case 'outline':
        return {
          bg: ['transparent', 'transparent'],
          text: theme.colors.textPrimary,
          glow: theme.colors.secondary,
          border: theme.colors.border,
        };
      case 'danger':
        return {
          bg: [theme.colors.accent, theme.colors.accent],
          text: theme.colors.textOnDanger,
          glow: theme.colors.accent,
          border: theme.colors.accent,
        };
      default:
        return {
          bg: [theme.colors.secondary, theme.colors.secondary],
          text: theme.colors.textOnDark,
          glow: theme.colors.secondary,
          border: theme.colors.secondary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 12,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: 18,
          paddingHorizontal: 32,
          borderRadius: 18,
          fontSize: 18,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 16,
          fontSize: 16,
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    {
      transform: [{ scale: scaleAnim }],
      borderRadius: sizeStyles.borderRadius,
      opacity: isDisabled ? 0.5 : 1,
    },
    style,
  ];

  const shadowStyle = {
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: glowAnim,
    shadowRadius: 24,
    elevation: 20,
  };

  return (
    <Animated.View style={[buttonStyle, shadowStyle]}>
      <Animated.TouchableOpacity
        onPress={isDisabled ? null : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
        {...props}
      >
        <LinearGradient
          colors={colors.bg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
              borderWidth: variant === 'outline' ? 1.5 : 0,
              borderColor: colors.border,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
              <Text
                style={[
                  styles.text,
                  {
                    color: colors.text,
                    fontSize: sizeStyles.fontSize,
                    fontWeight: '700',
                    letterSpacing: 0.4,
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </Animated.TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: 'visible',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});
