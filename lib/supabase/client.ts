import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If not configured, return a mock client to prevent errors
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your-supabase-url" ||
    supabaseAnonKey === "your-supabase-anon-key"
  ) {
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function isSupabaseConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your-supabase-url" &&
    supabaseAnonKey !== "your-supabase-anon-key"
  )
}
