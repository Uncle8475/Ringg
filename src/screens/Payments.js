import React, { useState } from 'react';
import { View as RNView, StyleSheet, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme';
import Header from '../components/Header';
import { Card, Text, Button, TouchableOpacity } from '../uikit';
import AddMoneyModal from '../components/AddMoneyModal';
import { getRazorpayCheckoutUrl } from '../utils/razorpayConfig';
import { getWalletBalance, updateWalletBalance, getRecentTransactions, addTransaction } from '../lib/dbHelpers';

WebBrowser.maybeCompleteAuthSession();

export default function Payments() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [balance, setBalance] = useState('₹0');
  const [rawBalance, setRawBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dailyLimit = 10000;

  // Refresh data on focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    // Load Balance
    const { balance: bal } = await getWalletBalance();
    setRawBalance(bal);
    setBalance(currency.format(bal));

    // Load Transactions
    const { transactions: txs } = await getRecentTransactions(20);
    setTransactions(txs);
  };

  const usedToday = transactions
    .filter(t => isSameDay(new Date(t.created_at), new Date()) && t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const progressPercent = (usedToday / dailyLimit) * 100;

  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  // Razorpay Payment Handler
  const handleAddMoneyClick = () => {
    setIsAddMoneyModalVisible(true);
  };

  const handlePaymentConfirm = async (amount) => {
    setIsProcessing(true);
    try {
      // For this demo, we mock the Razorpay success
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 14).toUpperCase()}`;
      handlePaymentSuccess({
        razorpay_payment_id: mockPaymentId,
      }, amount);
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (data, amount) => {
    try {
      // 1. Add Transaction to DB
      const { error: txError } = await addTransaction({
        amount: amount,
        type: 'topup',
        merchant: 'Wallet Top-up',
        category: 'Wallet',
        description: `Added via Razorpay (${data.razorpay_payment_id})`
      });

      if (txError) throw new Error(txError);

      // 2. Update Wallet Balance in DB
      const newBalance = Number(rawBalance) + Number(amount);
      const { error: walletError } = await updateWalletBalance(newBalance);

      if (walletError) throw new Error(walletError);

      // 3. Refresh Local Data
      await loadData();

      // Show success alert
      Alert.alert(
        'Payment Successful',
        `₹${amount} added to your COSMIC wallet.\n\nPayment ID: ${data.razorpay_payment_id}`,
        [
          {
            text: 'Done',
            onPress: () => {
              setIsAddMoneyModalVisible(false);
              setIsProcessing(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Payment succeeded but failed to update wallet. Contact support.');
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    // ... same as before
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.tx} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
      <RNView>
        <Text variant="bodyStrong">{item.merchant || 'Unknown'}</Text>
        <Text variant="caption" style={{ marginTop: 4 }}>{formatDisplayDate(item.created_at)}</Text>
      </RNView>
      <Text variant="bodyStrong" style={{
        color: item.type === 'topup' ? theme.secondary : theme.textPrimary
      }}>
        {item.type === 'topup' ? '+' : ''}{currency.format(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  const listHeader = (
    <RNView>
      <Header title="Payments" />

      {/* Wallet Balance Card */}
      <Card style={styles.card} padding={16}>
        <Text variant="subtext">Wallet balance</Text>
        <Text variant="h1" style={styles.balance}>{balance}</Text>

        <RNView style={styles.limitSection}>
          <RNView style={styles.limitHeader}>
            <Text variant="subtext">Daily Limit</Text>
            <Text variant="body">₹{usedToday} of ₹{dailyLimit.toLocaleString()}</Text>
          </RNView>
          <RNView style={styles.progressBar}>
            <RNView style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: theme.secondary }]} />
          </RNView>
        </RNView>

        <RNView style={styles.row}>
          <Button label="Add Money" variant="primary" style={styles.btn} onPress={handleAddMoneyClick} />
        </RNView>
      </Card>


      {/* View Insights CTA */}
      <Card style={[styles.card, styles.insightsCard]} padding={16}>
        <Text variant="h3" style={styles.insightsTitle}>View Your Insights</Text>
        <Text variant="body" style={styles.insightsSubtext}>Track spending patterns, categories, and analytics.</Text>
        <Button
          label="Open Insights"
          variant="secondary"
          style={styles.insightsBtn}
          onPress={() => navigation.navigate('Insights')}
        />
      </Card>

      <Text variant="label" style={styles.section}>Recent Transactions</Text>
    </RNView>
  );

  return (
    <RNView style={{ flex: 1 }}>
      <FlatList
        style={[styles.list, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.container, { paddingBottom: 90 }]}
        data={transactions}
        keyExtractor={i => i.id}
        renderItem={renderTransaction}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
      />
      <AddMoneyModal
        visible={isAddMoneyModalVisible}
        onClose={() => {
          setIsAddMoneyModalVisible(false);
          setIsProcessing(false);
        }}
        onConfirm={handlePaymentConfirm}
        isProcessing={isProcessing}
      />
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  list: { flex: 1 },
  container: { padding: 22 },
  card: { 
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  balance: { 
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  limitSection: { marginTop: 20 },
  limitHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  progressBar: { 
    height: 6, 
    backgroundColor: `${theme.border}30`, 
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  progressFill: { 
    height: 6, 
    borderRadius: 3,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between', gap: 10 },
  btn: { flex: 1 },
  section: { 
    marginVertical: 16,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  tx: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: `${theme.border}20`,
  },
  insightsCard: { 
    backgroundColor: 'rgba(109,94,246,0.08)', 
    borderWidth: 1.5, 
    borderColor: 'rgba(109,94,246,0.35)',
    shadowColor: 'rgba(109,94,246,0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  insightsTitle: { 
    color: theme.accent, 
    marginBottom: 10,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  insightsSubtext: { 
    color: theme.textSecondary, 
    marginBottom: 18,
    opacity: 0.9,
    lineHeight: 20,
  },
  insightsBtn: { width: '100%' },
});

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  if (isSameDay(date, today)) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
