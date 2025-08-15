"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"

interface UserContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log("⚠️ Supabase not configured")
      setLoading(false)
      return
    }

    const supabase = createSupabaseBrowser()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      console.log("🔄 Initial session:", session?.user ? "User found" : "No user")
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      console.log("🔄 Auth state changed:", event, session?.user ? "User found" : "No user")
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createSupabaseBrowser()
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  return <UserContext.Provider value={{ user, loading, signOut }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
