import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { MonthPicker } from '../../components/common/MonthPicker';
import { BarChartComponent } from '../../components/charts/BarChartComponent';
import { PieChartComponent } from '../../components/charts/PieChartComponent';
import { TrendLineComponent } from '../../components/charts/TrendLineComponent';
import { api } from '../../api/client';
import { formatINR } from '../../constants/categories';

export const AnalyticsScreen = ({ navigation }) => {
  const {
    selectedMonth,
    selectedYear,
    prevMonth,
    nextMonth,
    dashboardData,
    isLoading,
    refresh,
  } = useContext(FinanceContext);

  const { theme } = useContext(ThemeContext);

  const [yearlyData, setYearlyData] = useState(null);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'

  useEffect(() => {
    fetchYearly();
  }, [selectedYear]);

  const fetchYearly = async () => {
    try {
      const res = await api.getYearlySummary(selectedYear);
      if (res.data && res.data.success) {
        setYearlyData(res.data);
      }
    } catch (e) {
      console.warn('Failed to load yearly stats', e);
    }
  };

  const { totalIncome, totalExpense, balance, savings, savingsRate, expenseByCategory, incomeByCategory } =
    dashboardData;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Analytics & Trends"
        subtitle="Visual cash flow insights"
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('CalendarView')}
            style={[styles.calendarIconBtn, { backgroundColor: theme.inputBg }]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18 }}>📅</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
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

        {/* View Mode Toggle */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setViewMode('monthly')}
            style={[
              styles.tabBtn,
              viewMode === 'monthly' && { backgroundColor: theme.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: viewMode === 'monthly' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Monthly Analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('YearlySummary')}
            style={[
              styles.tabBtn,
              viewMode === 'yearly' && { backgroundColor: theme.primary },
            ]}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }]}>
              Yearly Summary →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cash Flow Flow-Through Funnel */}
        <Card style={styles.flowCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Cash Flow Funnel
          </Text>
          <View style={styles.flowRow}>
            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: theme.income }]}>Cash In</Text>
              <Text style={[styles.flowVal, { color: theme.text }]}>
                {formatINR(totalIncome)}
              </Text>
            </View>

            <Text style={[styles.flowArrow, { color: theme.textSecondary }]}>→</Text>

            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: theme.expense }]}>Cash Out</Text>
              <Text style={[styles.flowVal, { color: theme.text }]}>
                {formatINR(totalExpense)}
              </Text>
            </View>

            <Text style={[styles.flowArrow, { color: theme.textSecondary }]}>→</Text>

            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: theme.primary }]}>Savings</Text>
              <Text style={[styles.flowVal, { color: theme.text }]}>
                {formatINR(savings)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Income vs Expense Bar Chart */}
        <BarChartComponent income={totalIncome} expense={totalExpense} />

        {/* Expense by Category Pie/Donut Chart */}
        <PieChartComponent data={expenseByCategory} title="Expenses by Category" />

        {/* Income by Category */}
        {incomeByCategory && incomeByCategory.length > 0 && (
          <PieChartComponent data={incomeByCategory} title="Income by Category" />
        )}

        {/* Yearly Trend Chart */}
        {yearlyData?.monthlyData && (
          <TrendLineComponent monthlyData={yearlyData.monthlyData} />
        )}

        {/* Calendar View Quick Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CalendarView')}
          style={[styles.linkBanner, { backgroundColor: theme.card, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>📅</Text>
            <View>
              <Text style={[styles.linkTitle, { color: theme.text }]}>Daily Calendar View</Text>
              <Text style={[styles.linkSub, { color: theme.textSecondary }]}>
                Inspect day-by-day cash in and cash out
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, color: theme.primary }}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  flowCard: {
    padding: 16,
    marginVertical: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flowItem: {
    alignItems: 'center',
    flex: 1,
  },
  flowLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  flowVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  flowArrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  linkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 24,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  linkSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
