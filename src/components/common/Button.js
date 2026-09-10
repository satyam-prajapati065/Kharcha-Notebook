import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useContext(ThemeContext);

  let bg = theme.primary;
  let textColor = '#FFFFFF';
  let border = 'transparent';

  if (variant === 'secondary') {
    bg = theme.inputBg;
    textColor = theme.text;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textColor = theme.primary;
    border = theme.primary;
  } else if (variant === 'danger') {
    bg = theme.expense;
    textColor = '#FFFFFF';
  } else if (variant === 'success') {
    bg = theme.income;
    textColor = '#FFFFFF';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: disabled ? theme.border : bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, { color: disabled ? theme.textSecondary : textColor }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    minHeight: 48,
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
