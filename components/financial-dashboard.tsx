"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Search,
  Edit,
  Trash2,
  BarChart3,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Transaction {
  id: string
  tipo: "receita" | "despesa"
  categoria: string
  descricao: string
  valor: number
  data_transacao: string
  created_at: string
}

interface Stats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesCount: number
}

const categorias = {
  receita: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
  despesa: ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Outros"],
}

export default function FinancialDashboard() {
  const { user, signOut } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    transacoesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Form states
  const [formData, setFormData] = useState({
    tipo: "despesa" as "receita" | "despesa",
    categoria: "",
    descricao: "",
    valor: "",
    data_transacao: format(new Date(), "yyyy-MM-dd"),
  })

  useEffect(() => {
    if (user && supabase) {
      loadTransactions()
    }
  }, [user, supabase])

  const loadTransactions = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("usuario_id", user?.id)
        .order("data_transacao", { ascending: false })

      if (error) throw error

      setTransactions(data || [])
      calculateStats(data || [])
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (transactions: Transaction[]) => {
    const receitas = transactions.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + Number(t.valor), 0)

    const despesas = transactions.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + Number(t.valor), 0)

    setStats({
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: receitas - despesas,
      transacoesCount: transactions.length,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    try {
      const transactionData = {
        usuario_id: user?.id,
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: Number.parseFloat(formData.valor),
        data_transacao: formData.data_transacao,
      }

      let error
      if (editingTransaction) {
        const { error: updateError } = await supabase
          .from("transacoes")
          .update(transactionData)
          .eq("id", editingTransaction.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("transacoes").insert([transactionData])
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Sucesso",
        description: editingTransaction ? "Transação atualizada!" : "Transação adicionada!",
      })

      setDialogOpen(false)
      setEditingTransaction(null)
      setFormData({
        tipo: "despesa",
        categoria: "",
        descricao: "",
        valor: "",
        data_transacao: format(new Date(), "yyyy-MM-dd"),
      })
      loadTransactions()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      tipo: transaction.tipo,
      categoria: transaction.categoria,
      descricao: transaction.descricao,
      valor: transaction.valor.toString(),
      data_transacao: transaction.data_transacao,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return

    try {
      const { error } = await supabase.from("transacoes").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Transação excluída!",
      })
      loadTransactions()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.tipo === filterType
    const matchesCategory = filterCategory === "all" || transaction.categoria === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Descrição", "Valor"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          format(new Date(t.data_transacao), "dd/MM/yyyy"),
          t.tipo,
          t.categoria,
          `"${t.descricao}"`,
          t.valor.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transacoes-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Sistema Financeiro</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, {user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {stats.totalReceitas.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {stats.totalDespesas.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {stats.saldo.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.transacoesCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTransaction(null)
                  setFormData({
                    tipo: "despesa",
                    categoria: "",
                    descricao: "",
                    valor: "",
                    data_transacao: format(new Date(), "yyyy-MM-dd"),
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                <DialogDescription>
                  {editingTransaction ? "Edite os dados da transação" : "Adicione uma nova receita ou despesa"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: "receita" | "despesa") =>
                        setFormData((prev) => ({ ...prev, tipo: value, categoria: "" }))
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
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias[formData.tipo].map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data_transacao}
                      onChange={(e) => setFormData((prev) => ({ ...prev, data_transacao: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingTransaction ? "Atualizar" : "Adicionar"} Transação
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filter-type">Tipo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-category">Categoria</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {[...categorias.receita, ...categorias.despesa].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                    setFilterCategory("all")
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transações ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <Alert>
                <AlertDescription>Nenhuma transação encontrada. Adicione sua primeira transação!</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          transaction.tipo === "receita" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{transaction.descricao}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.categoria} •{" "}
                          {format(new Date(transaction.data_transacao), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`font-bold ${transaction.tipo === "receita" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.tipo === "receita" ? "+" : "-"}R$ {transaction.valor.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(transaction)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
