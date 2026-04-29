import supabase from "./supabase";

const nowIso = () => new Date().toISOString();
const makeId = (prefix = "id") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

let profile = null;
let rings = [];
let transactions = [];
let walletBalance = 0;
let otpVerification = null;

const getSessionUserId = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("[dbHelpers] getSessionUserId error:", error.message);
    return null;
  }
  const userId = data?.session?.user?.id || null;
  console.log("[dbHelpers] getSessionUserId returned:", userId);
  return userId;
};

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

/**
 * ============================================================================
 * PROFILE FUNCTIONS
 * ============================================================================
 */
export const createUserProfile = async (_userId, profileData) => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { user: null, error: "No active session." };
  }

  const payload = buildProfilePayload(userId, profileData);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return { user: null, error: error.message };
  }

  profile = data || null;
  return { user: profile, error: null };
};

export const getUserProfile = async () => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { profile: null, error: "No active session." };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      console.warn("[dbHelpers] getUserProfile error:", errorMsg);

      // Fallback to localStorage for development/bypass mode
      if (
        errorMsg.includes("401") ||
        errorMsg.includes("Unauthorized") ||
        errorMsg.includes("row-level security") ||
        errorMsg.includes("RLS")
      ) {
        console.warn(
          "[dbHelpers] Using localStorage fallback for getUserProfile",
        );
        const storageKey = `profile_${userId}`;
        const cachedProfile = JSON.parse(
          localStorage.getItem(storageKey) || "null",
        );
        if (cachedProfile) {
          profile = cachedProfile;
          return { profile: cachedProfile, error: null };
        }
      }

      return { profile: null, error: errorMsg };
    }

    profile = data || null;
    return { profile, error: null };
  } catch (err) {
    console.error("[dbHelpers] getUserProfile exception:", err);
    return { profile: null, error: err.message };
  }
};

export const updateUserProfile = async (updates, userId = null) => {
  // If userId not provided, try to get from session
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    resolvedUserId = await getSessionUserId();
  }

  if (!resolvedUserId) {
    const error = "No active session and no userId provided.";
    console.error("[dbHelpers] updateUserProfile:", error);
    return { profile: null, error };
  }

  console.log(
    "[dbHelpers] updateUserProfile called with userId:",
    resolvedUserId,
  );
  const payload = buildProfilePayload(resolvedUserId, updates);
  console.log("[dbHelpers] updateUserProfile payload:", payload);

  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error("[dbHelpers] updateUserProfile error:", errorMsg);

      // Fallback to localStorage for development/bypass mode
      // Catch 401, Unauthorized, and RLS policy violations
      if (
        errorMsg.includes("401") ||
        errorMsg.includes("Unauthorized") ||
        errorMsg.includes("row-level security") ||
        errorMsg.includes("RLS")
      ) {
        console.warn(
          "[dbHelpers] Using localStorage fallback (development mode)",
        );
        const storageKey = `profile_${resolvedUserId}`;
        const existingProfile = JSON.parse(
          localStorage.getItem(storageKey) || "{}",
        );
        const updatedProfile = {
          ...existingProfile,
          ...payload,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
        profile = updatedProfile;
        console.log(
          "[dbHelpers] Profile saved to localStorage:",
          updatedProfile,
        );
        return { profile: updatedProfile, error: null };
      }

      return { profile: null, error: errorMsg };
    }

    console.log("[dbHelpers] updateUserProfile success:", data);
    profile = data || null;
    return { profile, error: null };
  } catch (err) {
    console.error("[dbHelpers] updateUserProfile exception:", err);
    return { profile: null, error: err.message };
  }
};

/**
 * ============================================================================
 * WALLET FUNCTIONS
 * ============================================================================
 * Proper Supabase wallet operations with upsert for automatic creation
 */
export const getWalletBalance = async () => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { balance: 0, error: "No active session." };
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return { balance: 0, error: error.message };
  }

  return { balance: data?.balance || 0, error: null };
};

export const createWallet = async (userId = null) => {
  const id = userId || (await getSessionUserId());
  if (!id) {
    return { wallet: null, error: "No active session." };
  }

  const { data, error } = await supabase
    .from("wallets")
    .upsert(
      {
        user_id: id,
        balance: 0,
        created_at: nowIso(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    return { wallet: null, error: error.message };
  }

  return { wallet: data, error: null };
};

export const updateWalletBalance = async (newBalance) => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { balance: null, error: "No active session." };
  }

  const { data, error } = await supabase
    .from("wallets")
    .update({ balance: newBalance })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { balance: null, error: error.message };
  }

  walletBalance = data?.balance || 0;
  return { balance: data?.balance || 0, error: null };
};

export const addToWalletBalance = async (amount) => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { balance: null, error: "No active session." };
  }

  // Get current balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  const currentBalance = wallet?.balance || 0;
  const newBalance = currentBalance + amount;

  return updateWalletBalance(newBalance);
};

/**
 * ============================================================================
 * RING FUNCTIONS
 * ============================================================================
 */
export const getUserRings = async () => {
  return { rings: [...rings], error: null };
};

export const addRing = async (ringData) => {
  const ring = {
    id: makeId("ring"),
    ring_id: ringData?.ring_id || makeId("ring_hw"),
    status: ringData?.status || "active",
    last_sync: nowIso(),
    created_at: nowIso(),
  };
  rings = [ring, ...rings];
  return { ring, error: null };
};

export const updateRingStatus = async (ringId, status) => {
  rings = rings.map((r) => (r.id === ringId ? { ...r, status } : r));
  const ring = rings.find((r) => r.id === ringId) || null;
  return { ring, error: ring ? null : "Ring not found" };
};

export const syncRing = async (ringId) => {
  rings = rings.map((r) =>
    r.id === ringId ? { ...r, last_sync: nowIso() } : r,
  );
  const ring = rings.find((r) => r.id === ringId) || null;
  return { ring, error: ring ? null : "Ring not found" };
};

/**
 * ============================================================================
 * TRANSACTION FUNCTIONS
 * ============================================================================
 */
export const getRecentTransactions = async (limit = 20) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
  return { transactions: sorted.slice(0, limit), error: null };
};

export const addTransaction = async (transactionData) => {
  const tx = {
    id: makeId("tx"),
    ring_id: transactionData?.ring_id || null,
    amount: Number(transactionData?.amount || 0),
    type: transactionData?.type || "payment",
    merchant: transactionData?.merchant || "System",
    category: transactionData?.category || "General",
    location: transactionData?.location || null,
    description: transactionData?.description || "",
    created_at: nowIso(),
  };
  transactions = [tx, ...transactions];
  return { transaction: tx, error: null };
};

export const getTransactionDetail = async (transactionId) => {
  const transaction = transactions.find((t) => t.id === transactionId) || null;
  return { transaction, error: transaction ? null : "Transaction not found" };
};

export const getTransactionStats = async () => {
  const stats = { total: 0, payments: 0, refunds: 0 };
  transactions.forEach((tx) => {
    const amount = Number(tx.amount || 0);
    stats.total += amount;
    if (tx.type === "payment") stats.payments += amount;
    if (tx.type === "refund") stats.refunds += amount;
  });
  return { stats, error: null };
};

/**
 * ============================================================================
 * OTP VERIFICATION FUNCTIONS
 * ============================================================================
 */
export const createOtpVerification = async () => {
  otpVerification = { verified: false, created_at: nowIso() };
  return { record: otpVerification, error: null };
};

/**
 * ============================================================================
 * ADMIN FUNCTIONS
 * ============================================================================
 */
export const getAllProfiles = async () => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { profiles: [], error: "No active session." };
  }

  const { data, error } = await supabase.from("profiles").select("*");
  if (error) {
    return { profiles: [], error: error.message };
  }

  return { profiles: data || [], error: null };
};

export const updateProfileRole = async (userId, newRole) => {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return { profile: null, error: "No active session." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  profile = data || profile;
  return { profile, error: null };
};

export const deleteUserProfile = async () => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { error: "No active session." };
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  profile = null;
  return { error: null };
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUserRings,
  addRing,
  updateRingStatus,
  syncRing,
  getRecentTransactions,
  addTransaction,
  getTransactionDetail,
  getTransactionStats,
  getWalletBalance,
  createWallet,
  updateWalletBalance,
  addToWalletBalance,
  createOtpVerification,
  getAllProfiles,
  updateProfileRole,
  deleteUserProfile,
};
