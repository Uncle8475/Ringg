/**
 * Setup Manager Utility
 * 
 * Centralized management for ring setup flow state.
 * Handles initialization, reset, and completion of setup process.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for setup flow
export const SETUP_KEYS = {
  STEP: 'setupStep',
  COMPLETED: 'setupCompleted',
};

// Storage keys for setup-related data to clear
const SETUP_DATA_KEYS = [
  'ringName',           // From Personalization screen
  'ringOptions',        // From Personalization screen
  'userProfile',        // From UserProfile screen
  'otpVerification',    // From OTPVerification screen
];

/**
 * Completely restart the setup flow
 * - Clears all setup-related data
 * - Resets setup completion flag
 * - Resets step counter to 0
 * 
 * @returns {Promise<void>}
 */
export const restartSetup = async () => {
  try {
    // Clear setup state
    await AsyncStorage.removeItem(SETUP_KEYS.COMPLETED);
    await AsyncStorage.setItem(SETUP_KEYS.STEP, '0');
    
    // Clear all setup-related data
    await Promise.all(
      SETUP_DATA_KEYS.map(key => AsyncStorage.removeItem(key))
    );
    
    console.log('✅ Setup restarted successfully');
  } catch (error) {
    console.error('❌ Error restarting setup:', error);
    throw error;
  }
};

/**
 * Check if setup is completed
 * @returns {Promise<boolean>}
 */
export const isSetupCompleted = async () => {
  try {
    const completed = await AsyncStorage.getItem(SETUP_KEYS.COMPLETED);
    return completed === 'true';
  } catch (error) {
    console.warn('Error checking setup status:', error);
    return false;
  }
};

/**
 * Get current setup step
 * @returns {Promise<number>}
 */
export const getCurrentStep = async () => {
  try {
    const step = await AsyncStorage.getItem(SETUP_KEYS.STEP);
    return step !== null ? Number(step) : 0;
  } catch (error) {
    console.warn('Error getting setup step:', error);
    return 0;
  }
};

/**
 * Mark setup as completed
 * @returns {Promise<void>}
 */
export const completeSetup = async () => {
  try {
    await AsyncStorage.setItem(SETUP_KEYS.COMPLETED, 'true');
    await AsyncStorage.removeItem(SETUP_KEYS.STEP);
  } catch (error) {
    console.error('Error completing setup:', error);
    throw error;
  }
};

/**
 * Update current setup step
 * @param {number} step - The step number to set
 * @returns {Promise<void>}
 */
export const setSetupStep = async (step) => {
  try {
    await AsyncStorage.setItem(SETUP_KEYS.STEP, String(step));
  } catch (error) {
    console.error('Error setting setup step:', error);
    throw error;
  }
};
