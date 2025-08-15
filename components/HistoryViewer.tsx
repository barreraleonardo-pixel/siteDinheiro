"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Search, Filter, Calendar, Download } from "lucide-react"
import type { Transaction } from "@/lib/types"

export default function HistoryViewer() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    if (user && supabase) {
      loadTransactions()
    }
  }, [user, supabase])

  const loadTransactions = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("usuario_id", user?.id)
        .order("data_transacao", { ascending: false })

      if (error) throw error

      // Convert data to match Transaction interface
      const convertedData: Transaction[] = (data || []).map((item) => ({
        id: item.id,
        user_id: item.usuario_id,
        type: item.tipo === "receita" ? "income" : "expense",
        category: item.categoria,
        description: item.descricao,
        amount: Number(item.valor),
        date: item.data_transacao,
        created_at: item.created_at,
      }))

      setTransactions(convertedData)
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || t.type === filterType
    const matchesCategory = filterCategory === "all" || t.category === filterCategory

    let matchesDateRange = true
    if (dateFrom) {
      matchesDateRange = matchesDateRange && new Date(t.date) >= new Date(dateFrom)
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && new Date(t.date) <= new Date(dateTo)
    }

    return matchesSearch && matchesType && matchesCategory && matchesDateRange
  })

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          format(new Date(t.date), "dd/MM/yyyy"),
          `"${t.description}"`,
          `"${t.category}"`,
          t.type === "income" ? "Receita" : "Despesa",
          t.amount.toFixed(2).replace(".", ","),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `historico_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <Calendar className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>Visualize e filtre todas as suas transações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
              <Select value={filterType} onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-from">Data Inicial</Label>
              <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="date-to">Data Final</Label>
              <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button onClick={exportToCSV} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{filteredTransactions.length} transações encontradas</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterType("all")
                  setFilterCategory("all")
                  setDateFrom("")
                  setDateTo("")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma transação encontrada com os filtros aplicados
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.category} • {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}R${" "}
                        {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                        {transaction.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
