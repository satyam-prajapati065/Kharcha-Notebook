import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { formatINR, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants/categories';

export const TransactionItem = ({ transaction, onPress }) => {
  const { theme } = useContext(ThemeContext);
  const isIncome = transaction.type === 'income';

  // Find category icon
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryMeta = categories.find((c) => c.name.toLowerCase() === transaction.category.toLowerCase());
  const icon = categoryMeta ? categoryMeta.icon : isIncome ? '💰' : '💸';

  // Format date
  const txDate = new Date(transaction.date);
  const formattedDate = `${txDate.getDate()} ${txDate.toLocaleString('default', { month: 'short' })}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: theme.border }]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isIncome ? theme.incomeBg : theme.expenseBg },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.category, { color: theme.text }]} numberOfLines={1}>
          {transaction.category}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
          {formattedDate} • {transaction.paymentMethod}
          {transaction.description ? ` • ${transaction.description}` : ''}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? theme.income : theme.expense },
          ]}
        >
          {isIncome ? '+ ' : '- '}
          {formatINR(transaction.amount)}
        </Text>
        <Text style={[styles.typeBadge, { color: theme.textSecondary }]}>
          {isIncome ? 'Cash In' : 'Cash Out'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    paddingRight: 8,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  meta: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  typeBadge: {
    fontSize: 11,
    marginTop: 2,
  },
});
