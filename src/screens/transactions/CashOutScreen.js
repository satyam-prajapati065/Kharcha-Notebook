import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { DatePickerField } from '../../components/common/DatePickerModal';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';

export const CashOutScreen = ({ navigation }) => {
  const { addTransaction } = useContext(FinanceContext);
  const { theme } = useContext(ThemeContext);

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const safeDate = date.includes('T') ? new Date(date) : new Date(`${date}T12:00:00Z`);
      await addTransaction({
        type: 'expense',
        amount: Number(amount),
        category: selectedCategory,
        paymentMethod: selectedPayment,
        date: safeDate,
        description: description.trim(),
        note: note.trim(),
      });
      setSuccess(true);
      setAmount('');
      setDescription('');
      setNote('');
      setTimeout(() => {
        setSuccess(false);
        navigation.goBack();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to record Cash Out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Add Cash Out"
        subtitle="Record money spent"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {success && (
          <View style={[styles.banner, { backgroundColor: theme.incomeBg }]}>
            <Text style={[styles.bannerText, { color: theme.income }]}>
              ✓ Cash Out added successfully!
            </Text>
          </View>
        )}

        {error ? (
          <View style={[styles.banner, { backgroundColor: theme.expenseBg }]}>
            <Text style={[styles.bannerText, { color: theme.expense }]}>{error}</Text>
          </View>
        ) : null}

        {/* Amount Input */}
        <Input
          label="Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          inputStyle={styles.amountInput}
        />

        {/* Expense Category Selector */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Expense Category
        </Text>
        <View style={styles.categoriesWrap}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.name)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? theme.expense : theme.card,
                    borderColor: isSelected ? theme.expense : theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.chipIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method Selector */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Payment Method
        </Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = selectedPayment === pm.name;
            return (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelectedPayment(pm.name)}
                style={[
                  styles.paymentChip,
                  {
                    backgroundColor: isSelected ? theme.expenseBg : theme.card,
                    borderColor: isSelected ? theme.expense : theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.pmIcon}>{pm.icon}</Text>
                <Text
                  style={[
                    styles.pmText,
                    { color: isSelected ? theme.expense : theme.text },
                  ]}
                >
                  {pm.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Calendar Date Picker Field */}
        <DatePickerField
          label="Transaction Date"
          value={date}
          onChangeDate={(newDate) => setDate(newDate)}
        />

        {/* Description */}
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Dinner, Rent Payment, Groceries"
        />

        {/* Optional Note */}
        <Input
          label="Optional Note"
          value={note}
          onChangeText={setNote}
          placeholder="Add any extra receipt or bill details..."
          multiline
          numberOfLines={2}
        />

        <Button
          title="Add Cash Out"
          onPress={handleSubmit}
          loading={loading}
          variant="danger"
          style={{ marginTop: 12, marginBottom: 32 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  banner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 6,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pmIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pmText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
