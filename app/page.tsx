import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClientDashboard from "@/components/ClientDashboard"

export default async function HomePage() {
  const supabase = await createClient()

  // Se Supabase não estiver configurado, mostrar dashboard em modo demo
  if (!supabase) {
    return <ClientDashboard user={null} />
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Erro ao obter usuário:", error)
      return <ClientDashboard user={null} />
    }

    // Se não há usuário autenticado, redirecionar para login
    if (!user) {
      redirect("/login")
    }

    return <ClientDashboard user={user} />
  } catch (error) {
    console.error("Erro na página inicial:", error)
    return <ClientDashboard user={null} />
  }
}
