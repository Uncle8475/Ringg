const DISABLED_ERROR = 'Supabase has been removed from this build.';

export const signInWithOAuth = async () => ({
  user: null,
  session: null,
  error: DISABLED_ERROR,
  authUrl: null,
});

export const signUpWithOAuth = async () => ({
  user: null,
  session: null,
  error: DISABLED_ERROR,
  authUrl: null,
});

export const handleOAuthCallback = async () => ({
  user: null,
  session: null,
  error: DISABLED_ERROR,
});

export const verifyOAuthUser = async () => ({
  success: false,
  error: DISABLED_ERROR,
});

export const getSupportedOAuthProviders = () => [];

export default {
  signInWithOAuth,
  signUpWithOAuth,
  handleOAuthCallback,
  verifyOAuthUser,
  getSupportedOAuthProviders,
};
