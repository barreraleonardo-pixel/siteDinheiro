"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/contexts/UserContext"
import { HistoricoService } from "@/lib/services/historico"
import type { HistoricoItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { History, Search, Filter, Calendar, Database, Eye, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HistoryViewerProps {
  open: boolean
  onClose: () => void
}

export default function HistoryViewer({ open, onClose }: HistoryViewerProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    busca: "",
    tabela: "todas",
    periodo: "30", // dias
  })
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const fetchHistorico = async () => {
    if (!user) return

    setLoading(true)
    try {
      const items = await HistoricoService.buscarHistorico(user.id, 100)
      setHistorico(items)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filtrarHistorico = () => {
    let items = [...historico]

    // Filtro por busca
    if (filtros.busca) {
      items = items.filter(
        (item) =>
          item.acao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          (item.tabela_afetada && item.tabela_afetada.toLowerCase().includes(filtros.busca.toLowerCase())),
      )
    }

    // Filtro por tabela
    if (filtros.tabela !== "todas") {
      items = items.filter((item) => item.tabela_afetada === filtros.tabela)
    }

    // Filtro por período
    if (filtros.periodo !== "todos") {
      const diasAtras = Number.parseInt(filtros.periodo)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - diasAtras)

      items = items.filter((item) => new Date(item.data_hora) >= dataLimite)
    }

    return items
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const formatarDados = (dados: any) => {
    if (!dados) return "N/A"

    try {
      return JSON.stringify(dados, null, 2)
    } catch {
      return String(dados)
    }
  }

  const getActionIcon = (acao: string) => {
    if (acao.includes("criado") || acao.includes("adicionado")) {
      return <div className="w-2 h-2 rounded-full bg-green-500" />
    }
    if (acao.includes("atualizado") || acao.includes("editado")) {
      return <div className="w-2 h-2 rounded-full bg-blue-500" />
    }
    if (acao.includes("excluído") || acao.includes("removido")) {
      return <div className="w-2 h-2 rounded-full bg-red-500" />
    }
    return <div className="w-2 h-2 rounded-full bg-gray-500" />
  }

  const nomes: Record<string, string> = {
    users: "Usuários",
    cartoes: "Cartões",
    despesas: "Despesas",
    receitas: "Receitas",
    categorias_plano: "Categorias de Planejamento",
  }

  const getTableDisplayName = (tabela?: string) => {
    return nomes[tabela || ""] || tabela || "N/A"
  }

  useEffect(() => {
    if (open) {
      fetchHistorico()
    }
  }, [open])

  const historicoFiltrado = filtrarHistorico()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Alterações
            </DialogTitle>
            <Button onClick={fetchHistorico} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </DialogHeader>

        {/* Filtros */}
        <div className="space-y-4 border-b pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="busca"
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  placeholder="Buscar por ação ou tabela..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tabela">Tabela</Label>
              <Select value={filtros.tabela} onValueChange={(value) => setFiltros({ ...filtros, tabela: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as tabelas</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                  <SelectItem value="cartoes">Cartões</SelectItem>
                  <SelectItem value="despesas">Despesas</SelectItem>
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="categorias_plano">Categorias de Planejamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodo">Período</Label>
              <Select value={filtros.periodo} onValueChange={(value) => setFiltros({ ...filtros, periodo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                Mostrando {historicoFiltrado.length} de {historico.length} registros
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Lista do Histórico */}
        <div className="space-y-3">
          {historicoFiltrado.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getActionIcon(item.acao)}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{item.acao}</h3>
                      {item.tabela_afetada && (
                        <Badge variant="outline" className="text-xs">
                          <Database className="w-3 h-3 mr-1" />
                          {getTableDisplayName(item.tabela_afetada)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                      {item.registro_id && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">ID: {item.registro_id.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Dados expandidos */}
                    {expandedItems.has(item.id) && (
                      <div className="mt-3 space-y-3 border-t pt-3">
                        {item.dados_anteriores && (
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Dados Anteriores:</Label>
                            <pre className="text-xs bg-red-50 p-2 rounded border overflow-x-auto">
                              {formatarDados(item.dados_anteriores)}
                            </pre>
                          </div>
                        )}

                        {item.dados_novos && (
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Dados Novos:</Label>
                            <pre className="text-xs bg-green-50 p-2 rounded border overflow-x-auto">
                              {formatarDados(item.dados_novos)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Button size="sm" variant="ghost" onClick={() => toggleExpanded(item.id)} className="ml-2">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {historicoFiltrado.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum registro encontrado</p>
              {filtros.busca || filtros.tabela !== "todas" || filtros.periodo !== "30" ? (
                <p className="text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
              ) : null}
            </div>
          )}
        </div>

        {/* Paginação simples */}
        {historicoFiltrado.length > 0 && (
          <div className="flex justify-center pt-4 border-t">
            <p className="text-sm text-gray-600">Mostrando os registros mais recentes</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
