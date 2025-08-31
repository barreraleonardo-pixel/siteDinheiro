import { createBrowserClient } from "@supabase/ssr"

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith("https://") && url.includes(".supabase.co")
  } catch {
    return false
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found - running in demo mode")
    return null
  }

  if (!isValidUrl(supabaseUrl)) {
    console.warn("Invalid Supabase URL format - running in demo mode")
    return null
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn("Failed to create Supabase client:", error)
    return null
  }
}
