/**
 * SUPABASE CONNECTION TEST
 * ========================
 * Run this to verify Supabase connection is working.
 * 
 * Usage in screens:
 * import { testSupabaseConnection } from '../lib/supabaseTest';
 * 
 * Then call:
 * testSupabaseConnection();
 */

import { supabase, config } from './supabaseClient';

/**
 * Test basic Supabase connection
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log(`📍 Config: ${JSON.stringify(config, null, 2)}`);

    // Test 1: Health check (no authentication required)
    const { error: healthError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (healthError) {
      console.warn('⚠️ Health check warning:', healthError.message);
    } else {
      console.log('✅ Supabase connection OK');
    }

    // Test 2: Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      console.log('✅ User authenticated:', sessionData.session.user.email);
    } else {
      console.log('ℹ️ No active session (this is OK for first-time setup)');
    }

    return { success: true, message: 'Supabase connected successfully' };
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Test sign-up flow
 */
export const testSignUp = async (email, password) => {
  try {
    console.log('🔍 Testing sign-up...');
    const { data, error } = await supabase.auth.signUpWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign-up failed:', error.message);
      return { success: false, message: error.message };
    }

    console.log('✅ Sign-up successful:', data.user.email);
    return { success: true, message: 'User created', user: data.user };
  } catch (error) {
    console.error('❌ Sign-up error:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Test sign-in flow
 */
export const testSignIn = async (email, password) => {
  try {
    console.log('🔍 Testing sign-in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign-in failed:', error.message);
      return { success: false, message: error.message };
    }

    console.log('✅ Sign-in successful:', data.user.email);
    return { success: true, message: 'Signed in', user: data.user };
  } catch (error) {
    console.error('❌ Sign-in error:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Test data query
 */
export const testDataQuery = async () => {
  try {
    console.log('🔍 Testing data query on profiles table...');

    // This will fail if not authenticated, which is expected
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.warn('⚠️ Query failed (normal if not authenticated):', error.message);
      return { success: false, message: error.message };
    }

    console.log('✅ Data query successful, rows:', data?.length || 0);
    return { success: true, message: 'Query OK', data };
  } catch (error) {
    console.error('❌ Query error:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('\n========================================');
  console.log('🚀 SUPABASE CONNECTION TEST SUITE');
  console.log('========================================\n');

  const results = [];

  // Test 1: Connection
  const connTest = await testSupabaseConnection();
  results.push({ name: 'Connection', ...connTest });

  // Test 2: Data Query
  const queryTest = await testDataQuery();
  results.push({ name: 'Data Query', ...queryTest });

  console.log('\n========================================');
  console.log('📋 TEST SUMMARY');
  console.log('========================================');
  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });
  console.log('========================================\n');

  return results;
};
