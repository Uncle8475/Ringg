import supabase from './supabase';

/**
 * ============================================================================
 * UNIFIED AUTHENTICATION FUNCTION
 * ============================================================================
 * Attempts to authenticate a user with email and password.
 * 
 * Flow:
 * 1. Try to sign in with existing credentials
 * 2. If "Invalid login credentials" → user doesn't exist, attempt sign up
 * 3. Create profile and wallet records after successful auth
 * 4. Return user and session
 * 
 * Error Handling:
 * - Invalid password for existing user → error message
 * - User doesn't exist → auto sign up
 * - Other errors → descriptive message
 * ============================================================================
 */
export const authenticateUser = async (email, password) => {
  if (!email || !password) {
    return {
      user: null,
      session: null,
      error: 'Email and password are required.',
    };
  }

  try {
    // STEP 1: Attempt sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign in succeeded
    if (!signInError && signInData?.session && signInData?.user) {
      await ensureUserRecords(signInData.user.id, email);
      return {
        user: signInData.user,
        session: signInData.session,
        error: null,
        isNewUser: false,
      };
    }

    // STEP 2: Check if error is "Invalid login credentials" (user doesn't exist)
    if (
      signInError &&
      (signInError.message.includes('Invalid login credentials') ||
        signInError.message.includes('User not found'))
    ) {
      // User doesn't exist, attempt sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return {
          user: null,
          session: null,
          error: signUpError.message,
        };
      }

      if (!signUpData?.user) {
        return {
          user: null,
          session: null,
          error: 'Sign up failed. Please try again.',
        };
      }

      // Ensure profile and wallet records exist
      await ensureUserRecords(signUpData.user.id, email);

      // Return user and session if available (depends on email verification settings)
      return {
        user: signUpData.user,
        session: signUpData.session || null,
        error: null,
        isNewUser: true,
      };
    }

    // STEP 3: Other errors (e.g., wrong password, network issues)
    return {
      user: null,
      session: null,
      error: signInError?.message || 'Authentication failed. Please try again.',
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      error: err?.message || 'An unexpected error occurred during authentication.',
    };
  }
};

/**
 * Ensure user profile and wallet records exist in database
 * Uses upsert to avoid duplicate key errors
 */
export const ensureUserRecords = async (userId, email) => {
  try {
    // Upsert profile
    await supabase.from('profiles').upsert(
      {
        user_id: userId,
        email: email,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    // Upsert wallet
    await supabase.from('wallets').upsert(
      {
        user_id: userId,
        balance: 0,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (err) {
    // Log error but don't fail authentication
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error: error ? error.message : null };
};

export const updateUser = async (updates) => {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) {
    return { user: null, error: error.message };
  }
  return { user: data?.user || null, error: null };
};

export default {
  authenticateUser,
  ensureUserRecords,
  signOut,
  updateUser,
};
