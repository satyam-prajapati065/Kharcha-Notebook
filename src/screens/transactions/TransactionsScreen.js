import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { MonthPicker } from '../../components/common/MonthPicker';
import { TransactionItem } from '../../components/common/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { Card } from '../../components/common/Card';

export const TransactionsScreen = ({ navigation }) => {
  const {
    transactions,
    selectedMonth,
    selectedYear,
    prevMonth,
    nextMonth,
    isLoading,
    refresh,
  } = useContext(FinanceContext);

  const { theme } = useContext(ThemeContext);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'INCOME' | 'EXPENSE'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount_high'

  // Filtering and Sorting
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Filter by type
    if (filterType === 'INCOME') {
      list = list.filter((t) => t.type === 'income');
    } else if (filterType === 'EXPENSE') {
      list = list.filter((t) => t.type === 'expense');
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'amount_high') {
      list.sort((a, b) => b.amount - a.amount);
    }

    return list;
  }, [transactions, filterType, search, sortBy]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Transactions"
        subtitle={`${filteredTransactions.length} records found`}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransaction')}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.filterSection}>
        {/* Month Picker */}
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onPrev={prevMonth}
          onNext={nextMonth}
        />

        {/* Search Bar */}
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search by category, note, UPI, amount..."
          style={{ marginBottom: 8 }}
        />

        {/* Filter Pills */}
        <View style={styles.pillRow}>
          <TouchableOpacity
            onPress={() => setFilterType('ALL')}
            style={[
              styles.pill,
              {
                backgroundColor: filterType === 'ALL' ? theme.primary : theme.card,
                borderColor: filterType === 'ALL' ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[styles.pillText, { color: filterType === 'ALL' ? '#FFFFFF' : theme.text }]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterType('INCOME')}
            style={[
              styles.pill,
              {
                backgroundColor: filterType === 'INCOME' ? theme.income : theme.card,
                borderColor: filterType === 'INCOME' ? theme.income : theme.border,
              },
            ]}
          >
            <Text style={[styles.pillText, { color: filterType === 'INCOME' ? '#FFFFFF' : theme.text }]}>
              Cash In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterType('EXPENSE')}
            style={[
              styles.pill,
              {
                backgroundColor: filterType === 'EXPENSE' ? theme.expense : theme.card,
                borderColor: filterType === 'EXPENSE' ? theme.expense : theme.border,
              },
            ]}
          >
            <Text style={[styles.pillText, { color: filterType === 'EXPENSE' ? '#FFFFFF' : theme.text }]}>
              Cash Out
            </Text>
          </TouchableOpacity>

          {/* Sort button */}
          <TouchableOpacity
            onPress={() =>
              setSortBy((prev) =>
                prev === 'newest' ? 'amount_high' : prev === 'amount_high' ? 'oldest' : 'newest'
              )
            }
            style={[styles.pill, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          >
            <Text style={[styles.pillText, { color: theme.textSecondary }]}>
              ⇅ {sortBy === 'newest' ? 'Newest' : sortBy === 'amount_high' ? 'Amount' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
        ListEmptyComponent={
          <EmptyState
            title="No transactions found"
            description="Try changing the search filter or add a new transaction for this month."
            actionTitle="Add Transaction"
            onAction={() => navigation.navigate('AddTransaction')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
