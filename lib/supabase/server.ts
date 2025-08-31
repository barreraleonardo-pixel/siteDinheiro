import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Função para validar se uma URL é válida
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith("https://") && url.includes(".supabase.co")
  } catch {
    return false
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Verificar se as variáveis existem e são válidas
  if (!supabaseUrl || !supabaseKey || !isValidUrl(supabaseUrl)) {
    console.log("🔧 Supabase não configurado - rodando em modo demo")
    return null
  }

  try {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignorar erros de cookie em Server Components
          }
        },
      },
    })
  } catch (error) {
    console.error("Erro ao criar cliente Supabase server:", error)
    return null
  }
}
