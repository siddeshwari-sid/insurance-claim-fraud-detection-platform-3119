import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Intentionally not throwing: allows the app to still render (e.g., in CI),
  // while showing auth errors in the UI when user tries to sign in.
  // eslint-disable-next-line no-console
  console.warn(
    "Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY. Auth will not work until configured."
  );
}

// PUBLIC_INTERFACE
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
