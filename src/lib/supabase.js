import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the env vars are missing (e.g. running without Supabase configured yet),
// `supabase` stays null and the rest of the app falls back to localStorage.
export const supabase = url && key ? createClient(url, key) : null;
