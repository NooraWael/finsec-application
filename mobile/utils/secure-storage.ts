import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Key for storing the password in storage
const PASSWORD_KEY = 'temp_auth_password';

// Check if we're on web platform
const isWeb = Platform.OS === 'web';

/**
 * Saves a password to secure storage
 * Falls back to localStorage on web
 * @param {string} password - The password to store
 */
export const savePassword = async (password) => {
  try {
    if (isWeb) {
      // Web fallback - Note: this is not secure for production!
      localStorage.setItem(PASSWORD_KEY, password);
    } else {
      // Native implementation
      await SecureStore.setItemAsync(PASSWORD_KEY, password);
    }
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

/**
 * Retrieves the password from storage
 * Falls back to localStorage on web
 * @returns {Promise<string|null>} - The retrieved password
 */
export const getPassword = async () => {
  try {
    if (isWeb) {
      // Web fallback
      return localStorage.getItem(PASSWORD_KEY);
    } else {
      // Native implementation
      return await SecureStore.getItemAsync(PASSWORD_KEY);
    }
  } catch (error) {
    console.error('Error retrieving from storage:', error);
    return null;
  }
};

/**
 * Removes the password from storage
 * Falls back to localStorage on web
 */
export const removePassword = async () => {
  try {
    if (isWeb) {
      // Web fallback
      localStorage.removeItem(PASSWORD_KEY);
    } else {
      // Native implementation
      await SecureStore.deleteItemAsync(PASSWORD_KEY);
    }
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};