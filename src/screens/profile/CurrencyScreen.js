import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
];

export const CurrencyScreen = ({ navigation }) => {
  const { selectedCurrency, updateCurrency } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const handleSelect = async (item) => {
    const formatted = `${item.code} ${item.symbol}`;
    await updateCurrency(formatted);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Currency Settings"
        subtitle="Select your preferred currency display"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Amounts in dashboards, activity cards, and analytics will format with this currency symbol.
        </Text>

        <Card style={styles.card}>
          {CURRENCIES.map((item, index) => {
            const isSelected = selectedCurrency && (
              selectedCurrency.startsWith(item.code) ||
              selectedCurrency.includes(item.symbol)
            );

            return (
              <TouchableOpacity
                key={item.code}
                onPress={() => handleSelect(item)}
                style={[
                  styles.currencyRow,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: index === CURRENCIES.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.flag}>{item.flag}</Text>
                  <View style={styles.nameCol}>
                    <Text style={[styles.code, { color: theme.text }]}>
                      {item.code} ({item.symbol})
                    </Text>
                    <Text style={[styles.subName, { color: theme.textSecondary }]}>
                      {item.name}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                    },
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
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
  description: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 14,
  },
  nameCol: {
    justifyContent: 'center',
  },
  code: {
    fontSize: 15,
    fontWeight: '700',
  },
  subName: {
    fontSize: 12,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
