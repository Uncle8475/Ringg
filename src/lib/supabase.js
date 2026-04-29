/**
 * SUPABASE EXPORT
 * ===============
 * This file re-exports the singleton Supabase client from supabaseClient.js
 * for backward compatibility with existing code.
 *
 * All new imports should use:
 * import { supabase } from './supabaseClient';
 */

export { supabase, getSupabase, config } from './supabaseClient';
export { default } from './supabaseClient';
