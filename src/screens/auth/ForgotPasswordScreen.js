import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);

  const handleSubmit = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Reset Password"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {submitted ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={[styles.successTitle, { color: theme.text }]}>Reset Link Sent</Text>
            <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
              We have dispatched password reset instructions to {email}. Check your inbox or spam folder.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: 24, width: '100%' }}
            />
          </View>
        ) : (
          <View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Enter your registered account email and we will send you instructions to reset your password.
            </Text>

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: 16 }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
