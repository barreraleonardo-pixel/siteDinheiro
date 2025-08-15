"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, Users } from "lucide-react"
import { useUser } from "@/lib/contexts/UserContext"

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  user_metadata: {
    full_name?: string
  }
}

export default function UsersManagement() {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [inviting, setInviting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Note: In a real application, you would need admin privileges to list users
      // This is a simplified example
      const { data, error } = await supabase.auth.admin.listUsers()

      if (error) {
        throw error
      }

      setUsers(data.users as User[])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError("")

    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(newUserEmail, {
        data: {
          invited_by: currentUser?.id,
        },
      })

      if (error) {
        throw error
      }

      setNewUserEmail("")
      setNewUserPassword("")
      await fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setInviting(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
      return
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) {
        throw error
      }

      await fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Novo Usuário
          </CardTitle>
          <CardDescription>Envie um convite por email para um novo usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={inviteUser} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                required
              />
            </div>
            <Button type="submit" disabled={inviting}>
              {inviting ? "Enviando convite..." : "Enviar Convite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Cadastrados ({users.length})
          </CardTitle>
          <CardDescription>Lista de todos os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.user_metadata?.full_name || "Sem nome"}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    {user.id === currentUser?.id && <Badge variant="secondary">Você</Badge>}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Criado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
                    {user.last_sign_in_at && (
                      <p>Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString("pt-BR")}</p>
                    )}
                  </div>
                </div>

                {user.id !== currentUser?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
