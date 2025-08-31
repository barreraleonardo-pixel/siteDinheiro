import { createBrowserClient } from "@supabase/ssr"

// Função para validar se uma URL é válida
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
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Verificar se as variáveis existem e são válidas
  if (!supabaseUrl || !supabaseKey || !isValidUrl(supabaseUrl)) {
    console.log("🔧 Supabase não configurado - rodando em modo demo")
    return null
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
    return null
  }
}
