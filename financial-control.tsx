"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  Search,
  Filter,
  AlertTriangle,
  X,
  Check,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import type { Transaction as TransactionType, MonthlyStats, CategoryStats } from "@/lib/types"
import Header from "@/components/Header"
import HistoryViewer from "@/components/HistoryViewer"
import UsersManagement from "@/components/UsersManagement"
import InteracoesPanel from "@/components/InteracoesPanel"

interface Cartao {
  id: string
  nome: string
  diaFechamento: number
  diaPagamento: number
  limite: number
}

interface ParcelaDespesa {
  id: string
  despesaId: string
  numeroParcela: number
  valorParcela: number
  mesVencimento: number
  anoVencimento: number
  dataVencimento: Date
  pago: boolean
  dataPagamento?: Date
}

interface Despesa {
  id: string
  nome: string
  valorTotal: number
  centroCusto: string
  categoria: string
  dataCompra: Date
  parcelas: number
  cartaoId: string
  observacoes?: string
  essencial?: boolean
  parcelasDespesa: ParcelaDespesa[]
}

interface Receita {
  id: string
  nome: string
  valor: number
  dataEntrada: Date
  centroCusto: string
  categoria: string
  recebido: boolean
  dataRecebimento?: Date
}

interface CategoriaPlano {
  id: string
  nome: string
  tipo: "receita" | "despesa"
  centroCusto: string
  valorAnual: number
  distribuicaoMensal: number[]
  ano: number
}

const centrosCusto = [
  "_1.1 Aluguel/Condomínio",
  "_1.2 Financiamento Imóvel",
  "_2.1 Supermercado",
  "_2.2 Restaurantes",
  "_2.3 Farmácia",
  "_3.1 Combustível",
  "_3.2 Transporte Público",
  "_4.1 Energia Elétrica",
  "_4.2 Água/Esgoto",
  "_4.3 Internet/Telefone",
  "_5.1 Roupas",
  "_5.2 Eletrônicos",
  "_6.1 Lazer/Entretenimento",
  "_6.2 Viagens",
]

const categoriasDespesas = ["Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Casa", "Roupas", "Outros"]

const categoriasReceitas = ["Salário", "Freelance", "Investimentos", "Reembolso", "Vendas", "Outros"]

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const mesesAbrev = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const coresCategorias = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
]

const cartoesIniciais: Cartao[] = [
  { id: "1", nome: "Nubank", diaFechamento: 15, diaPagamento: 25, limite: 3000 },
  { id: "2", nome: "Itaú Gold", diaFechamento: 10, diaPagamento: 20, limite: 5000 },
  { id: "3", nome: "Bradesco", diaFechamento: 5, diaPagamento: 15, limite: 2000 },
]

// Função para gerar parcelas de uma despesa
const gerarParcelasDespesa = (despesa: Omit<Despesa, "parcelasDespesa">): ParcelaDespesa[] => {
  const parcelas: ParcelaDespesa[] = []
  const valorParcela = despesa.valorTotal / despesa.parcelas

  for (let i = 0; i < despesa.parcelas; i++) {
    const mesVencimento = (despesa.dataCompra.getMonth() + i) % 12
    const anoVencimento = despesa.dataCompra.getFullYear() + Math.floor((despesa.dataCompra.getMonth() + i) / 12)
    const dataVencimento = new Date(anoVencimento, mesVencimento, despesa.dataCompra.getDate())

    parcelas.push({
      id: `${despesa.id}-parcela-${i + 1}`,
      despesaId: despesa.id,
      numeroParcela: i + 1,
      valorParcela: Math.round(valorParcela * 100) / 100,
      mesVencimento,
      anoVencimento,
      dataVencimento,
      pago: false,
    })
  }

  return parcelas
}

const despesasIniciais: Despesa[] = [
  {
    id: "1",
    nome: "Supermercado Extra",
    valorTotal: 450,
    centroCusto: "_2.1 Supermercado",
    categoria: "Alimentação",
    dataCompra: new Date(2025, 0, 15),
    parcelas: 1,
    cartaoId: "1",
    observacoes: "Compras do mês",
    parcelasDespesa: [],
  },
  {
    id: "2",
    nome: "Notebook Dell",
    valorTotal: 2400,
    centroCusto: "_5.2 Eletrônicos",
    categoria: "Outros",
    dataCompra: new Date(2025, 0, 10),
    parcelas: 6,
    cartaoId: "2",
    observacoes: "Para trabalho",
    parcelasDespesa: [],
  },
  {
    id: "3",
    nome: "Restaurante",
    valorTotal: 120,
    centroCusto: "_2.2 Restaurantes",
    categoria: "Alimentação",
    dataCompra: new Date(2025, 0, 20),
    parcelas: 1,
    cartaoId: "1",
    parcelasDespesa: [],
  },
  {
    id: "4",
    nome: "Combustível",
    valorTotal: 200,
    centroCusto: "_3.1 Combustível",
    categoria: "Transporte",
    dataCompra: new Date(2025, 0, 18),
    parcelas: 1,
    cartaoId: "3",
    parcelasDespesa: [],
  },
].map((despesa) => ({
  ...despesa,
  parcelasDespesa: gerarParcelasDespesa(despesa),
}))

const receitasIniciais: Receita[] = [
  {
    id: "1",
    nome: "Salário Janeiro",
    valor: 5000,
    dataEntrada: new Date(2025, 0, 5),
    centroCusto: "_1.1 Aluguel/Condomínio",
    categoria: "Salário",
    recebido: true,
    dataRecebimento: new Date(2025, 0, 5),
  },
  {
    id: "2",
    nome: "Freelance Design",
    valor: 800,
    dataEntrada: new Date(2025, 0, 20),
    centroCusto: "_6.1 Lazer/Entretenimento",
    categoria: "Freelance",
    recebido: false,
  },
  {
    id: "3",
    nome: "Investimentos",
    valor: 150,
    dataEntrada: new Date(2025, 0, 25),
    centroCusto: "_6.1 Lazer/Entretenimento",
    categoria: "Investimentos",
    recebido: false,
  },
]

const categoriasPlanoIniciais: CategoriaPlano[] = [
  {
    id: "1",
    nome: "Salário",
    tipo: "receita",
    centroCusto: "_1.1 Aluguel/Condomínio",
    valorAnual: 60000,
    distribuicaoMensal: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
    ano: 2025,
  },
  {
    id: "2",
    nome: "Freelance",
    tipo: "receita",
    centroCusto: "_6.1 Lazer/Entretenimento",
    valorAnual: 12000,
    distribuicaoMensal: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
    ano: 2025,
  },
  {
    id: "3",
    nome: "Alimentação",
    tipo: "despesa",
    centroCusto: "_2.1 Supermercado",
    valorAnual: 9600,
    distribuicaoMensal: [800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800],
    ano: 2025,
  },
  {
    id: "4",
    nome: "Transporte",
    tipo: "despesa",
    centroCusto: "_3.1 Combustível",
    valorAnual: 4800,
    distribuicaoMensal: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400],
    ano: 2025,
  },
]

const categories2 = {
  income: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
  expense: ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Compras", "Contas", "Outros"],
}

export default function FinancialControl() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<TransactionType[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  })
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")

  // Form states
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const [cartoes, setCartoes] = useState<Cartao[]>(cartoesIniciais)
  const [despesas, setDespesas] = useState<Despesa[]>(despesasIniciais)
  const [receitas, setReceitas] = useState<Receita[]>(receitasIniciais)
  const [categoriasPlano, setCategoriasPlano] = useState<CategoriaPlano[]>(categoriasPlanoIniciais)
  //const [activeTab, setActiveTab] = useState("home")
  //const { toast } = useToast()

  // Estados para filtros do dashboard
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025)
  const [mesSelecionadoDash, setMesSelecionadoDash] = useState<string>("todos")

  // Estado para toggle de saldo comprometido
  const [saldoComprometido, setSaldoComprometido] = useState<boolean>(false)

  // Estados para alertas de vencimento
  const [diasAlertaVencimento, setDiasAlertaVencimento] = useState<number>(7)
  const [mostrarAlertas, setMostrarAlertas] = useState<boolean>(true)

  // Estados para modais
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false)
  const [modalReceitaAberto, setModalReceitaAberto] = useState(false)
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false)
  const [modalCategoriaPlanoAberto, setModalCategoriaPlanoAberto] = useState(false)

  // Estados para filtros
  const [filtroCentroCusto, setFiltroCentroCusto] = useState("todos")
  const [filtroMes, setFiltroMes] = useState("todos")
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [busca, setBusca] = useState("")

  // Estados para edição inline no planejamento
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null)
  const [valoresEditando, setValoresEditando] = useState<number[]>([])

  // Estados para formulários
  const [novaDespesa, setNovaDespesa] = useState<Partial<Despesa>>({
    nome: "",
    valorTotal: 0,
    centroCusto: "",
    categoria: "",
    dataCompra: new Date(),
    parcelas: 1,
    cartaoId: "",
    observacoes: "",
    essencial: false,
  })

  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    nome: "",
    valor: 0,
    dataEntrada: new Date(),
    centroCusto: "",
    categoria: "",
    recebido: false,
  })

  const [novoCartao, setNovoCartao] = useState<Partial<Cartao>>({
    nome: "",
    diaFechamento: 1,
    diaPagamento: 10,
    limite: 0,
  })

  const [novaCategoriaPlano, setNovaCategoriaPlano] = useState<Partial<CategoriaPlano>>({
    nome: "",
    tipo: "receita",
    centroCusto: "",
    valorAnual: 0,
    distribuicaoMensal: Array(12).fill(0),
    ano: anoSelecionado,
  })

  const [editandoItem, setEditandoItem] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Estados para gerenciamento de centros de custo
  const [modalCentroCustoAberto, setModalCentroCustoAberto] = useState(false)
  const [novoCentroCusto, setNovoCentroCusto] = useState("")
  const [editandoCentroCusto, setEditandoCentroCusto] = useState<string | null>(null)
  const [centrosCustoPersonalizados, setCentrosCustoPersonalizados] = useState<string[]>([])

  // Combinar centros de custo padrão com personalizados
  const todosCentrosCusto = useMemo(() => {
    return [...centrosCusto, ...centrosCustoPersonalizados]
  }, [centrosCustoPersonalizados])

  // Obter mês atual
  const mesAtual = new Date().getMonth()

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
      const convertedData: TransactionType[] = (data || []).map((item) => ({
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
      calculateStats(convertedData)
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (transactionData: TransactionType[]) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactionData.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const totalIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    setMonthlyStats({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: monthlyTransactions.length,
    })

    // Calculate category stats
    const categoryMap = new Map<string, { amount: number; count: number }>()

    monthlyTransactions.forEach((t) => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 }
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      })
    })

    const stats: CategoryStats[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    setCategoryStats(stats)
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    if (!description || !amount || !category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("transacoes").insert({
        usuario_id: user?.id,
        descricao: description,
        valor: Number.parseFloat(amount),
        tipo: type === "income" ? "receita" : "despesa",
        categoria: category,
        data_transacao: format(date, "yyyy-MM-dd"),
      })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
      })

      // Reset form
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date())
      setIsAddingTransaction(false)

      // Reload data
      loadTransactions()
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação",
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"]
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
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
    link.setAttribute("download", `transacoes_${format(new Date(), "yyyy-MM")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || t.type === filterType
    const matchesCategory = filterCategory === "all" || t.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Função para marcar parcela como paga
  const marcarParcelaPaga = (despesaId: string, parcelaId: string) => {
    setDespesas(
      despesas.map((despesa) => {
        if (despesa.id === despesaId) {
          return {
            ...despesa,
            parcelasDespesa: despesa.parcelasDespesa.map((parcela) => {
              if (parcela.id === parcelaId) {
                return {
                  ...parcela,
                  pago: true,
                  dataPagamento: new Date(),
                }
              }
              return parcela
            }),
          }
        }
        return despesa
      }),
    )

    toast({
      title: "Sucesso",
      description: "Parcela marcada como paga!",
    })
  }

  // Função para marcar receita como recebida
  const marcarReceitaRecebida = (receitaId: string) => {
    setReceitas(
      receitas.map((receita) => {
        if (receita.id === receitaId) {
          return {
            ...receita,
            recebido: true,
            dataRecebimento: new Date(),
          }
        }
        return receita
      }),
    )

    toast({
      title: "Sucesso",
      description: "Receita marcada como recebida!",
    })
  }

  // Calcular dados para dois meses baseado no filtro
  const dadosDoisMeses = useMemo(() => {
    let mesEsquerda: number
    let mesDireita: number

    if (mesSelecionadoDash === "todos") {
      // Se não há filtro, usar mês atual e seguinte
      mesEsquerda = mesAtual
      mesDireita = (mesAtual + 1) % 12
    } else {
      // Se há filtro, usar mês selecionado e seguinte
      const mesIndex = meses.indexOf(mesSelecionadoDash)
      mesEsquerda = mesIndex
      mesDireita = (mesIndex + 1) % 12
    }

    const categoriasAno = categoriasPlano.filter((c) => c.ano === anoSelecionado)

    const calcularMes = (mesIndex: number) => {
      // Receitas Planejadas (do planejamento)
      let receitasPlanejadas = 0
      categoriasAno
        .filter((c) => c.tipo === "receita")
        .forEach((categoria) => {
          receitasPlanejadas += categoria.distribuicaoMensal[mesIndex] || 0
        })

      // Receitas Realizadas (marcadas como recebidas)
      let receitasRealizadas = 0
      receitas
        .filter(
          (r) => r.dataEntrada.getFullYear() === anoSelecionado && r.dataEntrada.getMonth() === mesIndex && r.recebido,
        )
        .forEach((receita) => {
          receitasRealizadas += receita.valor
        })

      // Despesas Planejadas (do planejamento)
      let despesasPlanejadas = 0
      categoriasAno
        .filter((c) => c.tipo === "despesa")
        .forEach((categoria) => {
          despesasPlanejadas += categoria.distribuicaoMensal[mesIndex] || 0
        })

      // Despesas Realizadas (parcelas pagas)
      let despesasRealizadas = 0
      despesas.forEach((despesa) => {
        despesa.parcelasDespesa
          .filter(
            (parcela) => parcela.mesVencimento === mesIndex && parcela.anoVencimento === anoSelecionado && parcela.pago,
          )
          .forEach((parcela) => {
            despesasRealizadas += parcela.valorParcela
          })
      })

      // Despesas Comprometidas (todas as parcelas, pagas ou não)
      let despesasComprometidas = 0
      despesas.forEach((despesa) => {
        despesa.parcelasDespesa
          .filter((parcela) => parcela.mesVencimento === mesIndex && parcela.anoVencimento === anoSelecionado)
          .forEach((parcela) => {
            despesasComprometidas += parcela.valorParcela
          })
      })

      // Cálculo do saldo baseado nas regras:
      // Saldo = Receita Planejada - Despesa Realizada
      const saldo = receitasPlanejadas - despesasRealizadas

      return {
        receitasPlanejadas,
        receitasRealizadas,
        despesasPlanejadas,
        despesasRealizadas,
        despesasComprometidas,
        saldo,
      }
    }

    return {
      mesEsquerda: {
        nome: meses[mesEsquerda],
        dados: calcularMes(mesEsquerda),
      },
      mesDireita: {
        nome: meses[mesDireita],
        dados: calcularMes(mesDireita),
      },
    }
  }, [receitas, despesas, categoriasPlano, anoSelecionado, mesSelecionadoDash, mesAtual])

  // Dados para resumo mês a mês com saldo acumulado
  const resumoMensalAno = useMemo(() => {
    const categoriasAno = categoriasPlano.filter((c) => c.ano === anoSelecionado)
    let saldoAcumulado = 0

    return meses.map((mes, index) => {
      // Receitas Planejadas (do planejamento)
      let receitasPlanejadas = 0
      categoriasAno
        .filter((c) => c.tipo === "receita")
        .forEach((categoria) => {
          receitasPlanejadas += categoria.distribuicaoMensal[index] || 0
        })

      // Receitas Realizadas (marcadas como recebidas)
      let receitasRealizadas = 0
      receitas
        .filter(
          (r) => r.dataEntrada.getFullYear() === anoSelecionado && r.dataEntrada.getMonth() === index && r.recebido,
        )
        .forEach((receita) => {
          receitasRealizadas += receita.valor
        })

      // Despesas Planejadas (do planejamento)
      let despesasPlanejadas = 0
      categoriasAno
        .filter((c) => c.tipo === "despesa")
        .forEach((categoria) => {
          despesasPlanejadas += categoria.distribuicaoMensal[index] || 0
        })

      // Despesas Realizadas (parcelas pagas)
      let despesasRealizadas = 0
      despesas.forEach((despesa) => {
        despesa.parcelasDespesa
          .filter(
            (parcela) => parcela.mesVencimento === index && parcela.anoVencimento === anoSelecionado && parcela.pago,
          )
          .forEach((parcela) => {
            despesasRealizadas += parcela.valorParcela
          })
      })

      // Despesas Comprometidas (todas as parcelas, pagas ou não)
      let despesasComprometidas = 0
      despesas.forEach((despesa) => {
        despesa.parcelasDespesa
          .filter((parcela) => parcela.mesVencimento === index && parcela.anoVencimento === anoSelecionado)
          .forEach((parcela) => {
            despesasComprometidas += parcela.valorParcela
          })
      })

      // Cálculo do saldo baseado nas regras e toggle
      let saldo: number
      const isFuturo = index > mesAtual
      const temValorRealizado = despesasRealizadas > 0

      if (saldoComprometido && isFuturo && !temValorRealizado) {
        // Para meses futuros sem valores realizados: Receita Planejada - Despesa Comprometida
        saldo = receitasPlanejadas - despesasComprometidas
      } else {
        // Para meses com valores realizados: Receita Planejada - Despesa Realizada
        saldo = receitasPlanejadas - despesasRealizadas
      }

      // Atualizar saldo acumulado
      saldoAcumulado += saldo

      return {
        mes,
        receitasPlanejadas,
        receitasRealizadas,
        despesasPlanejadas,
        despesasRealizadas,
        despesasComprometidas,
        saldo,
        saldoAcumulado,
        isFuturo,
        temValorRealizado,
      }
    })
  }, [receitas, despesas, categoriasPlano, anoSelecionado, mesAtual, saldoComprometido])

  // Cálculos para o dashboard
  const calcularTotaisDashboard = useMemo(() => {
    const dadosFiltrados = {
      receitas: receitas.filter((r) => r.dataEntrada.getFullYear() === anoSelecionado),
      despesas: despesas.filter((d) => d.dataCompra.getFullYear() === anoSelecionado),
      categoriasPlano: categoriasPlano.filter((c) => c.ano === anoSelecionado),
    }

    const totais = {
      receitasPlanejadas: 0,
      receitasRealizadas: 0,
      despesasPlanejadas: 0,
      despesasRealizadas: 0,
      despesasComprometidas: 0,
      // Novos campos para o mês atual
      receitasPlanejadasMesAtual: 0,
      receitasRealizadasMesAtual: 0,
      despesasPlanejadasMesAtual: 0,
      despesasRealizadasMesAtual: 0,
    }

    const mesesParaCalcular =
      mesSelecionadoDash === "todos" ? Array.from({ length: 12 }, (_, i) => i) : [meses.indexOf(mesSelecionadoDash)]

    // Calcular planejados do planejamento
    dadosFiltrados.categoriasPlano.forEach((categoria) => {
      mesesParaCalcular.forEach((mesIndex) => {
        const valorMes = categoria.distribuicaoMensal[mesIndex] || 0
        if (categoria.tipo === "receita") {
          totais.receitasPlanejadas += valorMes
          if (mesIndex === mesAtual) {
            totais.receitasPlanejadasMesAtual += valorMes
          }
        } else {
          totais.despesasPlanejadas += valorMes
          if (mesIndex === mesAtual) {
            totais.despesasPlanejadasMesAtual += valorMes
          }
        }
      })
    })

    // Receitas realizadas (apenas as marcadas como recebidas)
    dadosFiltrados.receitas
      .filter((r) => r.recebido)
      .forEach((receita) => {
        const mesReceita = receita.dataEntrada.getMonth()
        if (mesesParaCalcular.includes(mesReceita)) {
          totais.receitasRealizadas += receita.valor
          if (mesReceita === mesAtual) {
            totais.receitasRealizadasMesAtual += receita.valor
          }
        }
      })

    // Despesas realizadas e comprometidas (por parcelas)
    dadosFiltrados.despesas.forEach((despesa) => {
      despesa.parcelasDespesa.forEach((parcela) => {
        if (mesesParaCalcular.includes(parcela.mesVencimento)) {
          // Todas as parcelas são comprometidas
          totais.despesasComprometidas += parcela.valorParcela

          // Apenas parcelas pagas são realizadas
          if (parcela.pago) {
            totais.despesasRealizadas += parcela.valorParcela
            if (parcela.mesVencimento === mesAtual) {
              totais.despesasRealizadasMesAtual += parcela.valorParcela
            }
          }
        }
      })
    })

    return totais
  }, [receitas, despesas, categoriasPlano, anoSelecionado, mesSelecionadoDash, mesAtual])

  // Dados para gráfico de barras com previsto vs realizado
  const dadosGraficoBarras = useMemo(() => {
    const categoriasAno = categoriasPlano.filter((c) => c.ano === anoSelecionado)

    return mesesAbrev.map((mes, index) => {
      // Receitas Planejadas (do planejamento)
      const receitaPlanejada = categoriasAno
        .filter((c) => c.tipo === "receita")
        .reduce((acc, c) => acc + (c.distribuicaoMensal[index] || 0), 0)

      // Despesas Planejadas (do planejamento)
      const despesaPlanejada = categoriasAno
        .filter((c) => c.tipo === "despesa")
        .reduce((acc, c) => acc + (c.distribuicaoMensal[index] || 0), 0)

      // Receitas Realizadas (marcadas como recebidas)
      const receitaRealizada = receitas
        .filter(
          (r) => r.dataEntrada.getFullYear() === anoSelecionado && r.dataEntrada.getMonth() === index && r.recebido,
        )
        .reduce((acc, r) => acc + r.valor, 0)

      // Despesas Realizadas (parcelas pagas)
      let despesaRealizada = 0
      despesas.forEach((despesa) => {
        despesa.parcelasDespesa
          .filter(
            (parcela) => parcela.mesVencimento === index && parcela.anoVencimento === anoSelecionado && parcela.pago,
          )
          .forEach((parcela) => {
            despesaRealizada += parcela.valorParcela
          })
      })

      return {
        mes,
        "Receita Planejada": receitaPlanejada,
        "Receita Realizada": receitaRealizada,
        "Despesa Planejada": despesaPlanejada,
        "Despesa Realizada": despesaRealizada,
      }
    })
  }, [receitas, despesas, categoriasPlano, anoSelecionado])

  // Dados para gráfico de pizza
  const dadosGraficoPizza = useMemo(() => {
    const categorias = new Map<string, number>()

    despesas.forEach((despesa) => {
      despesa.parcelasDespesa.forEach((parcela) => {
        const anoMatch = parcela.anoVencimento === anoSelecionado
        const mesMatch = mesSelecionadoDash === "todos" || parcela.mesVencimento === meses.indexOf(mesSelecionadoDash)

        if (anoMatch && mesMatch && parcela.pago) {
          const categoria = despesa.categoria
          categorias.set(categoria, (categorias.get(categoria) || 0) + parcela.valorParcela)
        }
      })
    })

    return Array.from(categorias.entries()).map(([nome, valor], index) => ({
      name: nome,
      value: valor,
      color: coresCategorias[index % coresCategorias.length],
    }))
  }, [despesas, anoSelecionado, mesSelecionadoDash])

  // Progresso por categoria separado por tipo
  const progressoCategorias = useMemo(() => {
    const categoriasAno = categoriasPlano.filter((c) => c.ano === anoSelecionado)
    const receitasProgresso: any[] = []
    const despesasProgresso: any[] = []

    categoriasAno.forEach((categoria) => {
      // Calcular planejado e realizado
      const planejadoMes = categoria.distribuicaoMensal[mesAtual] || 0
      const planejadoAno = categoria.distribuicaoMensal.reduce((acc, val) => acc + val, 0)

      let realizadoMes = 0
      let realizadoAno = 0

      if (categoria.tipo === "receita") {
        const receitasCategoria = receitas.filter((r) => r.categoria === categoria.nome && r.recebido)
        realizadoMes = receitasCategoria
          .filter((r) => r.dataEntrada.getMonth() === mesAtual)
          .reduce((acc, r) => acc + r.valor, 0)
        realizadoAno = receitasCategoria.reduce((acc, r) => acc + r.valor, 0)
      } else {
        // Para despesas, considerar apenas parcelas pagas
        despesas.forEach((despesa) => {
          if (despesa.categoria === categoria.nome) {
            despesa.parcelasDespesa
              .filter((parcela) => parcela.pago)
              .forEach((parcela) => {
                realizadoAno += parcela.valorParcela
                if (parcela.mesVencimento === mesAtual) {
                  realizadoMes += parcela.valorParcela
                }
              })
          }
        })
      }

      const progressoMes = planejadoMes > 0 ? (realizadoMes / planejadoMes) * 100 : 0
      const progressoAno = planejadoAno > 0 ? (realizadoAno / planejadoAno) * 100 : 0

      const item = {
        nome: categoria.nome,
        planejadoMes,
        realizadoMes,
        planejadoAno,
        realizadoAno,
        progressoMes,
        progressoAno,
      }

      if (categoria.tipo === "receita") {
        receitasProgresso.push(item)
      } else {
        despesasProgresso.push(item)
      }
    })

    return { receitas: receitasProgresso, despesas: despesasProgresso }
  }, [categoriasPlano, receitas, despesas, anoSelecionado, mesAtual])

  // Calcular parcelas próximas do vencimento
  const parcelasProximasVencimento = useMemo(() => {
    const hoje = new Date()
    const dataLimite = new Date()
    dataLimite.setDate(hoje.getDate() + diasAlertaVencimento)

    const parcelas: Array<{
      id: string
      despesaNome: string
      numeroParcela: number
      totalParcelas: number
      valorParcela: number
      dataVencimento: Date
      diasRestantes: number
      cartaoNome: string
      categoria: string
      urgencia: "critica" | "alta" | "media"
    }> = []

    despesas.forEach((despesa) => {
      const cartao = cartoes.find((c) => c.id === despesa.cartaoId)

      despesa.parcelasDespesa
        .filter((parcela) => !parcela.pago && parcela.dataVencimento <= dataLimite)
        .forEach((parcela) => {
          const diasRestantes = Math.ceil((parcela.dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

          let urgencia: "critica" | "alta" | "media" = "media"
          if (diasRestantes <= 3) urgencia = "critica"
          else if (diasRestantes <= 7) urgencia = "alta"

          parcelas.push({
            id: parcela.id,
            despesaNome: despesa.nome,
            numeroParcela: parcela.numeroParcela,
            totalParcelas: despesa.parcelas,
            valorParcela: parcela.valorParcela,
            dataVencimento: parcela.dataVencimento,
            diasRestantes,
            cartaoNome: cartao?.nome || "N/A",
            categoria: despesa.categoria,
            urgencia,
          })
        })
    })

    return parcelas.sort((a, b) => a.diasRestantes - b.diasRestantes)
  }, [despesas, cartoes, diasAlertaVencimento])

  // Calcular impacto financeiro dos alertas
  const impactoFinanceiroAlertas = useMemo(() => {
    const valorTotal = parcelasProximasVencimento.reduce((acc, parcela) => acc + parcela.valorParcela, 0)
    const parcelasCriticas = parcelasProximasVencimento.filter((p) => p.urgencia === "critica")
    const valorCritico = parcelasCriticas.reduce((acc, parcela) => acc + parcela.valorParcela, 0)

    return {
      valorTotal,
      valorCritico,
      quantidadeTotal: parcelasProximasVencimento.length,
      quantidadeCritica: parcelasCriticas.length,
    }
  }, [parcelasProximasVencimento])

  // Função para calcular uso do cartão no mês atual
  const calcularUsoCartao = (cartaoId: string) => {
    const mesAtual = new Date().getMonth()
    const anoAtual = new Date().getFullYear()

    let total = 0
    despesas
      .filter((despesa) => despesa.cartaoId === cartaoId)
      .forEach((despesa) => {
        despesa.parcelasDespesa
          .filter((parcela) => parcela.mesVencimento === mesAtual && parcela.anoVencimento === anoAtual && parcela.pago)
          .forEach((parcela) => {
            total += parcela.valorParcela
          })
      })

    return total
  }

  // Filtrar despesas
  const despesasFiltradas = useMemo(() => {
    return despesas.filter((despesa) => {
      const matchCentroCusto = filtroCentroCusto === "todos" || despesa.centroCusto === filtroCentroCusto
      const matchMes = filtroMes === "todos" || despesa.dataCompra.getMonth() === Number.parseInt(filtroMes)
      const matchCategoria = filtroCategoria === "todos" || despesa.categoria === filtroCategoria
      const matchBusca = busca === "" || despesa.nome.toLowerCase().includes(busca.toLowerCase())

      return matchCentroCusto && matchMes && matchCategoria && matchBusca
    })
  }, [despesas, filtroCentroCusto, filtroMes, filtroCategoria, busca])

  // Filtrar receitas
  const receitasFiltradas = useMemo(() => {
    return receitas.filter((receita) => {
      const matchCentroCusto = filtroCentroCusto === "todos" || receita.centroCusto === filtroCentroCusto
      const matchMes = filtroMes === "todos" || receita.dataEntrada.getMonth() === Number.parseInt(filtroMes)
      const matchCategoria = filtroCategoria === "todos" || receita.categoria === filtroCategoria
      const matchBusca = busca === "" || receita.nome.toLowerCase().includes(busca.toLowerCase())

      return matchCentroCusto && matchMes && matchCategoria && matchBusca
    })
  }, [receitas, filtroCentroCusto, filtroMes, filtroCategoria, busca])

  // Filtrar categorias do plano
  const categoriasPlanoReceitas = useMemo(() => {
    return categoriasPlano.filter((c) => c.tipo === "receita" && c.ano === anoSelecionado)
  }, [categoriasPlano, anoSelecionado])

  const categoriasPlanoDesp = useMemo(() => {
    return categoriasPlano.filter((c) => c.tipo === "despesa" && c.ano === anoSelecionado)
  }, [categoriasPlano, anoSelecionado])

  const adicionarCentroCusto = () => {
    if (!novoCentroCusto.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o centro de custo",
        variant: "destructive",
      })
      return
    }

    if (todosCentrosCusto.includes(novoCentroCusto)) {
      toast({
        title: "Erro",
        description: "Este centro de custo já existe",
        variant: "destructive",
      })
      return
    }

    setCentrosCustoPersonalizados([...centrosCustoPersonalizados, novoCentroCusto])
    setNovoCentroCusto("")
    setModalCentroCustoAberto(false)
    toast({ title: "Sucesso", description: "Centro de custo adicionado!" })
  }

  const excluirCentroCusto = (centroCusto: string) => {
    // Verificar se está sendo usado
    const emUso = [...despesas, ...receitas, ...categoriasPlano].some((item) => item.centroCusto === centroCusto)

    if (emUso) {
      toast({
        title: "Erro",
        description: "Este centro de custo está sendo usado e não pode ser excluído",
        variant: "destructive",
      })
      return
    }

    setCentrosCustoPersonalizados(centrosCustoPersonalizados.filter((c) => c !== centroCusto))
    toast({ title: "Sucesso", description: "Centro de custo excluído!" })
  }

  const adicionarDespesa = () => {
    if (!novaDespesa.nome || !novaDespesa.valorTotal || !novaDespesa.cartaoId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const despesaBase: Omit<Despesa, "parcelasDespesa"> = {
      id: editandoItem || Date.now().toString(),
      nome: novaDespesa.nome!,
      valorTotal: novaDespesa.valorTotal!,
      centroCusto: novaDespesa.centroCusto!,
      categoria: novaDespesa.categoria!,
      dataCompra: novaDespesa.dataCompra!,
      parcelas: novaDespesa.parcelas!,
      cartaoId: novaDespesa.cartaoId!,
      observacoes: novaDespesa.observacoes,
      essencial: novaDespesa.essencial,
    }

    const despesa: Despesa = {
      ...despesaBase,
      parcelasDespesa: gerarParcelasDespesa(despesaBase),
    }

    if (editandoItem) {
      setDespesas(despesas.map((d) => (d.id === editandoItem ? despesa : d)))
      toast({ title: "Sucesso", description: "Despesa atualizada com sucesso!" })
    } else {
      setDespesas([...despesas, despesa])
      toast({ title: "Sucesso", description: "Despesa adicionada com sucesso!" })
    }

    resetFormularioDespesa()
    setModalDespesaAberto(false)
  }

  const adicionarReceita = () => {
    if (!novaReceita.nome || !novaReceita.valor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const receita: Receita = {
      id: editandoItem || Date.now().toString(),
      nome: novaReceita.nome!,
      valor: novaReceita.valor!,
      dataEntrada: novaReceita.dataEntrada!,
      centroCusto: novaReceita.centroCusto!,
      categoria: novaReceita.categoria!,
      recebido: novaReceita.recebido || false,
    }

    if (editandoItem) {
      setReceitas(receitas.map((r) => (r.id === editandoItem ? receita : r)))
      toast({ title: "Sucesso", description: "Receita atualizada com sucesso!" })
    } else {
      setReceitas([...receitas, receita])
      toast({ title: "Sucesso", description: "Receita adicionada com sucesso!" })
    }

    resetFormularioReceita()
    setModalReceitaAberto(false)
  }

  const adicionarCartao = () => {
    if (!novoCartao.nome || !novoCartao.limite) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const cartao: Cartao = {
      id: editandoItem || Date.now().toString(),
      nome: novoCartao.nome!,
      diaFechamento: novoCartao.diaFechamento!,
      diaPagamento: novoCartao.diaPagamento!,
      limite: novoCartao.limite!,
    }

    if (editandoItem) {
      setCartoes(cartoes.map((c) => (c.id === editandoItem ? cartao : c)))
      toast({ title: "Sucesso", description: "Cartão atualizado com sucesso!" })
    } else {
      setCartoes([...cartoes, cartao])
      toast({ title: "Sucesso", description: "Cartão adicionado com sucesso!" })
    }

    resetFormularioCartao()
    setModalCartaoAberto(false)
  }

  const adicionarCategoriaPlano = () => {
    if (!novaCategoriaPlano.nome || !novaCategoriaPlano.centroCusto || !novaCategoriaPlano.valorAnual) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Distribuir valor anual igualmente pelos meses
    const valorMensal = novaCategoriaPlano.valorAnual! / 12
    const distribuicao = Array(12).fill(Math.round(valorMensal * 100) / 100)

    const categoria: CategoriaPlano = {
      id: Date.now().toString(),
      nome: novaCategoriaPlano.nome!,
      tipo: novaCategoriaPlano.tipo!,
      centroCusto: novaCategoriaPlano.centroCusto!,
      valorAnual: novaCategoriaPlano.valorAnual!,
      distribuicaoMensal: distribuicao,
      ano: anoSelecionado,
    }

    setCategoriasPlano([...categoriasPlano, categoria])
    toast({ title: "Sucesso", description: "Categoria adicionada com sucesso!" })

    resetFormularioCategoriaPlano()
    setModalCategoriaPlanoAberto(false)
  }

  const resetFormularioDespesa = () => {
    setNovaDespesa({
      nome: "",
      valorTotal: 0,
      centroCusto: "",
      categoria: "",
      dataCompra: new Date(),
      parcelas: 1,
      cartaoId: "",
      observacoes: "",
      essencial: false,
    })
    setEditandoItem(null)
  }

  const resetFormularioReceita = () => {
    setNovaReceita({
      nome: "",
      valor: 0,
      dataEntrada: new Date(),
      centroCusto: "",
      categoria: "",
      recebido: false,
    })
    setEditandoItem(null)
  }

  const resetFormularioCartao = () => {
    setNovoCartao({
      nome: "",
      diaFechamento: 1,
      diaPagamento: 10,
      limite: 0,
    })
    setEditandoItem(null)
  }

  const resetFormularioCategoriaPlano = () => {
    setNovaCategoriaPlano({
      nome: "",
      tipo: "receita",
      centroCusto: "",
      valorAnual: 0,
      distribuicaoMensal: Array(12).fill(0),
      ano: anoSelecionado,
    })
    setEditandoItem(null)
  }

  const iniciarEdicaoCategoria = (categoria: CategoriaPlano) => {
    setEditandoCategoria(categoria.id)
    setValoresEditando([...categoria.distribuicaoMensal])
  }

  const salvarEdicaoCategoria = (categoriaId: string) => {
    const somaValores = valoresEditando.reduce((acc, val) => acc + val, 0)
    const categoria = categoriasPlano.find((c) => c.id === categoriaId)

    if (!categoria) return

    if (Math.abs(somaValores - categoria.valorAnual) > 0.01) {
      toast({
        title: "Erro de validação",
        description: `A soma dos meses (R$ ${somaValores.toFixed(2)}) deve ser igual ao valor anual (R$ ${categoria.valorAnual.toFixed(2)})`,
        variant: "destructive",
      })
      return
    }

    setCategoriasPlano(
      categoriasPlano.map((c) => (c.id === categoriaId ? { ...c, distribuicaoMensal: [...valoresEditando] } : c)),
    )

    setEditandoCategoria(null)
    setValoresEditando([])
    toast({ title: "Sucesso", description: "Distribuição mensal atualizada!" })
  }

  const cancelarEdicaoCategoria = () => {
    setEditandoCategoria(null)
    setValoresEditando([])
  }

  const editarDespesa = (despesa: Despesa) => {
    setNovaDespesa({
      nome: despesa.nome,
      valorTotal: despesa.valorTotal,
      centroCusto: despesa.centroCusto,
      categoria: despesa.categoria,
      dataCompra: despesa.dataCompra,
      parcelas: despesa.parcelas,
      cartaoId: despesa.cartaoId,
      observacoes: despesa.observacoes,
      essencial: despesa.essencial,
    })
    setEditandoItem(despesa.id)
    setModalDespesaAberto(true)
  }

  const editarReceita = (receita: Receita) => {
    setNovaReceita({
      nome: receita.nome,
      valor: receita.valor,
      dataEntrada: receita.dataEntrada,
      centroCusto: receita.centroCusto,
      categoria: receita.categoria,
      recebido: receita.recebido,
    })
    setEditandoItem(receita.id)
    setModalReceitaAberto(true)
  }

  const editarCartao = (cartao: Cartao) => {
    setNovoCartao(cartao)
    setEditandoItem(cartao.id)
    setModalCartaoAberto(true)
  }

  const excluirDespesa = (id: string) => {
    setDespesas(despesas.filter((d) => d.id !== id))
    toast({ title: "Sucesso", description: "Despesa excluída com sucesso!" })
  }

  const excluirReceita = (id: string) => {
    setReceitas(receitas.filter((r) => r.id !== id))
    toast({ title: "Sucesso", description: "Receita excluída com sucesso!" })
  }

  const excluirCartao = (id: string) => {
    setCartoes(cartoes.filter((c) => c.id !== id))
    toast({ title: "Sucesso", description: "Cartão excluído com sucesso!" })
  }

  const excluirCategoriaPlano = (id: string) => {
    setCategoriasPlano(categoriasPlano.filter((c) => c.id !== id))
    toast({ title: "Sucesso", description: "Categoria excluída com sucesso!" })
  }

  // Cálculo do saldo total baseado nas regras: Receita Planejada - Despesa Realizada
  const saldoTotal = calcularTotaisDashboard.receitasPlanejadas - calcularTotaisDashboard.despesasRealizadas
  const saldoMesAtual =
    calcularTotaisDashboard.receitasPlanejadasMesAtual - calcularTotaisDashboard.despesasRealizadasMesAtual

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home">Dashboard</TabsTrigger>
            <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="cartoes">Cartões</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="interactions">Interações</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R${" "}
                    {calcularTotaisDashboard.receitasPlanejadas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R${" "}
                    {calcularTotaisDashboard.despesasRealizadas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${saldoTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transações</CardTitle>
                  <Badge variant="secondary">{calcularTotaisDashboard.despesasComprometidas}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calcularTotaisDashboard.despesasComprometidas}</div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Transaction Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Transações Recentes</h2>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Transação</DialogTitle>
                      <DialogDescription>Adicione uma nova receita ou despesa</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Ex: Compra no supermercado"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">Valor</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0,00"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="type">Tipo</Label>
                          <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories2[type].map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Data</Label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(date, "dd/MM/yyyy", { locale: ptBR })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(date) => {
                                if (date) {
                                  setDate(date)
                                  setIsDatePickerOpen(false)
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddingTransaction(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Adicionar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {[...categories2.income, ...categories2.expense].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>Transações ({filteredTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
                  ) : (
                    filteredTransactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{transaction.description}</h3>
                            <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                              {transaction.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}R${" "}
                            {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Stats */}
            {categoryStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoria</CardTitle>
                  <CardDescription>Distribuição das despesas deste mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryStats.slice(0, 5).map((stat) => (
                      <div key={stat.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{stat.category}</span>
                          <span className="font-medium">
                            R$ {stat.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (
                            {stat.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={stat.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Planejamento */}
          <TabsContent value="planejamento">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Filtro de Ano */}
              <Card className="bg-white rounded-2xl shadow-lg mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Planejamento para o ano:</label>
                      <Select
                        value={anoSelecionado.toString()}
                        onValueChange={(value) => setAnoSelecionado(Number(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2023, 2024, 2025, 2026, 2027].map((ano) => (
                            <SelectItem key={ano} value={ano.toString()}>
                              {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Receitas */}
                <Card className="bg-white rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-green-600">Receitas Planejadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {categoriasPlanoReceitas.map((categoria) => (
                        <div key={categoria.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-800">{categoria.nome}</h3>
                              <p className="text-sm text-gray-500">{categoria.centroCusto}</p>
                              <p className="text-lg font-bold text-green-600">
                                R$ {categoria.valorAnual.toLocaleString("pt-BR")} / ano
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => iniciarEdicaoCategoria(categoria)}
                                disabled={editandoCategoria === categoria.id}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => excluirCategoriaPlano(categoria.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {editandoCategoria === categoria.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-2">
                                {mesesAbrev.map((mes, index) => (
                                  <div key={mes}>
                                    <Label className="text-xs">{mes}</Label>
                                    <Input
                                      type="number"
                                      value={valoresEditando[index] || 0}
                                      onChange={(e) => {
                                        const novosValores = [...valoresEditando]
                                        novosValores[index] = Number(e.target.value)
                                        setValoresEditando(novosValores)
                                      }}
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                  Soma: R$ {valoresEditando.reduce((acc, val) => acc + val, 0).toLocaleString("pt-BR")}
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => salvarEdicaoCategoria(categoria.id)}>
                                    <Check className="w-4 h-4 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelarEdicaoCategoria}>
                                    <X className="w-4 h-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {categoria.distribuicaoMensal.map((valor, index) => (
                                <div key={index} className="text-center">
                                  <p className="text-xs text-gray-500">{mesesAbrev[index]}</p>
                                  <p className="text-sm font-medium">R$ {valor.toLocaleString("pt-BR")}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Despesas */}
                <Card className="bg-white rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-red-600">Despesas Planejadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {categoriasPlanoDesp.map((categoria) => (
                        <div key={categoria.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-800">{categoria.nome}</h3>
                              <p className="text-sm text-gray-500">{categoria.centroCusto}</p>
                              <p className="text-lg font-bold text-red-600">
                                R$ {categoria.valorAnual.toLocaleString("pt-BR")} / ano
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => iniciarEdicaoCategoria(categoria)}
                                disabled={editandoCategoria === categoria.id}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => excluirCategoriaPlano(categoria.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {editandoCategoria === categoria.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-2">
                                {mesesAbrev.map((mes, index) => (
                                  <div key={mes}>
                                    <Label className="text-xs">{mes}</Label>
                                    <Input
                                      type="number"
                                      value={valoresEditando[index] || 0}
                                      onChange={(e) => {
                                        const novosValores = [...valoresEditando]
                                        novosValores[index] = Number(e.target.value)
                                        setValoresEditando(novosValores)
                                      }}
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                  Soma: R$ {valoresEditando.reduce((acc, val) => acc + val, 0).toLocaleString("pt-BR")}
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => salvarEdicaoCategoria(categoria.id)}>
                                    <Check className="w-4 h-4 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelarEdicaoCategoria}>
                                    <X className="w-4 h-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {categoria.distribuicaoMensal.map((valor, index) => (
                                <div key={index} className="text-center">
                                  <p className="text-xs text-gray-500">{mesesAbrev[index]}</p>
                                  <p className="text-sm font-medium">R$ {valor.toLocaleString("pt-BR")}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Aba Despesas */}
          <TabsContent value="despesas">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="bg-white rounded-2xl shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Centro de Custo</Label>
                      <Select value={filtroCentroCusto} onValueChange={setFiltroCentroCusto}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {todosCentrosCusto.map((centro) => (
                            <SelectItem key={centro} value={centro}>
                              {centro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Mês</Label>
                      <Select value={filtroMes} onValueChange={setFiltroMes}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {meses.map((mes, index) => (
                            <SelectItem key={mes} value={index.toString()}>
                              {mes}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          {categoriasDespesas.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Nome da despesa..."
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Lista de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {despesasFiltradas.map((despesa) => {
                        const cartao = cartoes.find((c) => c.id === despesa.cartaoId)
                        return (
                          <motion.div
                            key={despesa.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">{despesa.nome}</h3>
                                  {despesa.essencial && (
                                    <Badge variant="destructive" className="text-xs">
                                      Essencial
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Centro:</span> {despesa.centroCusto}
                                  </div>
                                  <div>
                                    <span className="font-medium">Categoria:</span> {despesa.categoria}
                                  </div>
                                  <div>
                                    <span className="font-medium">Data:</span>{" "}
                                    {format(despesa.dataCompra, "dd/MM/yyyy")}
                                  </div>
                                  <div>
                                    <span className="font-medium">Cartão:</span> {cartao?.nome}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => editarDespesa(despesa)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => excluirDespesa(despesa.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Parcelas */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-800">
                                Parcelas ({despesa.parcelasDespesa.length}x):
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {despesa.parcelasDespesa.map((parcela) => (
                                  <div
                                    key={parcela.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                      parcela.pago ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                                    }`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {parcela.numeroParcela}/{despesa.parcelas}
                                        </span>
                                        {parcela.pago ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <Clock className="w-4 h-4 text-orange-600" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        R$ {parcela.valorParcela.toLocaleString("pt-BR")}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {format(parcela.dataVencimento, "dd/MM/yyyy")}
                                      </p>
                                    </div>
                                    {!parcela.pago && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => marcarParcelaPaga(despesa.id, parcela.id)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Pago
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Aba Receitas */}
          <TabsContent value="receitas">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="bg-white rounded-2xl shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Centro de Custo</Label>
                      <Select value={filtroCentroCusto} onValueChange={setFiltroCentroCusto}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {todosCentrosCusto.map((centro) => (
                            <SelectItem key={centro} value={centro}>
                              {centro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Mês</Label>
                      <Select value={filtroMes} onValueChange={setFiltroMes}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {meses.map((mes, index) => (
                            <SelectItem key={mes} value={index.toString()}>
                              {mes}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          {categoriasReceitas.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Nome da receita..."
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Lista de Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {receitasFiltradas.map((receita) => (
                        <motion.div
                          key={receita.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow ${
                            receita.recebido ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{receita.nome}</h3>
                              {receita.recebido ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Recebido
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <p className="font-bold text-green-600 text-lg">
                                  R$ {receita.valor.toLocaleString("pt-BR")}
                                </p>
                                <Badge variant="outline" className="bg-green-50">
                                  {receita.categoria}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Centro:</span> {receita.centroCusto}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Data:</span> {format(receita.dataEntrada, "dd/MM/yyyy")}
                                </p>
                              </div>
                              <div>
                                {receita.dataRecebimento && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Recebido em:</span>{" "}
                                    {format(receita.dataRecebimento, "dd/MM/yyyy")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!receita.recebido && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => marcarReceitaRecebida(receita.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Recebido
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => editarReceita(receita)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => excluirReceita(receita.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Aba Cartões */}
          <TabsContent value="cartoes">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {cartoes.map((cartao) => {
                const usoAtual = calcularUsoCartao(cartao.id)
                const percentualUso = (usoAtual / cartao.limite) * 100

                return (
                  <Card key={cartao.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          {cartao.nome}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editarCartao(cartao)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => excluirCartao(cartao.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Fechamento:</p>
                          <p className="font-semibold">Dia {cartao.diaFechamento}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Pagamento:</p>
                          <p className="font-semibold">Dia {cartao.diaPagamento}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Limite:</p>
                        <p className="font-bold text-lg">R$ {cartao.limite.toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-gray-600 text-sm">Usado este mês (pago):</p>
                          <p className="font-semibold">R$ {usoAtual.toLocaleString("pt-BR")}</p>
                        </div>
                        <Progress value={Math.min(percentualUso, 100)} className="h-3" />
                        <div className="mt-2">
                          {percentualUso > 100 ? (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Limite ultrapassado!</span>
                            </div>
                          ) : percentualUso > 90 ? (
                            <div className="flex items-center gap-2 text-orange-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Atenção: {percentualUso.toFixed(1)}% do limite usado</span>
                            </div>
                          ) : (
                            <p className="text-green-600 text-sm">{percentualUso.toFixed(1)}% do limite usado</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <HistoryViewer />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="interactions">
            <InteracoesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
