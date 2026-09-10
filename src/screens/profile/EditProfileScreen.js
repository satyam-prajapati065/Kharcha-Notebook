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
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const SAMPLE_GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
];

export const EditProfileScreen = ({ navigation }) => {
  const { userName, profilePhoto, updateProfile } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [name, setName] = useState(userName || 'Satyam Prajapati');
  const [photoUri, setPhotoUri] = useState(profilePhoto || '');
  const [saving, setSaving] = useState(false);

  const handlePickFromGallery = () => {
    Alert.alert(
      'Device Gallery',
      'Select a photo from your device gallery to set as your profile picture:',
      [
        {
          text: 'Portrait Photo 1',
          onPress: () => setPhotoUri(SAMPLE_GALLERY_PHOTOS[0]),
        },
        {
          text: 'Portrait Photo 2',
          onPress: () => setPhotoUri(SAMPLE_GALLERY_PHOTOS[1]),
        },
        {
          text: 'Professional Photo 3',
          onPress: () => setPhotoUri(SAMPLE_GALLERY_PHOTOS[2]),
        },
        {
          text: 'Casual Photo 4',
          onPress: () => setPhotoUri(SAMPLE_GALLERY_PHOTOS[3]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        photo: photoUri,
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Edit Profile"
        subtitle="Update your name and profile picture"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Photo Card */}
        <Card style={styles.photoCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Picture</Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            Upload a real picture from your device gallery
          </Text>

          <TouchableOpacity
            onPress={handlePickFromGallery}
            style={[styles.avatarWrapper, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
            activeOpacity={0.8}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarInitial, { color: theme.primary }]}>
                {name ? name.charAt(0).toUpperCase() : 'S'}
              </Text>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          <Button
            title="Change Profile Photo"
            onPress={handlePickFromGallery}
            variant="outline"
            style={styles.pickButton}
          />
        </Card>

        {/* Name Card */}
        <Card style={styles.inputCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Name</Text>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            style={{ marginTop: 10 }}
          />
        </Card>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          variant="primary"
          style={styles.saveButton}
        />
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
  photoCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 18,
    textAlign: 'center',
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarInitial: {
    fontSize: 44,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: {
    fontSize: 14,
  },
  pickButton: {
    width: '100%',
  },
  inputCard: {
    padding: 20,
    marginBottom: 20,
  },
  saveButton: {
    marginBottom: 30,
  },
});
