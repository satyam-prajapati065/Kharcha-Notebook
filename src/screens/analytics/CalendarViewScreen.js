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
import { MonthPicker } from '../../components/common/MonthPicker';
import { Card } from '../../components/common/Card';
import { TransactionItem } from '../../components/common/TransactionItem';
import { api } from '../../api/client';
import { formatINR, MONTH_NAMES } from '../../constants/categories';

export const CalendarViewScreen = ({ navigation }) => {
  const {
    selectedMonth,
    selectedYear,
    prevMonth,
    nextMonth,
  } = useContext(FinanceContext);
  const { theme } = useContext(ThemeContext);

  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(9); // Default to today/9th

  useEffect(() => {
    loadCalendar();
  }, [selectedMonth, selectedYear]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.getCalendarSummary(selectedMonth, selectedYear);
      if (res.data && res.data.success) {
        setCalendarData(res.data.dailySummary);
      }
    } catch (e) {
      console.warn('Calendar load error', e);
    } finally {
      setLoading(false);
    }
  };

  // Find data for selected day
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const activeDayData = calendarData.find((d) => d.day === selectedDay) || {
    day: selectedDay,
    cashIn: 0,
    cashOut: 0,
    net: 0,
    transactions: [],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Calendar View"
        subtitle="Daily expense breakdown"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onPrev={prevMonth}
          onNext={nextMonth}
        />

        {/* Day selection horizontal grid */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Select Day ({MONTH_NAMES[selectedMonth - 1]})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {daysArray.map((d) => {
            const isSelected = d === selectedDay;
            const hasTx = calendarData.some((c) => c.day === d);
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDay(d)}
                style={[
                  styles.dayBox,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNum,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {d}
                </Text>
                {hasTx && (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isSelected ? '#FFFFFF' : theme.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator style={{ marginVertical: 32 }} color={theme.primary} />
        ) : (
          <>
            {/* Daily Net Summary Card */}
            <Card style={styles.dailyCard}>
              <Text style={[styles.dayHeading, { color: theme.text }]}>
                {selectedDay} {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </Text>

              <View style={styles.dailyStatsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: theme.income }]}>Cash In</Text>
                  <Text style={[styles.statVal, { color: theme.text }]}>
                    {formatINR(activeDayData.cashIn)}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: theme.expense }]}>Cash Out</Text>
                  <Text style={[styles.statVal, { color: theme.text }]}>
                    {formatINR(activeDayData.cashOut)}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: theme.primary }]}>Net Balance</Text>
                  <Text
                    style={[
                      styles.statVal,
                      { color: activeDayData.net >= 0 ? theme.income : theme.expense },
                    ]}
                  >
                    {activeDayData.net >= 0 ? '+ ' : ''}
                    {formatINR(activeDayData.net)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Daily Transactions */}
            <Text style={[styles.subTitle, { color: theme.text }]}>
              Transactions on {selectedDay} {MONTH_NAMES[selectedMonth - 1]}
            </Text>

            {activeDayData.transactions && activeDayData.transactions.length > 0 ? (
              <Card style={{ paddingHorizontal: 16 }}>
                {activeDayData.transactions.map((tx) => (
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
              <Card style={styles.emptyCard}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>📅</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No transactions recorded on this date.
                </Text>
              </Card>
            )}
          </>
        )}
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
  },
  daysScroll: {
    paddingBottom: 12,
  },
  dayBox: {
    width: 44,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  dailyCard: {
    padding: 16,
    marginVertical: 12,
  },
  dayHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  dailyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
