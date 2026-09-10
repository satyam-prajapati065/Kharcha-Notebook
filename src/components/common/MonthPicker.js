import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { MONTH_NAMES } from '../../constants/categories';

export const MonthPicker = ({ month, year, onPrev, onNext }) => {
  const { theme } = useContext(ThemeContext);
  const monthName = MONTH_NAMES[month - 1] || 'September';

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity
        onPress={onPrev}
        style={[styles.arrowBtn, { backgroundColor: theme.inputBg }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.arrowText, { color: theme.text }]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.centerText}>
        <Text style={[styles.monthYear, { color: theme.text }]}>
          {monthName} {year}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={[styles.arrowBtn, { backgroundColor: theme.inputBg }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.arrowText, { color: theme.text }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  centerText: {
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '700',
  },
});
