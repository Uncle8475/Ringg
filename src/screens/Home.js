import React, { useEffect, useMemo, useState } from 'react';
import { View as RNView, StyleSheet, FlatList, Dimensions, AccessibilityInfo, Alert, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme';
import HeroHeader from '../components/HeroHeader';
import GlassCard from '../components/GlassCard';
import BackgroundOrbs from '../components/BackgroundOrbs';
import { Card, Text, TouchableOpacity } from '../uikit';
import { getRecentTransactions } from '../lib/dbHelpers';

const { width } = Dimensions.get('window');

const TIME_RANGES = [
  { key: 'morning', start: 5, end: 11, icon: '☀️', emoji: '☀️' },
  { key: 'afternoon', start: 11, end: 16, icon: '🌤️', emoji: '🌤️' },
  { key: 'evening', start: 16, end: 19, icon: '🌇', emoji: '🌅' },
  { key: 'night', start: 19, end: 24, icon: '🌙', emoji: '🌙✨' },
  { key: 'night', start: 0, end: 5, icon: '🌙', emoji: '🌙✨' },
];

function getTimeState(date = new Date()) {
  const h = date.getHours();
  return TIME_RANGES.find(r => h >= r.start && h < r.end) || TIME_RANGES[0];
}

// === AI Suggestion Engine ===
// Generates context-aware suggestions based on recent activity
const generateSuggestion = (activityList) => {
  if (!activityList || activityList.length === 0) {
    return {
      id: 'neutral',
      text: 'Your ring is active and ready to use.',
      type: 'neutral',
      timestamp: new Date(),
    };
  }

  const mostRecent = activityList[0];
  const activityText = mostRecent.text.toLowerCase();

  // Payment-related
  if (activityText.includes('payment')) {
    return {
      id: 'payment-confirm',
      text: 'You just made a payment using your ring. View transaction details.',
      type: 'payment',
      timestamp: new Date(),
    };
  }

  // Wallet top-up
  if (activityText.includes('added to wallet') || activityText.includes('top')) {
    return {
      id: 'wallet-topup',
      text: 'Your wallet was topped up successfully. You\'re ready for your next payment.',
      type: 'wallet',
      timestamp: new Date(),
    };
  }

  // Ring usage
  if (activityText.includes('ring used')) {
    return {
      id: 'ring-usage',
      text: 'Your ring was used recently. Everything looks secure.',
      type: 'security',
      timestamp: new Date(),
    };
  }

  // Ring blocked
  if (activityText.includes('ring blocked')) {
    return {
      id: 'ring-blocked',
      text: 'Your ring has been temporarily disabled. Enable it when ready.',
      type: 'security',
      timestamp: new Date(),
    };
  }

  // Default neutral suggestion
  return {
    id: 'neutral-default',
    text: 'Your ring is active and ready to use.',
    type: 'neutral',
    timestamp: new Date(),
  };
};

// Get relative time string
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return 'more than a day ago';
};

export default function Home() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const [now, setNow] = useState(new Date());
  const [timeState, setTimeState] = useState(getTimeState());
  const [reduceMotion, setReduceMotion] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('ready'); // 'ready' | 'attention' | 'blocked'
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Recent activity data (real-time events)
  const [recentActivity, setRecentActivity] = useState([]);

  // Generate current suggestion based on activity
  const currentSuggestion = useMemo(() => {
    // Map DB transaction fields to suggestion engine expected format
    const mappedActivity = recentActivity.map(t => ({
      text: t.merchant ? `Payment at ${t.merchant}` : (t.description || 'Transaction'),
      amount: t.amount,
      ...t
    }));
    const suggestion = generateSuggestion(mappedActivity);
    return suggestion;
  }, [recentActivity]);

  // Time tracking for suggestion metadata
  const [suggestionUpdatedTime, setSuggestionUpdatedTime] = useState(new Date());

  const fetchActivity = async () => {
    const { transactions } = await getRecentTransactions(5);
    // Format for display
    const formatted = transactions.map(t => ({
      id: t.id,
      text: t.type === 'topup' ? `Wallet Top-up` : `Payment at ${t.merchant || 'Merchant'}`,
      amount: t.type === 'topup' ? `+₹${t.amount}` : `-₹${t.amount}`,
      time: new Date(t.created_at),
      type: t.type
    }));
    setRecentActivity(formatted);
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  // Refresh on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchActivity();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const t = setInterval(() => {
      const d = new Date();
      setNow(d);
      setTimeState(getTimeState(d));
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const greeting = useMemo(() => {
    const key = timeState.key;
    if (key === 'morning') return 'Good Morning, Pranjal';
    if (key === 'afternoon') return 'Good Afternoon, Pranjal';
    if (key === 'evening') return 'Good Evening, Pranjal';
    return 'Good Night, Pranjal';
  }, [timeState]);

  const quickActions = [
    {
      id: 'block',
      title: 'Block Ring',
      subtitle: 'Disable all ring features',
      iconColor: theme.colors.accent,
      icon: 'shield-lock-outline',
      cardStyle: styles.actionCard,
    },
    {
      id: 'add',
      title: 'Add Money',
      subtitle: 'Top up your wallet',
      iconColor: theme.colors.secondary,
      icon: 'wallet-outline',
      cardStyle: styles.actionCard,
    },
    {
      id: 'device',
      title: 'Add Device',
      subtitle: 'Pair new ring',
      iconColor: theme.colors.secondary,
      icon: 'plus-circle-outline',
      cardStyle: styles.actionCard,
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'View & edit profile',
      iconColor: theme.colors.textPrimary,
      icon: 'account-outline',
      cardStyle: styles.actionCard,
    },
  ];

  const onAction = (action) => {
    switch (action) {
      case 'block':
        navigation.navigate('Safety');
        break;
      case 'add':
        navigation.navigate('Payments');
        break;
      case 'device':
        navigation.navigate('RingDetection');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
    }
  };

  // Format time for activity display
  const formatActivityTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get logo styling based on device status
  const getStatusStyle = () => {
    switch (deviceStatus) {
      case 'ready':
        return {
          opacity: 0.9,
          tintColor: theme.colors.textOnDark,
        };
      case 'attention':
        return {
          opacity: 0.7,
          tintColor: theme.colors.textOnDark,
        };
      case 'blocked':
        return {
          opacity: 0.5,
          tintColor: theme.colors.accent,
        };
      default:
        return {
          opacity: 0.9,
          tintColor: theme.colors.textOnDark,
        };
    }
  };

  const getSuggestionUpdateText = () => {
    const diffMs = new Date() - suggestionUpdatedTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins === 0) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMs / 3600000)}h ago`;
  };

  // Get device status text
  const getDeviceStatusText = () => {
    switch (deviceStatus) {
      case 'ready': return 'Device Ready';
      case 'attention': return 'Attention Needed';
      case 'blocked': return 'Device Blocked';
      default: return 'Device Ready';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <BackgroundOrbs show={true} reduceMotion={reduceMotion} />
      
      <HeroHeader
        greeting={greeting}
        now={now}
        timeState={timeState}
        reduceMotion={reduceMotion}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <RNView style={styles.contentWrapper}>
          <Text variant="label" style={styles.sectionLabel}>Quick Actions</Text>
          <RNView style={styles.quickActions}>
            {quickActions.map((a, index) => (
              <GlassCard
                key={a.id}
                style={styles.actionCard}
                borderRadius={22}
                padding={18}
                onPress={() => onAction(a.id)}
                animated={true}
                glowColor={a.iconColor}
              >
                <RNView style={[styles.iconWrap, { borderColor: `${a.iconColor}40` }]}>
                  <MaterialCommunityIcons name={a.icon} size={24} color={a.iconColor} />
                </RNView>
                <Text variant="bodyStrong" style={styles.actionTitle}>{a.title}</Text>
              </GlassCard>
            ))}
          </RNView>

          <RNView style={styles.suggestionSection}>
            <Text variant="label" style={styles.sectionHeader}>💡 Suggestions</Text>
            <GlassCard padding={16} borderRadius={20} animated={true}>
              <Text variant="body" style={styles.suggestionText}>
                {currentSuggestion?.text || 'Your COSMIC Ring is active and ready.'}
              </Text>
              <Text variant="caption" style={styles.suggestionMeta}>Updated {getSuggestionUpdateText()}</Text>
            </GlassCard>
          </RNView>

          <RNView style={styles.activitySection}>
            <Text variant="label" style={styles.sectionHeader}>⏱️ Recent Activity</Text>
            <GlassCard padding={0} borderRadius={20} animated={true}>
              <FlatList
                data={recentActivity}
                keyExtractor={i => i.id}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <RNView>
                    <TouchableOpacity style={styles.activityRow} activeOpacity={0.7}>
                      <RNView style={styles.activityDot} />
                      <RNView style={styles.activityTextWrap}>
                        <Text variant="body">{item.text}</Text>
                      </RNView>
                      {item.amount && (
                        <Text variant="bodyStrong" style={[
                            styles.activityAmount,
                            item.amount.startsWith('+') ? styles.activityAmountPositive : styles.activityAmountNegative
                        ]}>
                          {item.amount}
                        </Text>
                      )}
                      <Text variant="caption" style={styles.activityTime}>{formatActivityTime(item.time)}</Text>
                    </TouchableOpacity>
                    {index < recentActivity.length - 1 && (
                      <RNView style={styles.activityDivider} />
                    )}
                  </RNView>
                )}
                ListEmptyComponent={() => (
                    <RNView style={styles.emptyState}>
                    <Text variant="body">No recent activity yet</Text>
                  </RNView>
                )}
                showsVerticalScrollIndicator={false}
              />
            </GlassCard>
          </RNView>
        </RNView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1, 
    flexDirection: 'column', 
    overflow: 'hidden', 
    backgroundColor: theme.colors.background 
  },
  scrollContent: { 
    paddingTop: 150, 
    paddingBottom: 100 
  },
  contentWrapper: { 
    padding: 22, 
    paddingTop: 16 
  },
  sectionLabel: { 
    marginBottom: 18,
    letterSpacing: 1.2,
    fontSize: 13,
    fontWeight: '800',
    opacity: 0.9,
    textTransform: 'uppercase',
  },

  quickActions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  actionCard: { 
    width: (width - 60) / 2, 
    marginBottom: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: `${theme.colors.card}DD`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionTitle: { 
    textAlign: 'center', 
    marginTop: 6, 
    fontWeight: '800', 
    fontSize: 15, 
    letterSpacing: 0.4 
  },

  deviceCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  deviceLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: `${theme.colors.secondary}40`,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statusLogo: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    resizeMode: 'contain' 
  },
  chev: { 
    color: theme.colors.primary, 
    fontSize: 22 
  },

  suggestionSection: { 
    marginTop: 32 
  },
  sectionHeader: { 
    marginBottom: 14, 
    fontSize: 15, 
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  suggestionText: {
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  suggestionMeta: { 
    marginTop: 12, 
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.7,
    letterSpacing: 0.5,
  },

  activitySection: { 
    marginTop: 32, 
    marginBottom: 0 
  },
  activityRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  activityTextWrap: { 
    flex: 1 
  },
  activityDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: theme.colors.secondary, 
    marginRight: 16, 
    marginTop: 0.5,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  activityAmount: { 
    marginRight: 12, 
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  activityAmountPositive: { 
    color: theme.colors.secondary 
  },
  activityAmountNegative: { 
    color: theme.colors.accent 
  },
  activityTime: { 
    marginLeft: 10, 
    opacity: 0.65, 
    fontSize: 11,
    fontWeight: '600',
  },
  activityDivider: { 
    height: 1, 
    backgroundColor: `${theme.colors.border}15`,
    marginLeft: 40,
    marginRight: 16,
  },
  emptyState: { 
    paddingVertical: 24, 
    paddingHorizontal: 16,
    alignItems: 'center' 
  },
});
