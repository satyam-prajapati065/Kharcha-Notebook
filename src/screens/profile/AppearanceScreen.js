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

export const AppearanceScreen = ({ navigation }) => {
  const { selectedTheme, updateTheme } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);

  const THEMES = [
    { key: 'LIGHT', title: 'Light Mode', sub: 'Bright, high-contrast canvas' },
    { key: 'DARK', title: 'Dark Mode', sub: 'Low light, easy on the eyes' },
    { key: 'SYSTEM', title: 'System Default', sub: 'Matches your device settings' },
  ];

  const handleSelect = async (themeKey) => {
    await updateTheme(themeKey);
    if (themeKey === 'DARK' && !isDarkMode) {
      toggleTheme();
    } else if (themeKey === 'LIGHT' && isDarkMode) {
      toggleTheme();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Appearance"
        subtitle="Choose your preferred color theme"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Changes are stored locally and will apply immediately.
        </Text>

        <Card style={styles.card}>
          {THEMES.map((item, index) => {
            const isSelected = selectedTheme === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleSelect(item.key)}
                style={[
                  styles.themeRow,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: index === THEMES.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.sub, { color: theme.textSecondary }]}>{item.sub}</Text>
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
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
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
