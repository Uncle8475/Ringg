import React, { useMemo, useState, useEffect } from 'react';
import { View as RNView, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useTheme } from '../theme';
import { Card, Text, TouchableOpacity } from '../uikit';
import { getWalletBalance, getRecentTransactions } from '../lib/dbHelpers';

export default function WalletSettings() {
  const navigation = useNavigation();
  const theme = useTheme();

  const [balance, setBalance] = useState('₹0');
  const [transactions, setTransactions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Loading...');

  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      // 1. Get Wallet Balance
      const { balance: bal } = await getWalletBalance();
      setBalance(currency.format(bal));
      setLastUpdated(new Date().toLocaleString());

      // 2. Get Transactions
      const { transactions: txs } = await getRecentTransactions(10);
      const formattedTxs = txs.map(t => ({
        id: t.id,
        merchant: t.merchant || 'System',
        amount: (t.type === 'topup' ? '+' : '-') + currency.format(t.amount),
        date: formatTime(t.created_at),
        status: t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Success',
        location: t.location || 'Unknown',
        type: t.type
      }));
      setTransactions(formattedTxs);
    } catch (e) {
      console.warn('Error loading wallet settings:', e);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Wallet & Payments" />
      <RNView style={{ padding: 18 }}>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <Text variant="subtext">Current Wallet Balance</Text>
          <Text variant="h1" style={{ marginTop: 6 }}>{balance}</Text>
          <Text variant="caption" style={{ marginTop: 8 }}>Last updated: {lastUpdated}</Text>
        </Card>

        <Text variant="label" style={{ marginVertical: 12 }}>Transaction History</Text>
        <FlatList
          data={transactions}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 20 }}>No transactions found</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.txRow} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
              <RNView style={{ flex: 1 }}>
                <Text variant="bodyStrong">{item.merchant}</Text>
                <Text variant="caption" style={{ marginTop: 4 }}>{item.date} · {item.location}</Text>
              </RNView>
              <RNView style={{ alignItems: 'flex-end' }}>
                <Text variant="bodyStrong" style={{ color: item.type === 'topup' ? theme.success : theme.text }}>{item.amount}</Text>
                <Text variant="caption" style={{ marginTop: 4 }}>{item.status}</Text>
              </RNView>
            </TouchableOpacity>
          )}
        />
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }
});
