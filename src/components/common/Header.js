import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

export const Header = ({ title, subtitle, showBack, onBack, rightElement }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.inputBg }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18, color: theme.text }}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
