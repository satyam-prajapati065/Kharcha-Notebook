import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatINR } from '../../constants/categories';

export const TransactionDetailsScreen = ({ route, navigation }) => {
  const { transaction } = route.params;
  const { deleteTransaction } = useContext(FinanceContext);
  const { theme } = useContext(ThemeContext);

  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isIncome = transaction.type === 'income';
  const txDate = new Date(transaction.date);
  const formattedDate = txDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTransaction(transaction._id);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete transaction');
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Transaction Details"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount Card */}
        <Card
          style={[
            styles.amountCard,
            { borderTopColor: isIncome ? theme.income : theme.expense, borderTopWidth: 5 },
          ]}
        >
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isIncome ? theme.incomeBg : theme.expenseBg },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                { color: isIncome ? theme.income : theme.expense },
              ]}
            >
              {isIncome ? 'Cash In (Income)' : 'Cash Out (Expense)'}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              { color: isIncome ? theme.income : theme.expense },
            ]}
          >
            {isIncome ? '+ ' : '- '}
            {formatINR(transaction.amount)}
          </Text>

          <Text style={[styles.category, { color: theme.text }]}>
            {transaction.category}
          </Text>
        </Card>

        {/* Details Table */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Transaction Date
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formattedDate}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Payment Method
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {transaction.paymentMethod}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Description
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {transaction.description || 'None provided'}
            </Text>
          </View>

          {transaction.note ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Note
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {transaction.note}
              </Text>
            </View>
          ) : null}

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Recorded On
            </Text>
            <Text style={[styles.detailValue, { color: theme.textSecondary, fontSize: 12 }]}>
              {new Date(transaction.createdAt || transaction.date).toLocaleString('en-IN')}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Edit Transaction"
            onPress={() =>
              navigation.navigate('EditTransaction', { transaction })
            }
            variant="outline"
            style={{ marginBottom: 12 }}
          />

          {showConfirm ? (
            <View style={[styles.confirmBox, { backgroundColor: theme.expenseBg, borderColor: theme.expense }]}>
              <Text style={[styles.confirmText, { color: theme.expense }]}>
                Are you sure you want to delete this transaction?
              </Text>
              <View style={styles.confirmRow}>
                <Button
                  title="Cancel"
                  onPress={() => setShowConfirm(false)}
                  variant="secondary"
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  title="Delete"
                  onPress={handleDelete}
                  loading={deleting}
                  variant="danger"
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>
            </View>
          ) : (
            <Button
              title="Delete Transaction"
              onPress={() => setShowConfirm(true)}
              variant="danger"
            />
          )}
        </View>
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
  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F030',
  },
  detailLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  confirmBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmRow: {
    flexDirection: 'row',
  },
});
