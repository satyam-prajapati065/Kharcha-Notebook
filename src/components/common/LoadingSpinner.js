import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      {text && <Text style={[styles.text, { color: theme.textSecondary }]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
