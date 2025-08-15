"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { Users, Shield, UserCheck, AlertCircle } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: string
  created_at: string
  last_sign_in_at?: string
}

export default function UsersManagement() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user && supabase) {
      checkAdminStatus()
      loadUsers()
    }
  }, [user, supabase])

  const checkAdminStatus = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("role").eq("id", user?.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking admin status:", error)
        return
      }

      setIsAdmin(data?.role === "admin")
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const loadUsers = async () => {
    if (!supabase) return

    try {
      // Simulate user data since we don't have a real user management table
      const mockUsers: UserProfile[] = [
        {
          id: user?.id || "1",
          email: user?.email || "usuario@exemplo.com",
          full_name: user?.user_metadata?.full_name || "Usuário Principal",
          role: "admin",
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        },
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
          <CardDescription>Visualize e gerencie os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você não tem permissões de administrador. Apenas visualização disponível.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{users.length} usuário(s) cadastrado(s)</h3>
              {isAdmin && (
                <Button disabled>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Convidar Usuário
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {users.map((userProfile) => (
                <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{userProfile.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium">{userProfile.full_name || "Nome não informado"}</div>
                      <div className="text-sm text-gray-500">{userProfile.email}</div>
                      <div className="text-xs text-gray-400">
                        Cadastrado em {new Date(userProfile.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userProfile.role === "admin" ? "default" : "secondary"}>
                      <Shield className="h-3 w-3 mr-1" />
                      {userProfile.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                    {userProfile.id === user?.id && <Badge variant="outline">Você</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
