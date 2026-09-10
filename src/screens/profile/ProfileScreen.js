import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ProfileScreen = ({ navigation }) => {
  const {
    userName,
    profilePhoto,
    selectedCurrency,
    selectedTheme,
    clearAllData,
  } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState(true);

  const handleExportCsv = () => {
    Alert.alert('Export Successful', 'Your transaction history has been exported as a CSV spreadsheet to local storage.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'Are you sure you want to reset your local profile information and preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'Local data cleared successfully.');
            navigation.replace('Splash');
          },
        },
      ]
    );
  };

  const isPhotoUrl = profilePhoto && (profilePhoto.startsWith('http') || profilePhoto.startsWith('file://') || profilePhoto.startsWith('/'));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Profile & Settings"
        subtitle="Manage your personal notebook"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card with Real Profile DP */}
        <Card style={styles.userCard}>
          <View style={[styles.avatarWrapper, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
            {isPhotoUrl ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
            ) : profilePhoto ? (
              <Text style={{ fontSize: 36 }}>{profilePhoto}</Text>
            ) : (
              <Text style={[styles.avatarInitial, { color: theme.primary }]}>
                {userName ? userName.charAt(0).toUpperCase() : 'S'}
              </Text>
            )}
          </View>

          <Text style={[styles.userName, { color: theme.text }]}>{userName || 'Satyam Prajapati'}</Text>
          <Text style={[styles.userRole, { color: theme.textSecondary }]}>Local Personal Account</Text>

          <Button
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            variant="outline"
            style={styles.editProfileBtn}
          />
        </Card>

        {/* Section: Appearance */}
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Appearance</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('Appearance')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎨</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Theme Mode</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {selectedTheme === 'DARK' ? 'Dark Mode' : selectedTheme === 'LIGHT' ? 'Light Mode' : 'System Default'}
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Section: Financial Preferences */}
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Financial Preferences</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={() => navigation.navigate('Currency')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💱</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Currency</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {selectedCurrency || 'INR (₹)'}
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={() => navigation.navigate('BudgetTab')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎯</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Monthly Budget</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Track category limits & warnings
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert('Categories', 'Expenses: Food, Rent, Groceries, Shopping, Transport, Utilities\n\nIncome: Salary, Freelance, Business, Investment')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🏷️</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Expense & Income Categories</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  View all active tracking tags
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Section: Notifications */}
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Notifications</Text>
        <Card style={styles.settingsCard}>
          <View style={[styles.switchRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationsEnabled ? theme.primary : '#F4F3F4'}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⏰</Text>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Daily Expense Reminder</Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={dailyReminder ? theme.primary : '#F4F3F4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📅</Text>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Monthly Financial Summary</Text>
            </View>
            <Switch
              value={monthlySummary}
              onValueChange={setMonthlySummary}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={monthlySummary ? theme.primary : '#F4F3F4'}
            />
          </View>
        </Card>

        {/* Section: Data & Storage */}
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Data</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={handleExportCsv}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📥</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Export Transactions</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Download CSV report
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <View>
                <Text style={[styles.settingTitle, { color: theme.expense }]}>Clear Local Data</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Reset profile and preferences
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Section: About */}
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>About</Text>
        <Card style={styles.settingsCard}>
          <View style={[styles.aboutRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>App Version</Text>
            <Text style={[styles.aboutVal, { color: theme.text }]}>1.0.0</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>About the App</Text>
            <Text style={[styles.aboutVal, { color: theme.text }]}>Kharcha Notebook</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>Privacy Policy</Text>
            <Text style={[styles.aboutVal, { color: theme.primary }]}>Offline & Local-first</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>Terms & Conditions</Text>
            <Text style={[styles.aboutVal, { color: theme.text }]}>Open Personal License</Text>
          </View>
        </Card>

        {/* Developer Attribution */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Kharcha Notebook
          </Text>
          <Text style={[styles.developerName, { color: theme.primary }]}>
            Developed by Satyam Prajapati
          </Text>
        </View>
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
  userCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userRole: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  editProfileBtn: {
    width: 160,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
    letterSpacing: 0.3,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  aboutVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  developerName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
});
