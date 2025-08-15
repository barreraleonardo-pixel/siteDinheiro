"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  BarChart3,
  Wallet,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import Header from "./Header"

interface Transaction {
  id: string
  tipo: "receita" | "despesa"
  valor: number
  categoria: string
  descricao: string
  data: string
  created_at: string
  user_id: string
}

interface Meta {
  id: string
  titulo: string
  valor_alvo: number
  valor_atual: number
  data_limite: string
  created_at: string
  user_id: string
}

interface Orcamento {
  id: string
  categoria: string
  limite: number
  gasto_atual: number
  mes_ano: string
  created_at: string
  user_id: string
}

const categorias = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Serviços",
  "Investimentos",
  "Outros",
]

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroMes, setFiltroMes] = useState("")
  const [busca, setBusca] = useState("")
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddMeta, setShowAddMeta] = useState(false)
  const [showAddOrcamento, setShowAddOrcamento] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Form states
  const [formData, setFormData] = useState({
    tipo: "despesa" as "receita" | "despesa",
    valor: "",
    categoria: "Alimentação", // Updated default value
    descricao: "",
    data: format(new Date(), "yyyy-MM-dd"),
  })

  const [metaForm, setMetaForm] = useState({
    titulo: "",
    valor_alvo: "",
    data_limite: "",
  })

  const [orcamentoForm, setOrcamentoForm] = useState({
    categoria: "Alimentação", // Updated default value
    limite: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transacoes")
        .select("*")
        .order("data", { ascending: false })

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

      // Load metas
      const { data: metasData, error: metasError } = await supabase
        .from("metas")
        .select("*")
        .order("created_at", { ascending: false })

      if (metasError) throw metasError
      setMetas(metasData || [])

      // Load orçamentos
      const currentMonth = format(new Date(), "yyyy-MM")
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("mes_ano", currentMonth)

      if (orcamentosError) throw orcamentosError
      setOrcamentos(orcamentosData || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from("transacoes")
        .insert([
          {
            tipo: formData.tipo,
            valor: Number.parseFloat(formData.valor),
            categoria: formData.categoria,
            descricao: formData.descricao,
            data: formData.data,
          },
        ])
        .select()

      if (error) throw error

      setTransactions((prev) => [data[0], ...prev])
      setFormData({
        tipo: "despesa",
        valor: "",
        categoria: "Alimentação", // Updated default value
        descricao: "",
        data: format(new Date(), "yyyy-MM-dd"),
      })
      setShowAddTransaction(false)

      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso",
      })

      // Update orçamentos
      await updateOrcamentos()
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação",
        variant: "destructive",
      })
    }
  }

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingTransaction) return

    try {
      const { data, error } = await supabase
        .from("transacoes")
        .update({
          tipo: formData.tipo,
          valor: Number.parseFloat(formData.valor),
          categoria: formData.categoria,
          descricao: formData.descricao,
          data: formData.data,
        })
        .eq("id", editingTransaction.id)
        .select()

      if (error) throw error

      setTransactions((prev) => prev.map((t) => (t.id === editingTransaction.id ? data[0] : t)))

      setEditingTransaction(null)
      setFormData({
        tipo: "despesa",
        valor: "",
        categoria: "Alimentação", // Updated default value
        descricao: "",
        data: format(new Date(), "yyyy-MM-dd"),
      })

      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
      })

      await updateOrcamentos()
    } catch (error) {
      console.error("Erro ao editar transação:", error)
      toast({
        title: "Erro",
        description: "Erro ao editar transação",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from("transacoes").delete().eq("id", id)

      if (error) throw error

      setTransactions((prev) => prev.filter((t) => t.id !== id))

      toast({
        title: "Sucesso",
        description: "Transação removida com sucesso",
      })

      await updateOrcamentos()
    } catch (error) {
      console.error("Erro ao remover transação:", error)
      toast({
        title: "Erro",
        description: "Erro ao remover transação",
        variant: "destructive",
      })
    }
  }

  const handleAddMeta = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from("metas")
        .insert([
          {
            titulo: metaForm.titulo,
            valor_alvo: Number.parseFloat(metaForm.valor_alvo),
            valor_atual: 0,
            data_limite: metaForm.data_limite,
          },
        ])
        .select()

      if (error) throw error

      setMetas((prev) => [data[0], ...prev])
      setMetaForm({
        titulo: "",
        valor_alvo: "",
        data_limite: "",
      })
      setShowAddMeta(false)

      toast({
        title: "Sucesso",
        description: "Meta adicionada com sucesso",
      })
    } catch (error) {
      console.error("Erro ao adicionar meta:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar meta",
        variant: "destructive",
      })
    }
  }

  const handleAddOrcamento = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const currentMonth = format(new Date(), "yyyy-MM")
      const { data, error } = await supabase
        .from("orcamentos")
        .insert([
          {
            categoria: orcamentoForm.categoria,
            limite: Number.parseFloat(orcamentoForm.limite),
            gasto_atual: 0,
            mes_ano: currentMonth,
          },
        ])
        .select()

      if (error) throw error

      setOrcamentos((prev) => [data[0], ...prev])
      setOrcamentoForm({
        categoria: "Alimentação", // Updated default value
        limite: "",
      })
      setShowAddOrcamento(false)

      toast({
        title: "Sucesso",
        description: "Orçamento adicionado com sucesso",
      })

      await updateOrcamentos()
    } catch (error) {
      console.error("Erro ao adicionar orçamento:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar orçamento",
        variant: "destructive",
      })
    }
  }

  const updateOrcamentos = async () => {
    try {
      const currentMonth = format(new Date(), "yyyy-MM")

      for (const orcamento of orcamentos) {
        const gastoAtual = transactions
          .filter((t) => t.tipo === "despesa" && t.categoria === orcamento.categoria && t.data.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.valor, 0)

        await supabase.from("orcamentos").update({ gasto_atual: gastoAtual }).eq("id", orcamento.id)
      }

      // Reload orçamentos
      const { data: orcamentosData } = await supabase.from("orcamentos").select("*").eq("mes_ano", currentMonth)

      if (orcamentosData) {
        setOrcamentos(orcamentosData)
      }
    } catch (error) {
      console.error("Erro ao atualizar orçamentos:", error)
    }
  }

  const startEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      tipo: transaction.tipo,
      valor: transaction.valor.toString(),
      categoria: transaction.categoria,
      descricao: transaction.descricao,
      data: transaction.data,
    })
  }

  const cancelEdit = () => {
    setEditingTransaction(null)
    setFormData({
      tipo: "despesa",
      valor: "",
      categoria: "Alimentação", // Updated default value
      descricao: "",
      data: format(new Date(), "yyyy-MM-dd"),
    })
  }

  const exportToCSV = () => {
    const filteredTransactions = getFilteredTransactions()
    const csvContent = [
      ["Data", "Tipo", "Categoria", "Descrição", "Valor"],
      ...filteredTransactions.map((t) => [
        format(parseISO(t.data), "dd/MM/yyyy"),
        t.tipo,
        t.categoria,
        t.descricao,
        t.valor.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transacoes_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      const matchesCategoria = !filtroCategoria || transaction.categoria === filtroCategoria
      const matchesTipo = !filtroTipo || transaction.tipo === filtroTipo
      const matchesMes = !filtroMes || transaction.data.startsWith(filtroMes)
      const matchesBusca =
        !busca ||
        transaction.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        transaction.categoria.toLowerCase().includes(busca.toLowerCase())

      return matchesCategoria && matchesTipo && matchesMes && matchesBusca
    })
  }

  // Calculations
  const totalReceitas = transactions.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0)

  const totalDespesas = transactions.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0)

  const saldoAtual = totalReceitas - totalDespesas

  const receitasMes = transactions
    .filter((t) => t.tipo === "receita" && t.data.startsWith(format(new Date(), "yyyy-MM")))
    .reduce((sum, t) => sum + t.valor, 0)

  const despesasMes = transactions
    .filter((t) => t.tipo === "despesa" && t.data.startsWith(format(new Date(), "yyyy-MM")))
    .reduce((sum, t) => sum + t.valor, 0)

  const gastosPorCategoria = categorias
    .map((categoria) => ({
      categoria,
      valor: transactions
        .filter((t) => t.tipo === "despesa" && t.categoria === categoria)
        .reduce((sum, t) => sum + t.valor, 0),
    }))
    .filter((item) => item.valor > 0)

  const filteredTransactions = getFilteredTransactions()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto p-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoAtual >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {saldoAtual.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {receitasMes.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {despesasMes.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transações</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Orçamento */}
        {orcamentos.some((o) => o.gasto_atual > o.limite * 0.8) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Atenção! Alguns orçamentos estão próximos do limite ou foram ultrapassados.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="transacoes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="transacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Transações</CardTitle>
                    <CardDescription>Gerencie suas receitas e despesas</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Transação
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                          <DialogDescription>
                            {editingTransaction
                              ? "Edite os dados da transação"
                              : "Adicione uma nova receita ou despesa"}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="tipo">Tipo</Label>
                              <Select
                                value={formData.tipo}
                                onValueChange={(value: "receita" | "despesa") =>
                                  setFormData((prev) => ({ ...prev, tipo: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="receita">Receita</SelectItem>
                                  <SelectItem value="despesa">Despesa</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="valor">Valor</Label>
                              <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor}
                                onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria</Label>
                            <Select
                              value={formData.categoria}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {categorias.map((categoria) => (
                                  <SelectItem key={categoria} value={categoria}>
                                    {categoria}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input
                              id="descricao"
                              value={formData.descricao}
                              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                              id="data"
                              type="date"
                              value={formData.data}
                              onChange={(e) => setFormData((prev) => ({ ...prev, data: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                              {editingTransaction ? "Salvar Alterações" : "Adicionar"}
                            </Button>
                            {editingTransaction && (
                              <Button type="button" variant="outline" onClick={cancelEdit}>
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar transações..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="month"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="w-[160px]"
                  />
                </div>

                {/* Lista de Transações */}
                <div className="space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${transaction.tipo === "receita" ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <div>
                            <div className="font-medium">{transaction.descricao}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.categoria} •{" "}
                              {format(parseISO(transaction.data), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div
                            className={`font-bold ${transaction.tipo === "receita" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.tipo === "receita" ? "+" : "-"}R$ {transaction.valor.toFixed(2)}
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => startEdit(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Metas Financeiras</CardTitle>
                    <CardDescription>Defina e acompanhe seus objetivos</CardDescription>
                  </div>
                  <Dialog open={showAddMeta} onOpenChange={setShowAddMeta}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Meta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Meta</DialogTitle>
                        <DialogDescription>Defina uma nova meta financeira</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddMeta} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="titulo">Título</Label>
                          <Input
                            id="titulo"
                            value={metaForm.titulo}
                            onChange={(e) => setMetaForm((prev) => ({ ...prev, titulo: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="valor_alvo">Valor Alvo</Label>
                          <Input
                            id="valor_alvo"
                            type="number"
                            step="0.01"
                            value={metaForm.valor_alvo}
                            onChange={(e) => setMetaForm((prev) => ({ ...prev, valor_alvo: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="data_limite">Data Limite</Label>
                          <Input
                            id="data_limite"
                            type="date"
                            value={metaForm.data_limite}
                            onChange={(e) => setMetaForm((prev) => ({ ...prev, data_limite: e.target.value }))}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Criar Meta
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhuma meta definida</div>
                  ) : (
                    metas.map((meta) => {
                      const progresso = (meta.valor_atual / meta.valor_alvo) * 100
                      const isVencida = new Date(meta.data_limite) < new Date()

                      return (
                        <Card key={meta.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold">{meta.titulo}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Prazo: {format(parseISO(meta.data_limite), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                              </div>
                              <Badge variant={isVencida ? "destructive" : progresso >= 100 ? "default" : "secondary"}>
                                {isVencida ? "Vencida" : progresso >= 100 ? "Concluída" : "Em andamento"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>R$ {meta.valor_atual.toFixed(2)}</span>
                                <span>R$ {meta.valor_alvo.toFixed(2)}</span>
                              </div>
                              <Progress value={Math.min(progresso, 100)} />
                              <div className="text-center text-sm text-muted-foreground">
                                {progresso.toFixed(1)}% concluído
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orcamentos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Orçamentos</CardTitle>
                    <CardDescription>Controle seus gastos por categoria</CardDescription>
                  </div>
                  <Dialog open={showAddOrcamento} onOpenChange={setShowAddOrcamento}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Orçamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Orçamento</DialogTitle>
                        <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddOrcamento} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoria">Categoria</Label>
                          <Select
                            value={orcamentoForm.categoria}
                            onValueChange={(value) => setOrcamentoForm((prev) => ({ ...prev, categoria: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map((categoria) => (
                                <SelectItem key={categoria} value={categoria}>
                                  {categoria}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="limite">Limite Mensal</Label>
                          <Input
                            id="limite"
                            type="number"
                            step="0.01"
                            value={orcamentoForm.limite}
                            onChange={(e) => setOrcamentoForm((prev) => ({ ...prev, limite: e.target.value }))}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Criar Orçamento
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orcamentos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum orçamento definido</div>
                  ) : (
                    orcamentos.map((orcamento) => {
                      const percentual = (orcamento.gasto_atual / orcamento.limite) * 100
                      const isExcedido = percentual > 100
                      const isProximo = percentual > 80

                      return (
                        <Card key={orcamento.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold">{orcamento.categoria}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(), "MMMM yyyy", { locale: ptBR })}
                                </p>
                              </div>
                              <Badge variant={isExcedido ? "destructive" : isProximo ? "secondary" : "default"}>
                                {isExcedido ? "Excedido" : isProximo ? "Atenção" : "Normal"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>R$ {orcamento.gasto_atual.toFixed(2)}</span>
                                <span>R$ {orcamento.limite.toFixed(2)}</span>
                              </div>
                              <Progress
                                value={Math.min(percentual, 100)}
                                className={isExcedido ? "bg-red-100" : isProximo ? "bg-yellow-100" : ""}
                              />
                              <div className="text-center text-sm text-muted-foreground">
                                {percentual.toFixed(1)}% utilizado
                              </div>
                              {isExcedido && (
                                <div className="text-center text-sm text-red-600">
                                  Excesso: R$ {(orcamento.gasto_atual - orcamento.limite).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoria</CardTitle>
                  <CardDescription>Distribuição das suas despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gastosPorCategoria.map((item) => {
                      const percentual = (item.valor / totalDespesas) * 100
                      return (
                        <div key={item.categoria}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.categoria}</span>
                            <span>
                              R$ {item.valor.toFixed(2)} ({percentual.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentual} />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Mensal</CardTitle>
                  <CardDescription>Balanço do mês atual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Receitas</span>
                      <span className="font-bold text-green-600">R$ {receitasMes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Despesas</span>
                      <span className="font-bold text-red-600">R$ {despesasMes.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Saldo do Mês</span>
                        <span
                          className={`font-bold ${(receitasMes - despesasMes) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          R$ {(receitasMes - despesasMes).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  )
}
