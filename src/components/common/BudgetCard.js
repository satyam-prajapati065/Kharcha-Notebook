import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Card } from './Card';
import { formatINR } from '../../constants/categories';

export const BudgetCard = ({ budget, onPress, onDelete }) => {
  const { theme } = useContext(ThemeContext);
  const { category, amount, spent, remaining, percentage, isExceeded } = budget;

  const barColor = isExceeded ? theme.expense : percentage > 80 ? theme.warning : theme.income;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, isExceeded && { borderColor: theme.expense }]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.category, { color: theme.text }]}>{category}</Text>
          {isExceeded && (
            <View style={[styles.warningBadge, { backgroundColor: theme.expenseBg }]}>
              <Text style={[styles.warningText, { color: theme.expense }]}>Exceeded!</Text>
            </View>
          )}
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteBtn}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        <Text style={[styles.spentText, { color: theme.text }]}>
          Spent: <Text style={{ fontWeight: '700' }}>{formatINR(spent)}</Text>
        </Text>
        <Text style={[styles.budgetText, { color: theme.textSecondary }]}>
          Budget: {formatINR(amount)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.inputBg }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, percentage)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.percentText, { color: barColor }]}>
          {percentage}% used
        </Text>
        <Text
          style={[
            styles.remainingText,
            { color: remaining >= 0 ? theme.textSecondary : theme.expense },
          ]}
        >
          {remaining >= 0 ? `Remaining: ${formatINR(remaining)}` : `Over by: ${formatINR(Math.abs(remaining))}`}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  warningBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spentText: {
    fontSize: 13,
  },
  budgetText: {
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
