import React, { useMemo, useState } from 'react';
import { View as RNView, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import Header from '../components/Header';
import { Card, Text } from '../uikit';

export default function Insights() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState('weekly');
  const chartHeight = 140;
  const theme = useTheme();
  const styles = createStyles(theme);

  const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const transactions = [
    { id: 't1', merchant: 'Cafe Luna', amount: 120, date: '2026-01-10', category: 'Food' },
    { id: 't2', merchant: 'Campus Gate', amount: 0, date: '2026-01-10', category: 'Access' },
    { id: 't3', merchant: 'Grocer', amount: 540, date: '2025-12-28', category: 'Groceries' },
    { id: 't4', merchant: 'Metro Line', amount: 220, date: '2025-12-29', category: 'Commute' },
    { id: 't5', merchant: 'Solar Cinema', amount: 360, date: '2025-11-18', category: 'Entertainment' },
    { id: 't6', merchant: 'Campus Mart', amount: 180, date: '2025-11-05', category: 'Essentials' },
  ];

  const weeklyData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - index));
      const value = transactions
        .filter(tx => isSameDay(date, new Date(tx.date)))
        .reduce((sum, tx) => sum + tx.amount, 0);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      return { label, value };
    });
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 4 }).map((_, offset) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (3 - offset), 1);
      const value = transactions
        .filter(tx => isSameMonth(monthDate, new Date(tx.date)))
        .reduce((sum, tx) => sum + tx.amount, 0);
      const label = monthDate.toLocaleDateString('en-US', { month: 'short' });
      return { label, value };
    });
  }, [transactions]);

  const chartSeries = range === 'weekly' ? weeklyData : monthlyData;
  const maxValue = Math.max(...chartSeries.map(item => item.value), 1);
  const totalSpent = chartSeries.reduce((sum, item) => sum + item.value, 0);

  // Category breakdown
  const categoryData = useMemo(() => {
    const filtered = range === 'weekly'
      ? transactions.filter(tx => {
          const txDate = new Date(tx.date);
          const today = new Date();
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return txDate >= sevenDaysAgo && txDate <= today;
        })
      : transactions;

    const categories = {};
    filtered.forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
    });

    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [range, transactions]);

  const renderCategoryItem = ({ item }) => (
    <RNView style={styles.categoryItem}>
      <RNView style={styles.categoryInfo}>
        <RNView style={[styles.categoryDot, { backgroundColor: getColorForCategory(item.name) }]} />
        <Text variant="body">{item.name}</Text>
      </RNView>
      <Text variant="bodyStrong">{currency.format(item.amount)}</Text>
    </RNView>
  );

  const listHeader = (
    <RNView>
      <Header title="Spending Insights" />

      <Card style={styles.card} padding={16}>
        <Text variant="subtext">Period</Text>

        <RNView style={styles.segment}>
          {['weekly', 'monthly'].map(key => (
            <RNView
              key={key}
              style={[styles.segmentBtn, range === key && styles.segmentBtnActive]}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: range === key }}
              onTouchEnd={() => setRange(key)}
            >
              <Text
                variant="bodyStrong"
                style={[styles.segmentLabel, range === key && styles.segmentLabelActive]}
              >
                {key === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </RNView>
          ))}
        </RNView>
      </Card>

      {/* Spending Chart */}
      <Card style={styles.card} padding={16}>
        <Text variant="h3">Spending Overview</Text>

        <RNView style={styles.chartWrapper}>
          {chartSeries.map(item => {
            const height = (item.value / maxValue) * chartHeight;
            return (
              <RNView key={item.label} style={styles.barItem}>
                <Text variant="caption" style={styles.barValue}>
                  {item.value ? currency.format(item.value) : '—'}
                </Text>
                <RNView style={[styles.barShell, { height: chartHeight }]}>
                  <RNView style={[styles.barFill, { height, backgroundColor: theme.secondary }]} />
                </RNView>
                <Text variant="caption" style={styles.barLabel}>
                  {item.label}
                </Text>
              </RNView>
            );
          })}
        </RNView>

        <RNView style={styles.legendRow}>
          <RNView style={styles.legendDot} />
          <Text variant="caption" style={styles.legendText}>
            Total {range === 'weekly' ? '7 days' : 'last 4 months'}: {currency.format(totalSpent)}
          </Text>
        </RNView>
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.card} padding={16}>
        <Text variant="h3">Category Breakdown</Text>
        <Text variant="body" style={styles.subtext}>
          Where your money goes
        </Text>
      </Card>
    </RNView>
  );

  return (
    <RNView style={{ flex: 1 }}>
      <FlatList
        style={[styles.list, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.container, { paddingBottom: 90 }]}
        data={categoryData}
        keyExtractor={item => item.name}
        renderItem={renderCategoryItem}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      />
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  list: { flex: 1 },
  container: { padding: 18 },
  card: { marginBottom: 12 },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 4,
    marginTop: 14,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentBtnActive: { backgroundColor: theme.card, borderColor: theme.secondary, borderWidth: 1 },
  segmentLabel: { color: theme.textSecondary },
  segmentLabelActive: { color: theme.textPrimary },
  chartWrapper: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, gap: 10 },
  barItem: { alignItems: 'center', flex: 1 },
  barShell: { width: '100%', borderRadius: 10, backgroundColor: theme.border, justifyContent: 'flex-end', paddingHorizontal: 6, paddingBottom: 6 },
  barFill: { width: '100%', borderRadius: 8, backgroundColor: theme.secondary },
  barLabel: { marginTop: 6, color: theme.textTertiary },
  barValue: { color: theme.textSecondary, marginBottom: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.secondary },
  legendText: { color: theme.textSecondary },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.card,
    marginHorizontal: 18,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  subtext: { color: theme.textSecondary, marginTop: 6 },
});

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getColorForCategory(category) {
  const colors = {
    Food: '#FF6B6B',
    Access: '#4ECDC4',
    Groceries: '#45B7D1',
    Commute: '#96CEB4',
    Entertainment: '#FFEAA7',
    Essentials: '#DDA15E',
  };
  return colors[category] || '#6D5EF6';
}
