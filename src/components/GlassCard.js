/**
 * PREMIUM GLASS MORPHISM CARD COMPONENT
 * iOS 17 / VisionOS Style
 * 
 * Features:
 * - BlurView background
 * - Glass effect with transparency
 * - Premium borders and shadows
 * - Smooth animations
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';

export default function GlassCard({ 
  children, 
  style, 
  blurIntensity = 50,
  borderRadius = 20,
  padding = 16,
  glowColor = null,
  onPress = null,
  animated = false,
  ...props 
}) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      opacityAnim.setValue(1);
    }
  }, [animated]);

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const glow = glowColor || theme.colors.secondary;

  const containerStyle = [
    styles.container,
    {
      borderRadius,
      backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.04)' : theme.colors.card + '20',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      shadowColor: glow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    },
    style,
  ];

  const contentStyle = {
    padding,
    borderRadius,
    overflow: 'hidden',
  };

  const Component = onPress ? Animated.TouchableOpacity : Animated.View;
  const touchableProps = onPress ? {
    onPress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    activeOpacity: 1,
  } : {};

  return (
    <Component style={containerStyle} {...touchableProps} {...props}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={contentStyle}
        >
          {children}
        </BlurView>
      ) : (
        <Animated.View style={contentStyle}>
          {children}
        </Animated.View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
  },
});
