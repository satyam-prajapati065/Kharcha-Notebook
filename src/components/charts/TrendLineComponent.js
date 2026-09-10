import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Card } from '../common/Card';
import { formatINR } from '../../constants/categories';

export const TrendLineComponent = ({ monthlyData = [] }) => {
  const { theme } = useContext(ThemeContext);

  if (!monthlyData || monthlyData.length === 0) {
    return null;
  }

  const maxExpense = Math.max(...monthlyData.map((d) => d.expense), 1);

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: theme.text }]}>Monthly Spending Trend</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Yearly Expense Trajectory</Text>

      <View style={styles.chartContainer}>
        {monthlyData.map((item) => {
          const barHeight = Math.max(6, Math.round((item.expense / maxExpense) * 90));
          return (
            <View key={item.month} style={styles.trendCol}>
              <View style={styles.colTrack}>
                <View
                  style={[
                    styles.colFill,
                    {
                      height: barHeight,
                      backgroundColor: item.expense > 0 ? theme.expense : theme.border,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.monthLabel, { color: theme.textSecondary }]}>
                {item.month.substring(0, 3)}
              </Text>
            </View>
          );
        })}
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  trendCol: {
    alignItems: 'center',
    flex: 1,
  },
  colTrack: {
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  colFill: {
    width: 14,
    borderRadius: 4,
  },
  monthLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
});
