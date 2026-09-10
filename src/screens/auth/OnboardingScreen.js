import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '📈',
    title: 'Track Your Income',
    desc: 'Record cash in from salary, freelancing, investments, and more in seconds.',
  },
  {
    icon: '💳',
    title: 'Track Your Expenses',
    desc: 'Categorize your spending with payment methods like UPI, cash, and cards.',
  },
  {
    icon: '📊',
    title: 'Understand Cash Flow',
    desc: 'Visual analytics, category budgets, and savings rates at your fingertips.',
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await completeOnboarding();
      navigation.replace('Login');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContent}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.icon}>{currentSlide.icon}</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{currentSlide.title}</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>{currentSlide.desc}</Text>

        {/* Indicators */}
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicator,
                {
                  backgroundColor: idx === currentIndex ? theme.primary : theme.border,
                  width: idx === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 54,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomBar: {
    marginBottom: 20,
  },
});
