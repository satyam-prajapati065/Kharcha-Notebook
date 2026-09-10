import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { MonthPicker } from '../../components/common/MonthPicker';
import { BudgetCard } from '../../components/common/BudgetCard';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { EXPENSE_CATEGORIES, formatINR } from '../../constants/categories';

export const BudgetScreen = () => {
  const {
    budgets,
    selectedMonth,
    selectedYear,
    prevMonth,
    nextMonth,
    saveBudget,
    deleteBudget,
    isLoading,
    refresh,
  } = useContext(FinanceContext);

  const { theme } = useContext(ThemeContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Deduplicate budgets by category so Groceries and Rent never appear twice
  const uniqueBudgets = [];
  const seenCategories = new Set();
  budgets.forEach((b) => {
    const cat = (b.category || '').trim().toLowerCase();
    if (!seenCategories.has(cat)) {
      seenCategories.add(cat);
      uniqueBudgets.push(b);
    }
  });

  // Total budgeted vs Total spent across unique budgets
  const totalBudgeted = uniqueBudgets.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalSpentInBudgets = uniqueBudgets.reduce((acc, b) => acc + (b.spent || 0), 0);

  const existingBudgetForCategory = uniqueBudgets.find((b) => b.category === category);

  const openAddBudgetModal = (initialCat = null) => {
    const targetCategory = initialCat || EXPENSE_CATEGORIES[0].name;
    setCategory(targetCategory);
    const existing = budgets.find((b) => b.category === targetCategory);
    setAmount(existing && existing.amount ? String(existing.amount) : '');
    setError('');
    setModalVisible(true);
  };

  const handleCategorySelect = (catName) => {
    setCategory(catName);
    const existing = budgets.find((b) => b.category === catName);
    setAmount(existing && existing.amount ? String(existing.amount) : '');
  };

  const handleSaveBudget = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please specify a valid budget amount');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await saveBudget(category, Number(amount));
      setAmount('');
      setModalVisible(false);
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, catName) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to remove the budget for ${catName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Monthly Budgets"
        subtitle="Manage category spending limits"
        rightElement={
          <TouchableOpacity
            onPress={() => openAddBudgetModal()}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Set Budget</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
      >
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onPrev={prevMonth}
          onNext={nextMonth}
        />

        {/* Budget Overview Card */}
        {budgets.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              Budget Overview
            </Text>
            <View style={styles.summaryRow}>
              <View>
                <Text style={[styles.sumLabel, { color: theme.textSecondary }]}>Total Budget</Text>
                <Text style={[styles.sumAmount, { color: theme.primary }]}>{formatINR(totalBudgeted)}</Text>
              </View>
              <View>
                <Text style={[styles.sumLabel, { color: theme.textSecondary }]}>Total Spent</Text>
                <Text
                  style={[
                    styles.sumAmount,
                    { color: totalSpentInBudgets > totalBudgeted ? theme.expense : theme.text },
                  ]}
                >
                  {formatINR(totalSpentInBudgets)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Budgets List */}
        {uniqueBudgets.length > 0 ? (
          uniqueBudgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onPress={() => openAddBudgetModal(b.category)}
              onDelete={() => handleDelete(b._id, b.category)}
            />
          ))
        ) : (
          <EmptyState
            icon="🎯"
            title="No budgets created"
            description="Setting monthly category budgets helps control expenses and boost your savings."
            actionTitle="Set Category Budget"
            onAction={() => openAddBudgetModal()}
          />
        )}
      </ScrollView>

      {/* Set Budget Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {existingBudgetForCategory ? 'Update Category Budget' : 'Set Category Budget'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 18, color: theme.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.expenseBg }]}>
                <Text style={[styles.errorText, { color: theme.expense }]}>{error}</Text>
              </View>
            ) : null}

            {/* Select Category */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Choose Expense Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {EXPENSE_CATEGORIES.map((c) => {
                const isSelected = category === c.name;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleCategorySelect(c.name)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.inputBg,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 13, marginRight: 4 }}>{c.icon}</Text>
                    <Text
                      style={[
                        styles.catText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Input
              label={existingBudgetForCategory ? "Update Monthly Limit (₹)" : "Monthly Limit Amount (₹)"}
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 5000"
              keyboardType="numeric"
            />

            <View style={styles.modalActionRow}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="secondary"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={existingBudgetForCategory ? "Update Budget" : "Save Budget"}
                onPress={handleSaveBudget}
                loading={submitting}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 16,
    marginVertical: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sumLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  sumAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000070',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 20,
  },
});
