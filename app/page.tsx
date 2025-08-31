import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClientDashboard from "@/components/ClientDashboard"

export default async function HomePage() {
  const supabase = await createClient()

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }
  }

  return <ClientDashboard />
}
