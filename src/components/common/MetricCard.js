import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Card } from './Card';
import { formatINR } from '../../constants/categories';

export const MetricCard = ({
  title,
  amount,
  type = 'neutral', // 'income' | 'expense' | 'neutral' | 'savings'
  icon,
  subtitle,
}) => {
  const { theme } = useContext(ThemeContext);

  let indicatorColor = theme.primary;
  let bg = theme.card;

  if (type === 'income') {
    indicatorColor = theme.income;
  } else if (type === 'expense') {
    indicatorColor = theme.expense;
  } else if (type === 'savings') {
    indicatorColor = amount >= 0 ? theme.income : theme.expense;
  }

  return (
    <Card style={[styles.card, { borderLeftColor: indicatorColor, borderLeftWidth: 4 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      <Text style={[styles.amount, { color: theme.text }]}>
        {formatINR(amount)}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: indicatorColor }]}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginVertical: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
