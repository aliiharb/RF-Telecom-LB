import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL_ENV_NAMES = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"] as const;
const SUPABASE_ADMIN_KEY_ENV_NAMES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE",
] as const;

function readFirstEnv(names: readonly string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return { name, value };
  }
  return null;
}

export function getSupabaseAdminClient() {
  const url = readFirstEnv(SUPABASE_URL_ENV_NAMES);
  const key = readFirstEnv(SUPABASE_ADMIN_KEY_ENV_NAMES);

  if (!url) {
    throw new Error(`Supabase admin client is missing a URL. Set one of: ${SUPABASE_URL_ENV_NAMES.join(", ")}.`);
  }

  if (!key) {
    throw new Error(`Supabase admin client is missing a private admin key. Set one of: ${SUPABASE_ADMIN_KEY_ENV_NAMES.join(", ")}.`);
  }

  if (key.value.includes("...") || key.value.startsWith("sb_publishable_")) {
    throw new Error(`${key.name} must be a private Supabase admin key, not a placeholder or publishable key.`);
  }

  return createClient(url.value, key.value, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
