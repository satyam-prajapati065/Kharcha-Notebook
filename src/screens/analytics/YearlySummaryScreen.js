import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { MetricCard } from '../../components/common/MetricCard';
import { api } from '../../api/client';
import { formatINR } from '../../constants/categories';

export const YearlySummaryScreen = ({ navigation }) => {
  const { selectedYear } = useContext(FinanceContext);
  const { theme } = useContext(ThemeContext);

  const [year, setYear] = useState(selectedYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [year]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getYearlySummary(year);
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.warn('Failed to load yearly data', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Yearly Summary"
        subtitle={`Annual cash flow overview for ${year}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Year Selector */}
        <View style={[styles.yearPicker, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => setYear((y) => y - 1)}
            style={[styles.arrowBtn, { backgroundColor: theme.inputBg }]}
          >
            <Text style={{ fontSize: 20, color: theme.text }}>‹</Text>
          </TouchableOpacity>

          <Text style={[styles.yearTitle, { color: theme.text }]}>Year {year}</Text>

          <TouchableOpacity
            onPress={() => setYear((y) => y + 1)}
            style={[styles.arrowBtn, { backgroundColor: theme.inputBg }]}
          >
            <Text style={{ fontSize: 20, color: theme.text }}>›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginVertical: 32 }} color={theme.primary} />
        ) : data ? (
          <>
            {/* High Level Metrics */}
            <View style={styles.metricsCol}>
              <MetricCard
                title="Annual Cash In"
                amount={data.yearlyIncome}
                type="income"
                icon="↗️"
              />
              <MetricCard
                title="Annual Cash Out"
                amount={data.yearlyExpense}
                type="expense"
                icon="↘️"
              />
              <MetricCard
                title="Net Annual Savings"
                amount={data.yearlySavings}
                type="savings"
                icon="🌱"
                subtitle={`Savings Rate: ${data.yearlySavingsRate}%`}
              />
            </View>

            {/* Month-by-month Table */}
            <Card style={styles.tableCard}>
              <Text style={[styles.tableHeader, { color: theme.text }]}>
                Month-by-Month Breakdown
              </Text>

              <View style={[styles.tableHeadRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.th, { color: theme.textSecondary, flex: 1.2 }]}>Month</Text>
                <Text style={[styles.th, { color: theme.income, flex: 1, textAlign: 'right' }]}>Cash In</Text>
                <Text style={[styles.th, { color: theme.expense, flex: 1, textAlign: 'right' }]}>Cash Out</Text>
                <Text style={[styles.th, { color: theme.primary, flex: 1, textAlign: 'right' }]}>Net</Text>
              </View>

              {data.monthlyData.map((m) => (
                <View key={m.month} style={[styles.tr, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.tdMonth, { color: theme.text, flex: 1.2 }]}>
                    {m.month}
                  </Text>
                  <Text style={[styles.td, { color: theme.income, flex: 1, textAlign: 'right' }]}>
                    {formatINR(m.income)}
                  </Text>
                  <Text style={[styles.td, { color: theme.expense, flex: 1, textAlign: 'right' }]}>
                    {formatINR(m.expense)}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      {
                        color: m.balance >= 0 ? theme.text : theme.expense,
                        fontWeight: '700',
                        flex: 1,
                        textAlign: 'right',
                      },
                    ]}
                  >
                    {formatINR(m.balance)}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  yearPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricsCol: {
    marginBottom: 12,
  },
  tableCard: {
    padding: 16,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tableHeadRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tdMonth: {
    fontSize: 13,
    fontWeight: '600',
  },
  td: {
    fontSize: 12,
    fontWeight: '500',
  },
});
