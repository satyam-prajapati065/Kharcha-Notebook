import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export const SplashScreen = ({ navigation }) => {
  const { profileSetupCompleted, hasCompletedSetup, isLoading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (profileSetupCompleted || hasCompletedSetup) {
          navigation.replace('Main');
        } else {
          navigation.replace('SetupProfile');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, profileSetupCompleted, hasCompletedSetup, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.centerContent}>
        <View style={[styles.logoBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.logoIcon}>💰</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Kharcha Notebook</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Personal Monthly Expense & Cash Flow Tracker
        </Text>
        <ActivityIndicator style={styles.loader} color={theme.primary} size="large" />
      </View>

      {/* Developed by Satyam Prajapati Credit */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Developed by <Text style={[styles.developerName, { color: theme.primary }]}>Satyam Prajapati</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoIcon: {
    fontSize: 46,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  loader: {
    marginTop: 36,
  },
  footer: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  developerName: {
    fontWeight: '700',
  },
});
