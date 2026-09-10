import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ThemeContext } from '../context/ThemeContext';

// Screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { SetupProfileScreen } from '../screens/auth/SetupProfileScreen';

// Main Screens
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { AddTransactionScreen } from '../screens/transactions/AddTransactionScreen';
import { CashInScreen } from '../screens/transactions/CashInScreen';
import { CashOutScreen } from '../screens/transactions/CashOutScreen';
import { TransactionDetailsScreen } from '../screens/transactions/TransactionDetailsScreen';
import { EditTransactionScreen } from '../screens/transactions/EditTransactionScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { CalendarViewScreen } from '../screens/analytics/CalendarViewScreen';
import { YearlySummaryScreen } from '../screens/analytics/YearlySummaryScreen';
import { BudgetScreen } from '../screens/budget/BudgetScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { CurrencyScreen } from '../screens/profile/CurrencyScreen';
import { AppearanceScreen } from '../screens/profile/AppearanceScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icons
const TabBarIcon = ({ icon, label, color }) => (
  <View style={styles.tabIconContainer}>
    <Text style={{ fontSize: 20 }}>{icon}</Text>
    <Text style={[styles.tabLabel, { color }]}>{label}</Text>
  </View>
);

const MainTabs = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              icon="🏠"
              label="Home"
              focused={focused}
              color={focused ? theme.primary : theme.textSecondary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              icon="📋"
              label="Activity"
              focused={focused}
              color={focused ? theme.primary : theme.textSecondary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddTransactionScreen}
        options={{
          tabBarIcon: () => (
            <View style={[styles.addFab, { backgroundColor: theme.primary }]}>
              <Text style={styles.addFabText}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              icon="📊"
              label="Analytics"
              focused={focused}
              color={focused ? theme.primary : theme.textSecondary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              icon="👤"
              label="Profile"
              focused={focused}
              color={focused ? theme.primary : theme.textSecondary}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* First-time local setup flow (NO LOGIN/REGISTER) */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />

        {/* Main Tabs */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Dedicated Full-Screen Profile Sub-screens */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Currency" component={CurrencyScreen} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />

        {/* Transaction Sub-screens */}
        <Stack.Screen name="CashIn" component={CashInScreen} />
        <Stack.Screen name="CashOut" component={CashOutScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
        <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />

        {/* Analytics Sub-screens */}
        <Stack.Screen name="CalendarView" component={CalendarViewScreen} />
        <Stack.Screen name="YearlySummary" component={YearlySummaryScreen} />
        <Stack.Screen name="BudgetTab" component={BudgetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  addFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addFabText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
});
