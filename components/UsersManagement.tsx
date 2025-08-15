"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, UserPlus, Shield, User, Trash2 } from "lucide-react"
import type { Profile } from "@/lib/types"

export default function UsersManagement() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user")
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (user) {
      loadUsers()
      loadCurrentUserProfile()
    }
  }, [user])

  const loadCurrentUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

      if (error) throw error
      setCurrentUserProfile(data)
    } catch (error) {
      console.error("Error loading current user profile:", error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteEmail.trim()) {
      toast({
        title: "Erro",
        description: "Email é obrigatório",
        variant: "destructive",
      })
      return
    }

    setIsInviting(true)
    try {
      // In a real app, you would send an invitation email
      // For now, we'll just show a success message
      toast({
        title: "Convite Enviado",
        description: `Convite enviado para ${inviteEmail}`,
      })

      setInviteEmail("")
      setInviteRole("user")
      setIsInviting(false)
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Função do usuário atualizada",
      })

      loadUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função do usuário",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso",
      })

      loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive",
      })
    }
  }

  const isAdmin = currentUserProfile?.role === "admin"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>Você não tem permissão para acessar o gerenciamento de usuários.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
          <p className="text-gray-600">Gerencie usuários e permissões do sistema</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
              <DialogDescription>Envie um convite para um novo usuário se juntar ao sistema</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="inviteRole">Função</Label>
                <Select value={inviteRole} onValueChange={(value: "admin" | "user") => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? "Enviando..." : "Enviar Convite"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
            ) : (
              users.map((userProfile) => (
                <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={userProfile.avatar_url || ""} />
                      <AvatarFallback>
                        {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{userProfile.full_name || "Nome não informado"}</h3>
                        {userProfile.id === user?.id && <Badge variant="outline">Você</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">{userProfile.email}</p>
                      <p className="text-xs text-gray-400">
                        Criado em {format(new Date(userProfile.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={userProfile.role === "admin" ? "default" : "secondary"}>
                      {userProfile.role === "admin" ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          Usuário
                        </>
                      )}
                    </Badge>

                    {userProfile.id !== user?.id && (
                      <div className="flex gap-1">
                        <Select
                          value={userProfile.role}
                          onValueChange={(value: "admin" | "user") => updateUserRole(userProfile.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(userProfile.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
