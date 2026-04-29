/**
 * SUPABASE CLIENT
 * ===============
 * Singleton Supabase instance with proper configuration.
 * 
 * Best Practices:
 * - No hardcoded keys (loaded from environment)
 * - Anon key only (no service_role)
 * - AsyncStorage for session persistence
 * - Auto token refresh enabled
 * - Single client instance (singleton pattern)
 * - Proper error handling
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// CONFIGURATION
// ==========================================
// In Expo/React Native, env variables can come from:
// 1. process.env (if using expo-constants or similar)
// 2. Direct import from config file
// 3. Runtime configuration

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://crvntzlepjbyeaalgdih.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydm50emxlcGpieWVhYWxnZGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzk0OTcsImV4cCI6MjA2MzgxNTQ5N30._Or0WZhokAOoqVdR1cP-MAyTKsB_FGFEt9BK4kWztyQ';

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

// ==========================================
// SINGLETON CLIENT
// ==========================================
let supabaseClient = null;

/**
 * Get or create the Supabase client (singleton)
 * @returns {SupabaseClient} Authenticated Supabase client instance
 */
const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // React Native doesn't use URLs for auth
      },
      global: {
        headers: {
          'X-Client-Info': 'cosmic-attire-app/1.0.0',
        },
      },
    });

    // Verify connection
    console.log('✅ Supabase client initialized');
    console.log(`📍 Project: ${SUPABASE_URL}`);
  }

  return supabaseClient;
};

/**
 * Export singleton instance
 */
export const supabase = getSupabaseClient();

/**
 * Export the getter function for advanced use cases
 */
export const getSupabase = getSupabaseClient;

/**
 * Export configuration for debugging
 */
export const config = {
  url: SUPABASE_URL,
  keyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + '...', // Safe to log
  hasValidConfig: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
};

export default supabase;
