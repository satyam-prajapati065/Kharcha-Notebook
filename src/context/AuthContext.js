import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const STORAGE_KEYS = {
  USER_NAME: 'userName',
  PROFILE_PHOTO: 'profilePhoto',
  PROFILE_SETUP_COMPLETED: 'profileSetupCompleted',
  SELECTED_CURRENCY: 'selectedCurrency',
  SELECTED_THEME: 'selectedTheme',
};

export const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState('Satyam Prajapati');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profileSetupCompleted, setProfileSetupCompleted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR ₹');
  const [selectedTheme, setSelectedTheme] = useState('SYSTEM');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocalProfile();
  }, []);

  const loadLocalProfile = async () => {
    try {
      const storedName = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      const storedPhoto = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_PHOTO);
      const storedCompleted = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED);
      const storedCurrency = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CURRENCY);
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_THEME);

      if (storedName) setUserName(storedName);
      if (storedPhoto) setProfilePhoto(storedPhoto);
      if (storedCompleted === 'true') setProfileSetupCompleted(true);
      if (storedCurrency) setSelectedCurrency(storedCurrency);
      if (storedTheme) setSelectedTheme(storedTheme);
    } catch (e) {
      console.warn('Failed to load local user profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  const completeFirstTimeSetup = async ({ name, photo, currency = 'INR ₹' }) => {
    try {
      const trimmedName = name?.trim() || 'Satyam Prajapati';
      const photoVal = photo || '';
      const currVal = currency || 'INR ₹';

      setUserName(trimmedName);
      setProfilePhoto(photoVal);
      setSelectedCurrency(currVal);
      setProfileSetupCompleted(true);

      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, trimmedName);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_PHOTO, photoVal);
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CURRENCY, currVal);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED, 'true');
    } catch (e) {
      console.warn('Failed to save profile setup', e);
    }
  };

  const updateProfile = async ({ name, photo }) => {
    try {
      if (name !== undefined) {
        setUserName(name);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
      }
      if (photo !== undefined) {
        setProfilePhoto(photo);
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_PHOTO, photo);
      }
    } catch (e) {
      console.warn('Failed to update profile', e);
    }
  };

  const updateCurrency = async (curr) => {
    try {
      setSelectedCurrency(curr);
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CURRENCY, curr);
    } catch (e) {
      console.warn('Failed to update currency', e);
    }
  };

  const updateTheme = async (theme) => {
    try {
      setSelectedTheme(theme);
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_THEME, theme);
    } catch (e) {
      console.warn('Failed to update theme', e);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setUserName('Satyam Prajapati');
      setProfilePhoto('');
      setProfileSetupCompleted(false);
      setSelectedCurrency('INR ₹');
      setSelectedTheme('SYSTEM');
    } catch (e) {
      console.warn('Failed to clear data', e);
    }
  };

  // Profile object for backwards compatibility with existing UI components
  const user = {
    name: userName,
    photo: profilePhoto,
    currency: selectedCurrency,
    theme: selectedTheme,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        profilePhoto,
        profileSetupCompleted,
        selectedCurrency,
        selectedTheme,
        isLoading,
        isAuthenticated: true,
        hasCompletedSetup: profileSetupCompleted,
        completeFirstTimeSetup,
        updateProfile,
        updateUserInfo: updateProfile,
        updateCurrency,
        updateTheme,
        clearAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
