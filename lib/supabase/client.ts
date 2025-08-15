import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url.trim() !== "" && key.trim() !== "")
}

export function createSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured")
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return supabaseInstance
}

// Named export for compatibility
export const supabase = createSupabaseBrowser()

// Default export
export default createSupabaseBrowser()
