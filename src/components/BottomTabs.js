import React, { useEffect, useMemo, useRef } from 'react';
import {
  View as RNView,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Text, TouchableOpacity } from '../uikit';
import { useTheme } from '../theme';

const TAB_HEIGHT = 66;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const tabs = [
  { key: 'Home', label: 'Home', icon: (c, s) => <Feather name="home" size={s} color={c} /> },
  { key: 'Payments', label: 'Pay', icon: (c, s) => <Feather name="credit-card" size={s} color={c} /> },
  { key: 'Ring', label: 'Ring', icon: (c, s) => <MaterialCommunityIcons name="ring" size={s} color={c} /> },
  { key: 'Safety', label: 'Safety', icon: (c, s) => <MaterialCommunityIcons name="shield-outline" size={s} color={c} /> },
  { key: 'Settings', label: 'Settings', icon: (c, s) => <Feather name="settings" size={s} color={c} /> },
];

export default function BottomTabs({ currentRouteName = 'Home', onNavigate }) {
  const theme = useTheme();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const TAB_WIDTH = (SCREEN_WIDTH - 24) / tabs.length;
  const INDICATOR_WIDTH = 28;

  // Use prop directly
  const currentRoute = currentRouteName;

  const getActiveTab = () => {
    if (tabs.find(t => t.key === currentRoute)) return currentRoute;
    if (currentRoute === 'TransactionDetail') return 'Payments';
    if (['Profile', 'WalletSettings', 'TransactionLimits', 'SecuritySettings', 'AppLock',
      'Notifications', 'Appearance', 'Support', 'About', 'Privacy', 'HelpSupport'].includes(currentRoute)) {
      return 'Settings';
    }
    if (currentRoute === 'Offers') return 'Ring';
    return 'Home';
  };

  const activeTab = getActiveTab();
  const activeIndex = tabs.findIndex(t => t.key === activeTab);

  useEffect(() => {
    if (activeIndex < 0) return;

    const targetX =
      activeIndex * TAB_WIDTH + TAB_WIDTH / 2 - INDICATOR_WIDTH / 2;

    Animated.spring(indicatorX, {
      toValue: targetX,
      useNativeDriver: true,
      damping: 18,
      stiffness: 160,
      mass: 0.6,
    }).start();
  }, [activeIndex]);

  return (
    <RNView style={styles.wrapper}>
      <Animated.View style={styles.container}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
            <RNView style={styles.contentWrapper}>
              {/* ACTIVE INDICATOR */}
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: INDICATOR_WIDTH,
                    transform: [{ translateX: indicatorX }],
                  },
                ]}
              />

              <RNView style={styles.inner}>
                {tabs.map(t => {
                  const active = t.key === activeTab;
                  const color = active ? theme.colors.secondary : theme.colors.iconInactive;
                  const labelStyle = active ? styles.labelActive : styles.labelInactive;

                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={styles.tab}
                      activeOpacity={0.7}
                      onPress={() => onNavigate && onNavigate(t.key)}
                    >
                      <Animated.View style={active ? styles.activeIconGlow : null}>
                        {t.icon(color, 22)}
                      </Animated.View>
                      <Text style={[styles.label, labelStyle]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </RNView>
            </RNView>
          </BlurView>
        ) : (
          <RNView style={[styles.blurContainer, styles.androidBg]}>
            <RNView style={styles.contentWrapper}>
              {/* ACTIVE INDICATOR */}
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: INDICATOR_WIDTH,
                    transform: [{ translateX: indicatorX }],
                  },
                ]}
              />

              <RNView style={styles.inner}>
                {tabs.map(t => {
                  const active = t.key === activeTab;
                  const color = active ? theme.colors.secondary : theme.colors.iconInactive;
                  const labelStyle = active ? styles.labelActive : styles.labelInactive;

                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={styles.tab}
                      activeOpacity={0.7}
                      onPress={() => onNavigate && onNavigate(t.key)}
                    >
                      <Animated.View style={active ? styles.activeIconGlow : null}>
                        {t.icon(color, 22)}
                      </Animated.View>
                      <Text style={[styles.label, labelStyle]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </RNView>
            </RNView>
          </RNView>
        )}
      </Animated.View>
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    zIndex: 100,
    elevation: 0,
  },
  container: {
    height: TAB_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 24,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  androidBg: {
    backgroundColor: theme.colors.card + 'F5',
  },
  contentWrapper: {
    flex: 1,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconGlow: {
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  label: {
    fontSize: 11,
    marginTop: 5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: theme.colors.secondary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelInactive: {
    color: theme.colors.iconInactive,
  },
});
