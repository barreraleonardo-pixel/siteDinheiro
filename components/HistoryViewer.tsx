"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, TrendingUp, TrendingDown, Filter, Download } from "lucide-react"
import { useUser } from "@/lib/contexts/UserContext"
import { historicoService } from "@/lib/services/historico"
import type { Transaction, UserStats } from "@/lib/types"
import { format } from "date-fns"

export default function HistoryViewer() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterType, setFilterType] = useState<"all" | "receita" | "despesa">("all")
  const [filterCategory, setFilterCategory] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [transactionsData, statsData] = await Promise.all([
        historicoService.getTransactions(user.id),
        historicoService.getUserStats(user.id),
      ])

      setTransactions(transactionsData)
      setStats(statsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    if (!user) return

    try {
      setLoading(true)
      let filteredTransactions: Transaction[]

      if (startDate && endDate) {
        filteredTransactions = await historicoService.getTransactionsByPeriod(user.id, startDate, endDate)
      } else if (filterCategory) {
        filteredTransactions = await historicoService.getTransactionsByCategory(user.id, filterCategory)
      } else {
        filteredTransactions = await historicoService.getTransactions(user.id)
      }

      if (filterType !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.type === filterType)
      }

      setTransactions(filteredTransactions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilterType("all")
    setFilterCategory("")
    setStartDate("")
    setEndDate("")
    fetchData()
  }

  const exportData = () => {
    const csvContent = [
      ["Data", "Tipo", "Categoria", "Descrição", "Valor"].join(","),
      ...transactions.map((t) =>
        [format(new Date(t.date), "dd/MM/yyyy"), t.type, t.category, t.description, t.amount.toString()].join(","),
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const categories = Array.from(new Set(transactions.map((t) => t.category)))

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receitas Totais</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_income)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_expenses)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                  <p className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(stats.balance)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.transaction_count}</p>
                </div>
                <Filter className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre suas transações por tipo, categoria ou período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
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
              <Label>Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <Label>Data Final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Aplicar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>{transactions.length} transação(ões) encontrada(s)</CardDescription>
            </div>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.type === "receita" ? "bg-green-100" : "bg-red-100"}`}>
                    {transaction.type === "receita" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Badge variant="outline">{transaction.category}</Badge>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(transaction.date), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-lg font-semibold ${
                    transaction.type === "receita" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.type === "receita" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Ajuste os filtros ou adicione novas transações</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
