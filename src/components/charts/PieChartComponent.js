import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Card } from '../common/Card';
import { formatINR } from '../../constants/categories';

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#84CC16',
];

export const PieChartComponent = ({ data = [], title = 'Expense by Category' }) => {
  const { theme } = useContext(ThemeContext);

  if (!data || data.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No expense transactions recorded this month.
        </Text>
      </Card>
    );
  }

  const topCategories = data.slice(0, 6);

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

      {/* Visual Multi-Segment Bar */}
      <View style={styles.segmentBar}>
        {topCategories.map((item, index) => {
          const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
          return (
            <View
              key={item.category}
              style={{
                flex: Math.max(item.percentage, 2),
                backgroundColor: color,
                height: 14,
                marginRight: 2,
                borderRadius: 2,
              }}
            />
          );
        })}
      </View>

      {/* Legend & Breakdown */}
      <View style={styles.legendContainer}>
        {topCategories.map((item, index) => {
          const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
          return (
            <View key={item.category} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={[styles.categoryAmount, { color: theme.text }]}>
                  {formatINR(item.amount)}
                </Text>
                <Text style={[styles.categoryPercent, { color: theme.textSecondary }]}>
                  {item.percentage}%
                </Text>
              </View>
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
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    paddingVertical: 12,
    textAlign: 'center',
  },
  segmentBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 16,
  },
  legendContainer: {
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryPercent: {
    fontSize: 12,
    minWidth: 38,
    textAlign: 'right',
  },
});
