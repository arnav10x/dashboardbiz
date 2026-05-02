const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function getSupabaseEnv() {
  if (!SUPABASE_URL) {
    throw new Error(
      "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in your .env.local."
    )
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local."
    )
  }

  return {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
  }
}
