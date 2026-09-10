import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { MonthPicker } from '../../components/common/MonthPicker';
import { MetricCard } from '../../components/common/MetricCard';
import { TransactionItem } from '../../components/common/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { Card } from '../../components/common/Card';
import { formatINR } from '../../constants/categories';

export const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const {
    selectedMonth,
    selectedYear,
    nextMonth,
    prevMonth,
    dashboardData,
    isLoading,
    refresh,
  } = useContext(FinanceContext);

  const {
    totalIncome,
    totalExpense,
    balance,
    savings,
    savingsRate,
    recentTransactions,
    insights,
  } = dashboardData;

  const userName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hello, {userName} 👋
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Monthly Cash Flow Overview
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={[styles.avatarCircle, { backgroundColor: theme.primaryLight, borderWidth: 2, borderColor: theme.primary }]}
          activeOpacity={0.8}
        >
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {userName ? userName.charAt(0).toUpperCase() : 'S'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigation */}
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onPrev={prevMonth}
          onNext={nextMonth}
        />

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: theme.incomeBg, borderColor: theme.income }]}
            onPress={() => navigation.navigate('CashIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>📥</Text>
            <Text style={[styles.btnText, { color: theme.income }]}>+ Cash In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: theme.expenseBg, borderColor: theme.expense }]}
            onPress={() => navigation.navigate('CashOut')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>📤</Text>
            <Text style={[styles.btnText, { color: theme.expense }]}>- Cash Out</Text>
          </TouchableOpacity>
        </View>

        {/* Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Balance"
            amount={balance}
            type="neutral"
            icon="💳"
            subtitle={balance >= 0 ? 'Surplus Available' : 'Deficit Warning'}
          />

          <View style={styles.halfRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <MetricCard
                title="Cash In"
                amount={totalIncome}
                type="income"
                icon="↗️"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <MetricCard
                title="Cash Out"
                amount={totalExpense}
                type="expense"
                icon="↘️"
              />
            </View>
          </View>

          <MetricCard
            title="Savings"
            amount={savings}
            type="savings"
            icon="🌱"
            subtitle={`Savings Rate: ${savingsRate}%`}
          />
        </View>

        {/* Financial Insights Banner */}
        {insights && insights.length > 0 && (
          <Card style={[styles.insightsCard, { backgroundColor: theme.primaryLight + '30', borderColor: theme.primary }]}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightIcon}>💡</Text>
              <Text style={[styles.insightTitle, { color: theme.primary }]}>
                Monthly Financial Insight
              </Text>
            </View>
            <Text style={[styles.insightText, { color: theme.text }]}>
              {insights[0]}
            </Text>
          </Card>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('TransactionsTab')}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions && recentTransactions.length > 0 ? (
          <Card style={styles.transactionsCard}>
            {recentTransactions.map((tx) => (
              <TransactionItem
                key={tx._id}
                transaction={tx}
                onPress={() =>
                  navigation.navigate('TransactionDetails', { transaction: tx })
                }
              />
            ))}
          </Card>
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Start tracking your money by adding your first Cash In or Cash Out."
            actionTitle="Add Transaction"
            onAction={() => navigation.navigate('AddTransaction')}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F766E',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginHorizontal: 4,
  },
  btnIcon: {
    marginRight: 6,
    fontSize: 16,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricsGrid: {
    marginVertical: 4,
  },
  halfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightsCard: {
    padding: 14,
    marginVertical: 10,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsCard: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
