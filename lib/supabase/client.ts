import { createBrowserClient } from "@supabase/ssr"

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !!(url && key && url !== "your-supabase-url" && key !== "your-supabase-anon-key")
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
