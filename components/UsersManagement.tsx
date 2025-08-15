"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/contexts/UserContext"
import { supabase } from "@/lib/supabase/client"
import { HistoricoService } from "@/lib/services/historico"
import type { User } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Shield, Mail, Calendar, UserCheck, UserX, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UsersManagementProps {
  open: boolean
  onClose: () => void
}

export default function UsersManagement({ open, onClose }: UsersManagementProps) {
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    password: "",
    permissao: "visualizacao" as "visualizacao" | "edicao",
    foto: "",
  })

  const fetchUsers = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`conta_principal_id.eq.${currentUser.id},id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    if (!currentUser || !newUser.nome || !newUser.email || !newUser.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          nome: newUser.nome,
        },
      })

      if (authError) throw authError

      // Criar registro na tabela users
      const { error: userError } = await supabase.from("users").insert({
        auth_user_id: authData.user.id,
        nome: newUser.nome,
        email: newUser.email,
        foto: newUser.foto,
        conta_principal_id: currentUser.id,
        permissao: newUser.permissao,
      })

      if (userError) throw userError

      // Registrar no histórico
      await HistoricoService.registrarAlteracao(
        currentUser.id,
        `Usuário criado: ${newUser.nome}`,
        null,
        newUser,
        "users",
        authData.user.id,
      )

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      })

      setNewUser({
        nome: "",
        email: "",
        password: "",
        permissao: "visualizacao",
        foto: "",
      })
      setShowCreateUser(false)
      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!currentUser) return

    setLoading(true)
    try {
      const userToUpdate = users.find((u) => u.id === userId)
      if (!userToUpdate) return

      const { error } = await supabase.from("users").update(updates).eq("id", userId)

      if (error) throw error

      // Registrar no histórico
      await HistoricoService.registrarAlteracao(
        currentUser.id,
        `Usuário atualizado: ${userToUpdate.nome}`,
        {
          nome: userToUpdate.nome,
          permissao: userToUpdate.permissao,
          ativo: userToUpdate.ativo,
        },
        updates,
        "users",
        userId,
      )

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      })

      await fetchUsers()
      setEditingUser(null)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await updateUser(userId, { ativo: !currentStatus })
  }

  const deleteUser = async (userId: string) => {
    if (!currentUser) return

    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      return
    }

    setLoading(true)
    try {
      const userToDelete = users.find((u) => u.id === userId)
      if (!userToDelete) return

      // Excluir do Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.auth_user_id)
      if (authError) throw authError

      // O usuário será excluído automaticamente da tabela users devido ao CASCADE

      // Registrar no histórico
      await HistoricoService.registrarAlteracao(
        currentUser.id,
        `Usuário excluído: ${userToDelete.nome}`,
        userToDelete,
        null,
        "users",
        userId,
      )

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      })

      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isMainAccount = (user: User) => !user.conta_principal_id

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gerenciar Usuários
            </DialogTitle>
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.foto || "/placeholder.svg"} alt={user.nome} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{user.nome}</h3>
                      {isMainAccount(user) && (
                        <Badge variant="outline" className="text-xs">
                          Conta Principal
                        </Badge>
                      )}
                      <Badge
                        variant={user.ativo ? "default" : "secondary"}
                        className={user.ativo ? "bg-green-600" : "bg-gray-500"}
                      >
                        {user.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <Badge variant={user.permissao === "edicao" ? "default" : "secondary"} className="text-xs">
                          {user.permissao === "edicao" ? "Edição" : "Visualização"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>

                {!isMainAccount(user) && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleUserStatus(user.id, user.ativo)}>
                      {user.ativo ? (
                        <>
                          <UserX className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
          )}
        </div>

        {/* Modal de Criar Usuário */}
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={newUser.nome}
                  onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Senha do usuário"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="permissao">Permissão</Label>
                <Select
                  value={newUser.permissao}
                  onValueChange={(value: "visualizacao" | "edicao") => setNewUser({ ...newUser, permissao: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visualizacao">Visualização</SelectItem>
                    <SelectItem value="edicao">Edição</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="foto">URL da Foto (opcional)</Label>
                <Input
                  id="foto"
                  value={newUser.foto}
                  onChange={(e) => setNewUser({ ...newUser, foto: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createUser} disabled={loading} className="flex-1">
                  {loading ? "Criando..." : "Criar Usuário"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateUser(false)
                    setNewUser({
                      nome: "",
                      email: "",
                      password: "",
                      permissao: "visualizacao",
                      foto: "",
                    })
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Editar Usuário */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>

            {editingUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-nome">Nome</Label>
                  <Input
                    id="edit-nome"
                    value={editingUser.nome}
                    onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-permissao">Permissão</Label>
                  <Select
                    value={editingUser.permissao}
                    onValueChange={(value: "visualizacao" | "edicao") =>
                      setEditingUser({ ...editingUser, permissao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visualizacao">Visualização</SelectItem>
                      <SelectItem value="edicao">Edição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-foto">URL da Foto</Label>
                  <Input
                    id="edit-foto"
                    value={editingUser.foto || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, foto: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() =>
                      updateUser(editingUser.id, {
                        nome: editingUser.nome,
                        permissao: editingUser.permissao,
                        foto: editingUser.foto,
                      })
                    }
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
