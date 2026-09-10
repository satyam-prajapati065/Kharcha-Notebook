import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format YYYY-MM-DD
export const formatDateString = (year, month, day) => {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Helper to parse YYYY-MM-DD or ISO string safely without timezone shift
export const parseSafeDate = (dateVal) => {
  if (!dateVal) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('T')[0].split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10),
        day: parseInt(parts[2], 10),
      };
    }
  }

  const d = new Date(dateVal);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
};

export const formatReadableDate = (dateVal) => {
  const { year, month, day } = parseSafeDate(dateVal);
  const monthName = MONTH_NAMES[month - 1] ? MONTH_NAMES[month - 1].slice(0, 3) : '';
  const d = new Date(year, month - 1, day);
  const dayName = WEEK_DAYS[d.getDay()] || '';
  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const DatePickerModal = ({
  visible,
  value,
  onClose,
  onSelectDate,
}) => {
  const { theme } = useContext(ThemeContext);

  const initial = useMemo(() => parseSafeDate(value), [value]);

  const [displayYear, setDisplayYear] = useState(initial.year);
  const [displayMonth, setDisplayMonth] = useState(initial.month); // 1-12
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Sync when modal opens with new value
  React.useEffect(() => {
    if (visible) {
      const parsed = parseSafeDate(value);
      setDisplayYear(parsed.year);
      setDisplayMonth(parsed.month);
      setSelectedDay(parsed.day);
      setShowYearPicker(false);
    }
  }, [visible, value]);

  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }, []);

  // Compute days for the month
  const calendarDays = useMemo(() => {
    // Days in current month
    const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();
    // First day of current month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayIndex = new Date(displayYear, displayMonth - 1, 1).getDay();

    const days = [];
    // Previous month padding
    const daysInPrevMonth = new Date(displayYear, displayMonth - 1, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        month: displayMonth === 1 ? 12 : displayMonth - 1,
        year: displayMonth === 1 ? displayYear - 1 : displayYear,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        month: displayMonth,
        year: displayYear,
      });
    }

    // Next month padding to fill grid to 35 or 42
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        month: displayMonth === 12 ? 1 : displayMonth + 1,
        year: displayMonth === 12 ? displayYear + 1 : displayYear,
      });
    }

    return days;
  }, [displayYear, displayMonth]);

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear((prev) => prev - 1);
    } else {
      setDisplayMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonth((prev) => prev + 1);
    }
  };

  const handleSelectDayItem = (item) => {
    if (!item.isCurrentMonth) {
      setDisplayYear(item.year);
      setDisplayMonth(item.month);
    }
    setSelectedDay(item.day);
  };

  const handleConfirm = () => {
    const formatted = formatDateString(displayYear, displayMonth, selectedDay);
    onSelectDate(formatted);
    onClose();
  };

  const handleSetToday = () => {
    setDisplayYear(today.year);
    setDisplayMonth(today.month);
    setSelectedDay(today.day);
  };

  // Generate range of selectable years
  const years = useMemo(() => {
    const currentY = new Date().getFullYear();
    const list = [];
    for (let y = currentY - 6; y <= currentY + 4; y++) {
      list.push(y);
    }
    return list;
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          {/* Top Banner with Selected Date Header */}
          <View style={[styles.headerBanner, { backgroundColor: theme.primary }]}>
            <Text style={styles.headerSubtitle}>Select Date</Text>
            <Text style={styles.headerTitle}>
              {WEEK_DAYS[new Date(displayYear, displayMonth - 1, selectedDay).getDay()]},{' '}
              {selectedDay} {MONTH_NAMES[displayMonth - 1]} {displayYear}
            </Text>
          </View>

          {/* Month / Year Control Bar */}
          <View style={[styles.controlsRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={styles.navArrowBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.navArrowText, { color: theme.text }]}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              style={styles.monthYearBtn}
              activeOpacity={0.8}
            >
              <Text style={[styles.monthYearText, { color: theme.text }]}>
                {MONTH_NAMES[displayMonth - 1]} {displayYear} {showYearPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={styles.navArrowBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.navArrowText, { color: theme.text }]}>›</Text>
            </TouchableOpacity>
          </View>

          {showYearPicker ? (
            /* Year Picker Grid */
            <ScrollView style={styles.yearPickerScroll} contentContainerStyle={styles.yearGrid}>
              {years.map((yr) => (
                <TouchableOpacity
                  key={yr}
                  onPress={() => {
                    setDisplayYear(yr);
                    setShowYearPicker(false);
                  }}
                  style={[
                    styles.yearItem,
                    yr === displayYear && { backgroundColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.yearItemText,
                      { color: yr === displayYear ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {yr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            /* Calendar Month Grid */
            <View style={styles.calendarContainer}>
              {/* Day of Week Labels */}
              <View style={styles.weekDaysRow}>
                {WEEK_DAYS.map((wd) => (
                  <Text key={wd} style={[styles.weekDayLabel, { color: theme.textSecondary }]}>
                    {wd}
                  </Text>
                ))}
              </View>

              {/* Grid of Days */}
              <View style={styles.daysGrid}>
                {calendarDays.map((item, idx) => {
                  const isSelected =
                    item.isCurrentMonth &&
                    item.day === selectedDay &&
                    displayMonth === item.month &&
                    displayYear === item.year;

                  const isToday =
                    item.isCurrentMonth &&
                    item.day === today.day &&
                    item.month === today.month &&
                    item.year === today.year;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectDayItem(item)}
                      style={[
                        styles.dayCell,
                        isSelected && [styles.selectedCell, { backgroundColor: theme.primary }],
                        isToday && !isSelected && [styles.todayCell, { borderColor: theme.primary }],
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : item.isCurrentMonth
                              ? theme.text
                              : theme.textSecondary + '60',
                            fontWeight: isSelected || isToday ? '700' : '500',
                          },
                        ]}
                      >
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Bottom Actions */}
          <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={handleSetToday}
              style={[styles.actionBtn, styles.todayBtn]}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>Today</Text>
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.actionBtn, styles.cancelBtn]}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.actionBtn, styles.confirmBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionBtnText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  Select Date
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Form Field Component that looks like a native input and opens the DatePickerModal
export const DatePickerField = ({
  label = 'Date',
  value,
  onChangeDate,
  error,
  style,
}) => {
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);

  const formattedDisplay = useMemo(() => formatReadableDate(value), [value]);

  return (
    <View style={[styles.fieldContainer, style]}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      ) : null}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.fieldWrapper,
          {
            backgroundColor: theme.inputBg,
            borderColor: error ? theme.expense : theme.border,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.calendarIcon}>📅</Text>
        <Text style={[styles.fieldText, { color: theme.text }]}>
          {formattedDisplay}
        </Text>
        <Text style={[styles.calendarBadge, { color: theme.primary }]}>Change</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.errorText, { color: theme.expense }]}>{error}</Text>
      ) : null}

      <DatePickerModal
        visible={modalVisible}
        value={value}
        onClose={() => setModalVisible(false)}
        onSelectDate={(newDate) => {
          if (onChangeDate) {
            onChangeDate(newDate);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  headerBanner: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navArrowBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navArrowText: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  monthYearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '700',
  },
  calendarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginVertical: 2,
  },
  selectedCell: {
    elevation: 2,
  },
  todayCell: {
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 14,
  },
  yearPickerScroll: {
    maxHeight: 240,
    padding: 12,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  yearItem: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 4,
  },
  yearItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayBtn: {
    paddingHorizontal: 10,
  },
  cancelBtn: {
    marginRight: 6,
  },
  confirmBtn: {
    paddingHorizontal: 16,
  },
  // Form Field Styles
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  calendarIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  fieldText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  calendarBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
