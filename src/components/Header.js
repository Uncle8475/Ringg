import React, { useMemo } from 'react';
import { View as RNView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Text, TouchableOpacity } from '../uikit';

export default function Header({ title, onBack, showBack = true }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  
  const handleBack = () => {
    if (onBack) {
      onBack(); // Use custom onBack if provided
    } else {
      navigation.goBack(); // Otherwise use navigation
    }
  };
  
  return (
    <RNView style={styles.wrap}> 
      <RNView style={styles.inner}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityLabel="Back">
            <MaterialIcons name="arrow-back-ios" size={18} color={theme.colors.textOnDark} />
          </TouchableOpacity>
        ) : <RNView style={styles.backBtn} />}

        <Text variant="bodyStrong" style={styles.title}>{title}</Text>

        <RNView style={styles.right} />
      </RNView>
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  wrap: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: `${theme.colors.secondary}20`,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textOnDark,
    letterSpacing: 0.5,
  },
  right: {
    width: 40,
  },
});
