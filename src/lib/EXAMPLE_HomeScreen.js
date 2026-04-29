import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../lib/authContext';
import {
  getUserProfile,
  getUserRings,
  getRecentTransactions,
  getTransactionStats,
  updateRingStatus,
  syncRing,
  addTransaction,
} from '../lib/dbHelpers';
import { signOut } from '../lib/authHelpers';

/**
 * ============================================================================
 * HOME SCREEN - SUPABASE INTEGRATION EXAMPLE
 * ============================================================================
 * Demonstrates:
 * - Loading user profile from Supabase
 * - Fetching user rings with RLS protection
 * - Fetching recent transactions
 * - Updating ring status (blocking/unblocking)
 * - Syncing ring data
 * - Error handling and refresh patterns
 * ============================================================================
 */

const HomeScreen = ({ navigation }) => {
  const { user, profile, isAuthenticated } = useAuth();

  const [rings, setRings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, payments: 0, refunds: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all user data from Supabase
   */
  const loadData = useCallback(async () => {
    try {
      setError(null);

      // Parallel load for better performance
      const [ringsResult, transactionsResult, statsResult] = await Promise.all([
        getUserRings(),
        getRecentTransactions(10),
        getTransactionStats(),
      ]);

      if (ringsResult.error) {
        console.error('[Home] Rings error:', ringsResult.error);
      }
      if (transactionsResult.error) {
        console.error('[Home] Transactions error:', transactionsResult.error);
      }
      if (statsResult.error) {
        console.error('[Home] Stats error:', statsResult.error);
      }

      setRings(ringsResult.rings || []);
      setTransactions(transactionsResult.transactions || []);
      setStats(statsResult.stats || { total: 0, payments: 0, refunds: 0 });
    } catch (err) {
      console.error('[Home] Load data error:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Toggle ring status (block/unblock)
   */
  const handleToggleRingStatus = async (ringId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === 'active'
          ? 'temp_blocked'
          : currentStatus === 'temp_blocked'
          ? 'permanent_blocked'
          : 'active';

      const { ring, error } = await updateRingStatus(ringId, newStatus);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      // Update local state
      setRings(
        rings.map((r) =>
          r.id === ringId ? { ...r, status: newStatus } : r
        )
      );

      Alert.alert('Success', `Ring status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update ring status');
    }
  };

  /**
   * Sync ring with device
   */
  const handleSyncRing = async (ringId) => {
    try {
      const { ring, error } = await syncRing(ringId);

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      // Update local state
      setRings(
        rings.map((r) =>
          r.id === ringId
            ? { ...r, last_sync: new Date().toISOString() }
            : r
        )
      );

      Alert.alert('Success', 'Ring synced successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to sync ring');
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        Alert.alert('Error', error);
      } else {
        // AuthContext will handle state update via onAuthStateChange
        navigation.replace('Auth');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Not Authenticated</Text>
          <Text style={styles.subtitle}>Please sign in first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.name || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>₹{stats.total.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Payments</Text>
            <Text style={styles.statValue}>₹{stats.payments.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Refunds</Text>
            <Text style={styles.statValue}>₹{stats.refunds.toFixed(2)}</Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading your data...</Text>
          </View>
        ) : (
          <>
            {/* Rings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rings ({rings.length})</Text>

              {rings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No rings paired yet</Text>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => Alert.alert('Info', 'Add ring feature coming soon')}
                  >
                    <Text style={styles.buttonText}>+ Add Ring</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                rings.map((ring) => (
                  <View key={ring.id} style={styles.ringCard}>
                    <View style={styles.ringInfo}>
                      <Text style={styles.ringName}>Ring {ring.ring_id}</Text>
                      <View style={styles.ringStatusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                ring.status === 'active'
                                  ? '#10b981'
                                  : ring.status === 'temp_blocked'
                                  ? '#f59e0b'
                                  : '#ef4444',
                            },
                          ]}
                        />
                        <Text style={styles.statusText}>{ring.status}</Text>
                      </View>
                      <Text style={styles.lastSync}>
                        Last sync: {new Date(ring.last_sync).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.ringActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSyncRing(ring.id)}
                      >
                        <Text style={styles.actionButtonText}>Sync</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          ring.status !== 'active' && styles.unblockButton,
                        ]}
                        onPress={() => handleToggleRingStatus(ring.id, ring.status)}
                      >
                        <Text style={styles.actionButtonText}>
                          {ring.status === 'active' ? 'Block' : 'Unblock'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>

              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                transactions.map((tx) => (
                  <TouchableOpacity
                    key={tx.id}
                    style={styles.transactionCard}
                    onPress={() =>
                      Alert.alert(
                        'Transaction',
                        `Type: ${tx.type}\nAmount: ₹${tx.amount}\nDate: ${new Date(
                          tx.created_at
                        ).toLocaleDateString()}`
                      )
                    }
                  >
                    <View style={styles.txInfo}>
                      <Text style={styles.txType}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </Text>
                      <Text style={styles.txTime}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        tx.type === 'refund' && { color: '#10b981' },
                      ]}
                    >
                      {tx.type === 'refund' ? '+' : '-'}₹{tx.amount}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  ringCard: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ringInfo: {
    flex: 1,
  },
  ringName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  ringStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#999',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  lastSync: {
    color: '#666',
    fontSize: 12,
  },
  ringActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unblockButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  txTime: {
    color: '#999',
    fontSize: 12,
  },
  txAmount: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
});

export default HomeScreen;
