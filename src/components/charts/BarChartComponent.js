import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Card } from '../common/Card';
import { formatINR } from '../../constants/categories';

export const BarChartComponent = ({ income = 0, expense = 0 }) => {
  const { theme } = useContext(ThemeContext);

  const maxVal = Math.max(income, expense, 1);
  const incomeHeight = Math.round((income / maxVal) * 140);
  const expenseHeight = Math.round((expense / maxVal) * 140);

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: theme.text }]}>Income vs Expense</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Cash Flow Comparison</Text>

      <View style={styles.chartContainer}>
        {/* Income Bar */}
        <View style={styles.barColumn}>
          <Text style={[styles.barAmount, { color: theme.income }]}>{formatINR(income)}</Text>
          <View style={[styles.barTrack, { backgroundColor: theme.inputBg }]}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(12, incomeHeight),
                  backgroundColor: theme.income,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: theme.text }]}>Cash In</Text>
        </View>

        {/* Expense Bar */}
        <View style={styles.barColumn}>
          <Text style={[styles.barAmount, { color: theme.expense }]}>{formatINR(expense)}</Text>
          <View style={[styles.barTrack, { backgroundColor: theme.inputBg }]}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(12, expenseHeight),
                  backgroundColor: theme.expense,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: theme.text }]}>Cash Out</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    width: 100,
  },
  barAmount: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  barTrack: {
    width: 44,
    height: 140,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
