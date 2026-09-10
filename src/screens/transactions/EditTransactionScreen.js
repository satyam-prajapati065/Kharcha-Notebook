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

export const EditTransactionScreen = ({ route, navigation }) => {
  const { transaction } = route.params;
  const { updateTransaction } = useContext(FinanceContext);
  const { theme } = useContext(ThemeContext);

  const [type, setType] = useState(transaction.type || 'expense');
  const [amount, setAmount] = useState(transaction.amount?.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState(transaction.category || '');
  const [selectedPayment, setSelectedPayment] = useState(transaction.paymentMethod || 'UPI');
  const [date, setDate] = useState(() => {
    if (!transaction.date) return new Date().toISOString().split('T')[0];
    const d = new Date(transaction.date);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  });
  const [description, setDescription] = useState(transaction.description || '');
  const [note, setNote] = useState(transaction.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isIncome = type === 'income';
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeToggle = (newType) => {
    setType(newType);
    const newCategories = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    // Keep category if it exists in new category list, otherwise default
    const exists = newCategories.some((c) => c.name === selectedCategory);
    if (!exists) {
      setSelectedCategory(newCategories[0].name);
    }
  };

  const handleUpdate = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid amount greater than 0');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const safeDate = date.includes('T') ? new Date(date) : new Date(`${date}T12:00:00Z`);
      await updateTransaction(transaction._id, {
        type,
        amount: Number(amount),
        category: selectedCategory || categories[0].name,
        paymentMethod: selectedPayment,
        date: safeDate,
        description: description.trim(),
        note: note.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate('Main');
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Edit Transaction"
        subtitle="Modify details and recalculate"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type Toggle: Cash In vs Cash Out */}
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
              ✓ Transaction updated successfully!
            </Text>
          </View>
        )}

        {error ? (
          <View style={[styles.banner, { backgroundColor: theme.expenseBg }]}>
            <Text style={[styles.bannerText, { color: theme.expense }]}>{error}</Text>
          </View>
        ) : null}

        {/* Amount */}
        <Input
          label="Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          inputStyle={styles.amountInput}
        />

        {/* Category */}
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

        {/* Payment Method */}
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
          placeholder="e.g. Grocery Shopping, Client Project"
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
          title="Save Changes"
          onPress={handleUpdate}
          loading={loading}
          variant={isIncome ? 'success' : 'primary'}
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
