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
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from '../../constants/categories';

export const AddTransactionScreen = ({ navigation }) => {
  const { addTransaction } = useContext(FinanceContext);
  const { theme } = useContext(ThemeContext);

  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isIncome = type === 'income';
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeToggle = (newType) => {
    setType(newType);
    setSelectedCategory(newType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name);
  };

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
        type,
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
        navigation.navigate('HomeTab');
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Add Transaction" subtitle="Record new cash movement" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Toggle Cash In | Cash Out */}
        <View style={[styles.toggleContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !isIncome && { backgroundColor: theme.expense },
            ]}
            onPress={() => handleTypeToggle('expense')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                { color: !isIncome ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Cash Out (Expense)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              isIncome && { backgroundColor: theme.income },
            ]}
            onPress={() => handleTypeToggle('income')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isIncome ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Cash In (Income)
            </Text>
          </TouchableOpacity>
        </View>

        {success && (
          <View style={[styles.banner, { backgroundColor: theme.incomeBg }]}>
            <Text style={[styles.bannerText, { color: theme.income }]}>
              ✓ Transaction saved successfully!
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

        {/* Categories */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {isIncome ? 'Income Category' : 'Expense Category'}
        </Text>
        <View style={styles.chipsWrap}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const activeColor = isIncome ? theme.income : theme.expense;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.name)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? activeColor : theme.card,
                    borderColor: isSelected ? activeColor : theme.border,
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

        {/* Payment Methods */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          Payment Method
        </Text>
        <View style={styles.chipsWrap}>
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = selectedPayment === pm.name;
            return (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelectedPayment(pm.name)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.primaryLight : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.chipIcon}>{pm.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? theme.primary : theme.text },
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
          placeholder="e.g. Electricity Bill, Freelance Payment"
        />

        {/* Optional Note */}
        <Input
          label="Optional Note"
          value={note}
          onChangeText={setNote}
          placeholder="Add memo or invoice reference..."
          multiline
          numberOfLines={2}
        />

        <Button
          title={isIncome ? 'Save Cash In' : 'Save Cash Out'}
          onPress={handleSubmit}
          loading={loading}
          variant={isIncome ? 'success' : 'danger'}
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
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
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
    marginTop: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
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
});
