"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Calendar, Clock, CheckCircle, AlertCircle, Info } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import UsersManagement from "./UsersManagement"
import { useToast } from "@/components/ui/use-toast" // Import useToast hook
import { Label, Input, Textarea, Button, Badge } from "@/components/ui" // Import necessary components

interface Interacao {
  id: string
  tipo: "nota" | "lembrete" | "observacao" | "alerta"
  titulo: string
  conteudo: string
  dataCreated: Date
  dataVencimento?: Date
  status: "pendente" | "concluida" | "cancelada"
  prioridade: "baixa" | "media" | "alta"
  categoria: string
}

const tiposInteracao = [
  { value: "nota", label: "Nota", icon: MessageSquare, color: "bg-blue-100 text-blue-800" },
  { value: "lembrete", label: "Lembrete", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "observacao", label: "Observação", icon: Info, color: "bg-gray-100 text-gray-800" },
  { value: "alerta", label: "Alerta", icon: AlertCircle, color: "bg-red-100 text-red-800" },
]

const prioridades = [
  { value: "baixa", label: "Baixa", color: "bg-green-100 text-green-800" },
  { value: "media", label: "Média", color: "bg-yellow-100 text-yellow-800" },
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-800" },
]

const { History, Users, Settings } = require("lucide-react")

export default function InteracoesPanel() {
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const { toast } = useToast() // Declare useToast hook
  const [activeTab, setActiveTab] = useState("history")

  const [novaInteracao, setNovaInteracao] = useState({
    tipo: "nota" as const,
    titulo: "",
    conteudo: "",
    dataVencimento: "",
    prioridade: "media" as const,
    categoria: "geral",
  })

  const adicionarInteracao = () => {
    if (!novaInteracao.titulo.trim() || !novaInteracao.conteudo.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive",
      })
      return
    }

    const interacao: Interacao = {
      id: Date.now().toString(),
      tipo: novaInteracao.tipo,
      titulo: novaInteracao.titulo,
      conteudo: novaInteracao.conteudo,
      dataCreated: new Date(),
      dataVencimento: novaInteracao.dataVencimento ? new Date(novaInteracao.dataVencimento) : undefined,
      status: "pendente",
      prioridade: novaInteracao.prioridade,
      categoria: novaInteracao.categoria,
    }

    setInteracoes([interacao, ...interacoes])
    setNovaInteracao({
      tipo: "nota",
      titulo: "",
      conteudo: "",
      dataVencimento: "",
      prioridade: "media",
      categoria: "geral",
    })
    setMostrarFormulario(false)

    toast({
      title: "Sucesso",
      description: "Interação adicionada com sucesso!",
    })
  }

  const alterarStatus = (id: string, novoStatus: Interacao["status"]) => {
    setInteracoes(
      interacoes.map((interacao) => (interacao.id === id ? { ...interacao, status: novoStatus } : interacao)),
    )
  }

  const excluirInteracao = (id: string) => {
    setInteracoes(interacoes.filter((interacao) => interacao.id !== id))
    toast({
      title: "Sucesso",
      description: "Interação excluída com sucesso!",
    })
  }

  const interacoesFiltradas = interacoes.filter((interacao) => {
    const matchTipo = filtroTipo === "todos" || interacao.tipo === filtroTipo
    const matchStatus = filtroStatus === "todos" || interacao.status === filtroStatus
    return matchTipo && matchStatus
  })

  const getTipoConfig = (tipo: string) => {
    return tiposInteracao.find((t) => t.value === tipo) || tiposInteracao[0]
  }

  const getPrioridadeConfig = (prioridade: string) => {
    return prioridades.find((p) => p.value === prioridade) || prioridades[1]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Painel de Interações</CardTitle>
          <CardDescription>Gerencie histórico, usuários e configurações do sistema</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div>
                    <Label className="text-sm">Tipo:</Label>
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className="ml-2 px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="todos">Todos</option>
                      {tiposInteracao.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm">Status:</Label>
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      className="ml-2 px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="pendente">Pendente</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Total</p>
                    <p className="text-xl font-bold text-blue-800">{interacoes.length}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-600">Pendentes</p>
                    <p className="text-xl font-bold text-yellow-800">
                      {interacoes.filter((i) => i.status === "pendente").length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600">Concluídas</p>
                    <p className="text-xl font-bold text-green-800">
                      {interacoes.filter((i) => i.status === "concluida").length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600">Alta Prioridade</p>
                    <p className="text-xl font-bold text-red-800">
                      {interacoes.filter((i) => i.prioridade === "alta" && i.status === "pendente").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário */}
            {mostrarFormulario && (
              <Card>
                <CardHeader>
                  <CardTitle>Nova Interação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <select
                        value={novaInteracao.tipo}
                        onChange={(e) => setNovaInteracao({ ...novaInteracao, tipo: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {tiposInteracao.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Prioridade</Label>
                      <select
                        value={novaInteracao.prioridade}
                        onChange={(e) => setNovaInteracao({ ...novaInteracao, prioridade: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {prioridades.map((prioridade) => (
                          <option key={prioridade.value} value={prioridade.value}>
                            {prioridade.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Título</Label>
                    <Input
                      value={novaInteracao.titulo}
                      onChange={(e) => setNovaInteracao({ ...novaInteracao, titulo: e.target.value })}
                      placeholder="Título da interação..."
                    />
                  </div>

                  <div>
                    <Label>Conteúdo</Label>
                    <Textarea
                      value={novaInteracao.conteudo}
                      onChange={(e) => setNovaInteracao({ ...novaInteracao, conteudo: e.target.value })}
                      placeholder="Descreva a interação..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Vencimento (opcional)</Label>
                      <Input
                        type="datetime-local"
                        value={novaInteracao.dataVencimento}
                        onChange={(e) => setNovaInteracao({ ...novaInteracao, dataVencimento: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Categoria</Label>
                      <Input
                        value={novaInteracao.categoria}
                        onChange={(e) => setNovaInteracao({ ...novaInteracao, categoria: e.target.value })}
                        placeholder="Ex: financeiro, pessoal..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={adicionarInteracao}>Adicionar Interação</Button>
                    <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Interações */}
            <div className="space-y-4">
              {interacoesFiltradas.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma interação encontrada.</p>
                  </CardContent>
                </Card>
              ) : (
                interacoesFiltradas.map((interacao) => {
                  const tipoConfig = getTipoConfig(interacao.tipo)
                  const prioridadeConfig = getPrioridadeConfig(interacao.prioridade)
                  const IconeTipo = tipoConfig.icon

                  return (
                    <Card key={interacao.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <IconeTipo className="w-5 h-5 text-gray-600" />
                            <div>
                              <h3 className="font-semibold text-gray-800">{interacao.titulo}</h3>
                              <p className="text-sm text-gray-500">
                                {format(interacao.dataCreated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={tipoConfig.color}>{tipoConfig.label}</Badge>
                            <Badge className={prioridadeConfig.color}>{prioridadeConfig.label}</Badge>
                            <Badge
                              variant={interacao.status === "concluida" ? "default" : "secondary"}
                              className={
                                interacao.status === "concluida"
                                  ? "bg-green-600"
                                  : interacao.status === "cancelada"
                                    ? "bg-red-600"
                                    : ""
                              }
                            >
                              {interacao.status === "pendente"
                                ? "Pendente"
                                : interacao.status === "concluida"
                                  ? "Concluída"
                                  : "Cancelada"}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">{interacao.conteudo}</p>

                        {interacao.dataVencimento && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Vence em: {format(interacao.dataVencimento, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {interacao.categoria}
                          </Badge>

                          <div className="flex gap-2">
                            {interacao.status === "pendente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => alterarStatus(interacao.id, "concluida")}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Concluir
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => excluirInteracao(interacao.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Configure as preferências do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Configurações em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
