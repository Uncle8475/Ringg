import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../lib/authContext';
import { getUserRings, addTransaction } from '../lib/dbHelpers';

/**
 * ============================================================================
 * PAYMENTS SCREEN - SUPABASE INTEGRATION EXAMPLE
 * ============================================================================
 * Demonstrates:
 * - Loading user rings (for payment selection)
 * - Creating transaction records in Supabase
 * - Error handling during payment + database operations
 * - Form validation and state management
 * ============================================================================
 */

const PaymentsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();

  const [rings, setRings] = useState([]);
  const [selectedRingId, setSelectedRingId] = useState(null);
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load user's rings on mount
   */
  useEffect(() => {
    loadRings();
  }, []);

  const loadRings = async () => {
    try {
      setError(null);
      const { rings: userRings, error: ringsError } = await getUserRings();

      if (ringsError) {
        setError(ringsError);
        return;
      }

      // Filter active rings only
      const activeRings = userRings.filter((r) => r.status === 'active');
      setRings(activeRings);

      // Auto-select first ring if available
      if (activeRings.length > 0) {
        setSelectedRingId(activeRings[0].id);
      }
    } catch (err) {
      console.error('[Payments] Load rings error:', err);
      setError('Failed to load rings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle payment processing and transaction logging
   */
  const handlePayment = async () => {
    try {
      setError(null);
      setProcessing(true);

      // Validate inputs
      if (!selectedRingId) {
        Alert.alert('Error', 'Please select a ring');
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      const parsedAmount = parseFloat(amount);

      // Simulate payment processing (replace with actual payment gateway)
      // In real app, you would integrate with Razorpay, Stripe, etc.
      await simulatePaymentProcessing(parsedAmount);

      // Log transaction to Supabase
      const { transaction, error: txError } = await addTransaction({
        ring_id: selectedRingId,
        amount: parsedAmount,
        type: 'payment',
        location: location || 'Not specified',
      });

      if (txError) {
        // Payment succeeded but transaction logging failed
        Alert.alert(
          'Partial Success',
          'Payment processed but failed to log in database. Amount: ₹' +
            parsedAmount
        );
        resetForm();
        return;
      }

      // Success
      Alert.alert('Success', `Payment of ₹${parsedAmount} completed!`, [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            navigation.goBack?.();
          },
        },
      ]);
    } catch (err) {
      console.error('[Payments] Payment error:', err);
      Alert.alert('Error', err?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Simulate payment processing (2 seconds)
   * In production, this would be actual payment gateway integration
   */
  const simulatePaymentProcessing = (amount) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setAmount('');
    setLocation('');
    if (rings.length > 0) {
      setSelectedRingId(rings[0].id);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading rings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (rings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>No Active Rings</Text>
          <Text style={styles.subtitle}>
            You need at least one active ring to make a payment
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack?.()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Make a Payment</Text>
          <Text style={styles.subtitle}>
            Logged in as {profile?.name || user?.email}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Ring Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Ring</Text>
          <View style={styles.ringsContainer}>
            {rings.map((ring) => (
              <TouchableOpacity
                key={ring.id}
                style={[
                  styles.ringOption,
                  selectedRingId === ring.id && styles.ringOptionSelected,
                ]}
                onPress={() => setSelectedRingId(ring.id)}
              >
                <View style={styles.ringOptionContent}>
                  <Text style={styles.ringName}>{ring.ring_id}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.statusLabel}>Active</Text>
                  </View>
                </View>
                {selectedRingId === ring.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (₹)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              editable={!processing}
              maxLength={10}
            />
          </View>
          {amount && (
            <Text style={styles.amountPreview}>
              You will pay: ₹{parseFloat(amount || 0).toFixed(2)}
            </Text>
          )}
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Shopping Mall, Restaurant"
            placeholderTextColor="#666"
            value={location}
            onChangeText={setLocation}
            editable={!processing}
          />
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ring</Text>
            <Text style={styles.summaryValue}>
              {rings.find((r) => r.id === selectedRingId)?.ring_id || '-'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>
              ₹{parseFloat(amount || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>
              {location || 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, processing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={processing || !amount}
        >
          {processing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.buttonText}>Processing...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>
              Pay ₹{parseFloat(amount || 0).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Transaction Recording:</Text>
          <Text style={styles.infoText}>
            • Each payment is recorded in Supabase{'\n'}
            • Transaction data is securely stored{'\n'}
            • You can view all transactions in dashboard{'\n'}
            • Transaction history is private to you (RLS enforced)
          </Text>
        </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  ringsContainer: {
    gap: 8,
  },
  ringOption: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ringOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#1a2540',
  },
  ringOptionContent: {
    flex: 1,
  },
  ringName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusLabel: {
    color: '#10b981',
    fontSize: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2540',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3f5f',
    paddingLeft: 16,
  },
  currencySymbol: {
    color: '#6366f1',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    padding: 16,
  },
  amountPreview: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a3f5f',
  },
  summaryCard: {
    backgroundColor: '#1a2540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3f5f',
  },
  summaryLabel: {
    color: '#999',
    fontSize: 13,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 13,
  },
  infoBox: {
    backgroundColor: '#1a3a3a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  infoTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#d1fae5',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default PaymentsScreen;
