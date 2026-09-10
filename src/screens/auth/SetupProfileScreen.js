import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const AVATAR_PRESETS = [
  '👨‍💼', '👩‍💼', '🧑‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓',
  '😎', '🤠', '🦁', '🚀', '🌟', '💰',
];

export const SetupProfileScreen = ({ navigation }) => {
  const { user, completeFirstTimeSetup } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [name, setName] = useState(user?.name || 'Satyam Prajapati');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍💼');
  const [customPhotoUri, setCustomPhotoUri] = useState('');
  const [currency, setCurrency] = useState('INR (₹)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Allow uploading a photo or selecting preset
  const handlePickPhoto = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an avatar or upload from your device gallery',
      [
        {
          text: 'Default Satyam Avatar 👨‍💼',
          onPress: () => {
            setSelectedAvatar('👨‍💼');
            setCustomPhotoUri('');
          },
        },
        {
          text: 'Business Avatar 💼',
          onPress: () => {
            setSelectedAvatar('💼');
            setCustomPhotoUri('');
          },
        },
        {
          text: 'Device Gallery Simulation',
          onPress: () => {
            // High-resolution avatar photo
            setCustomPhotoUri('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFinishSetup = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await completeFirstTimeSetup({
        name: name.trim(),
        photo: customPhotoUri || selectedAvatar,
        currency,
      });

      navigation.replace('Main');
    } catch (err) {
      setError(err.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={styles.logoIcon}>💰</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome to Kharcha Notebook</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Let's personalize your personal expense & cash flow tracker
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.expenseBg }]}>
            <Text style={[styles.errorText, { color: theme.expense }]}>{error}</Text>
          </View>
        ) : null}

        {/* Profile Avatar Card */}
        <Card style={styles.avatarCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Picture</Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            Tap to change or pick your favorite avatar
          </Text>

          <TouchableOpacity
            onPress={handlePickPhoto}
            style={[styles.avatarWrapper, { borderColor: theme.primary, backgroundColor: theme.card }]}
            activeOpacity={0.8}
          >
            {customPhotoUri ? (
              <Image source={{ uri: customPhotoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.editBadgeIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          <Button
            title="Upload from Gallery"
            onPress={handlePickPhoto}
            variant="outline"
            style={{ marginTop: 12, width: '100%' }}
          />

          {/* Quick Avatar Presets */}
          <Text style={[styles.presetLabel, { color: theme.textSecondary }]}>Or pick an avatar:</Text>
          <View style={styles.presetsGrid}>
            {AVATAR_PRESETS.map((item, index) => {
              const isSelected = !customPhotoUri && selectedAvatar === item;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedAvatar(item);
                    setCustomPhotoUri('');
                  }}
                  style={[
                    styles.presetItem,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : theme.inputBg,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.presetEmoji}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* User Details */}
        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Information</Text>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Satyam Prajapati"
            style={{ marginTop: 10 }}
          />

          <View style={styles.currencyRow}>
            <Text style={[styles.currencyLabel, { color: theme.textSecondary }]}>
              Primary Currency:
            </Text>
            <View style={[styles.currencyBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.currencyText, { color: theme.primary }]}>
                INR (₹) Indian Rupee
              </Text>
            </View>
          </View>
        </Card>

        {/* Submit */}
        <Button
          title="Continue to Notebook →"
          onPress={handleFinishSetup}
          loading={loading}
          variant="primary"
          style={{ marginTop: 10, marginBottom: 30 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatarCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadgeIcon: {
    fontSize: 12,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  presetItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  presetEmoji: {
    fontSize: 22,
  },
  detailsCard: {
    padding: 18,
    marginBottom: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F040',
  },
  currencyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  currencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerCredit: {
    fontSize: 13,
    fontWeight: '500',
  },
});
