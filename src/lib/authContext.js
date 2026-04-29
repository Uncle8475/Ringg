import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "./supabase";
import { authenticateUser } from "./authHelpers";

const AuthContext = createContext({});

const toNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

const buildProfilePayload = (userId, profileData = {}) => {
  const payload = { user_id: userId };

  const fullName = profileData.full_name ?? profileData.name;
  if (fullName !== undefined) payload.full_name = toNullableString(fullName);
  if (profileData.email !== undefined)
    payload.email = toNullableString(profileData.email);
  if (profileData.phone !== undefined)
    payload.phone = toNullableString(profileData.phone);
  if (profileData.role !== undefined)
    payload.role = toNullableString(profileData.role);
  if (profileData.bio !== undefined)
    payload.bio = toNullableString(profileData.bio);

  return payload;
};

export const SETUP_STAGES = {
  RING_SETUP: "ring_setup",
  COMPLETE: "complete",
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [setupStage, setSetupStage] = useState(SETUP_STAGES.RING_SETUP);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Initialize session and auth state listener
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      setAuthLoading(true);
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          setError(sessionError.message);
        }

        setSession(data?.session || null);
        setUser(data?.session?.user || null);

        // If user exists, move past auth stage
        if (data?.session?.user) {
          setSetupStage(SETUP_STAGES.RING_SETUP);
        }

        setAuthLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setAuthLoading(false);
        }
      }
    };

    initializeSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession || null);
        setUser(nextSession?.user || null);

        if (nextSession?.user) {
          setSetupStage(SETUP_STAGES.RING_SETUP);
        }

        setAuthLoading(false);
      },
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const updateLocalProfile = async (updatedProfile) => {
    const nextProfile = { ...(profile || {}), ...(updatedProfile || {}) };
    setProfile(nextProfile);
    return { profile: nextProfile, error: null };
  };

  const markProfileCompleted = () => {
    setProfileCompleted(true);
    setSetupStage(SETUP_STAGES.COMPLETE);
  };

  const resetAllAuth = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setSetupStage(SETUP_STAGES.RING_SETUP);
    setProfileCompleted(false);
    setError(null);
  };

  /**
   * SIGN UP - Create a new user account
   */
  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return { user: null, error: signUpError.message };
      }

      // Authorization will happen via email confirmation or auto-confirm
      setSession(data?.session);
      setUser(data?.user);

      return { user: data?.user, error: null };
    } catch (err) {
      const message = err?.message || "Sign up failed. Please try again.";
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * SIGN IN - Sign in with email and password
   */
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { user: null, error: signInError.message };
      }

      setSession(data?.session);
      setUser(data?.user);
      setSetupStage(SETUP_STAGES.RING_SETUP);

      return { user: data?.user, error: null };
    } catch (err) {
      const message = err?.message || "Sign in failed. Please try again.";
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * UNIFIED AUTHENTICATION
   * Handles both sign in and sign up with a single function
   */
  const authenticate = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authenticateUser(email, password);

      if (result.error) {
        setError(result.error);
        return {
          user: null,
          session: null,
          error: result.error,
          isNewUser: false,
        };
      }

      // Set session and user in context
      if (result.session) {
        setSession(result.session);
      }
      if (result.user) {
        setUser(result.user);
        setSetupStage(SETUP_STAGES.RING_SETUP);
      }

      return {
        user: result.user,
        session: result.session,
        error: null,
        isNewUser: result.isNewUser || false,
      };
    } catch (err) {
      const message =
        err?.message || "Authentication failed. Please try again.";
      setError(message);
      return { user: null, session: null, error: message, isNewUser: false };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        return { error: signOutError.message };
      }

      resetAllAuth();
      return { error: null };
    } catch (err) {
      const message = err?.message || "Sign out failed.";
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider, redirectTo) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        return { url: null, error: oauthError.message };
      }

      return { url: data?.url || null, error: null };
    } catch (err) {
      const message = err?.message || "OAuth sign-in failed.";
      setError(message);
      return { url: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const upsertUserProfile = async (profileData) => {
    if (!session?.user?.id) {
      return { profile: null, error: "No active session." };
    }

    const payload = buildProfilePayload(session.user.id, profileData);

    const { data, error: profileError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (profileError) {
      return { profile: null, error: profileError.message };
    }

    setProfile(data);
    return { profile: data, error: null };
  };

  const logout = async () => signOut();
  const clearAuth = () => resetAllAuth();

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      authLoading,
      error,
      isAuthenticated: !!user,
      setupStage,
      profileCompleted,
      updateLocalProfile,
      markProfileCompleted,
      logout,
      clearAuth,
      resetAllAuth,
      setSetupStage,
      setUser,
      setSession,
      setError,
      authenticate,
      signOut,
      signUp,
      signIn,
      upsertUserProfile,
      signInWithProvider,
    }),
    [
      user,
      session,
      profile,
      loading,
      authLoading,
      error,
      setupStage,
      profileCompleted,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
