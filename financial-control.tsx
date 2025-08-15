"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
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
  Home,
  Target,
  PieChart,
  X,
  Check,
  CheckCircle,
  Clock,
  Calculator,
} from "lucide-react"
import { Bell, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

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

interface Transaction {
  id: string
  type: "receita" | "despesa"
  category: string
  description: string
  amount: number
  date: string
}

export default function FinancialControl() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [newTransaction, setNewTransaction] = useState({
    type: "receita" as "receita" | "despesa",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  })

  const categories = {
    receita: ["Salário", "Freelance", "Investimentos", "Outros"],
    despesa: ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Outros"],
  }

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      alert("Por favor, preencha todos os campos")
      return
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      category: newTransaction.category,
      description: newTransaction.description,
      amount: Number.parseFloat(newTransaction.amount),
      date: newTransaction.date,
    }

    setTransactions([...transactions, transaction])
    setNewTransaction({
      type: "receita",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const totalReceitas = transactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0)

  const totalDespesas = transactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0)

  const saldo = totalReceitas - totalDespesas

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }
  const [cartoes, setCartoes] = useState<Cartao[]>(cartoesIniciais)
  const [despesas, setDespesas] = useState<Despesa[]>(despesasIniciais)
  const [receitas, setReceitas] = useState<Receita[]>(receitasIniciais)
  const [categoriasPlano, setCategoriasPlano] = useState<CategoriaPlano[]>(categoriasPlanoIniciais)
  const [activeTab, setActiveTab] = useState("home")
  const { toast } = useToast()

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
                Finanças Pessoais
              </CardTitle>
              <p className="text-gray-600 mt-2">Controle financeiro inteligente</p>
            </CardHeader>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white rounded-2xl shadow-lg p-2">
            <TabsTrigger
              value="home"
              className="rounded-xl data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger
              value="planejamento"
              className="rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <PieChart className="w-4 h-4 mr-2" />
              Planejamento
            </TabsTrigger>
            <TabsTrigger
              value="despesas"
              className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Despesas
            </TabsTrigger>
            <TabsTrigger
              value="receitas"
              className="rounded-xl data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Receitas
            </TabsTrigger>
            <TabsTrigger
              value="cartoes"
              className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Cartões
            </TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>

          {/* Aba Home - Dashboard Aprimorado */}
          <TabsContent value="home">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Filtros do Dashboard */}
              <Card className="bg-white rounded-2xl shadow-lg mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Ano:</label>
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
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Mês:</label>
                      <Select value={mesSelecionadoDash} onValueChange={setMesSelecionadoDash}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os meses</SelectItem>
                          {meses.map((mes) => (
                            <SelectItem key={mes} value={mes}>
                              {mes}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Dois Meses */}
              <Card className="bg-white rounded-2xl shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Resumo Mensal - {anoSelecionado}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mês Esquerda */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600 mb-4 text-center">
                        {dadosDoisMeses.mesEsquerda.nome}
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-700 mb-2">Receitas</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Planejado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesEsquerda.dados.receitasPlanejadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Realizado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesEsquerda.dados.receitasRealizadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-700 mb-2">Despesas</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Planejado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesEsquerda.dados.despesasPlanejadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Realizado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesEsquerda.dados.despesasRealizadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Comprometido:</span>
                              <span>
                                R$ {dadosDoisMeses.mesEsquerda.dados.despesasComprometidas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <h4 className="font-semibold text-blue-700 mb-2">Saldo</h4>
                          <p className="text-xs text-gray-600 mb-1">Receita Planejada - Despesa Realizada</p>
                          <p
                            className={`text-xl font-bold ${dadosDoisMeses.mesEsquerda.dados.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            R$ {dadosDoisMeses.mesEsquerda.dados.saldo.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mês Direita */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600 mb-4 text-center">
                        {dadosDoisMeses.mesDireita.nome}
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-700 mb-2">Receitas</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Planejado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesDireita.dados.receitasPlanejadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Realizado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesDireita.dados.receitasRealizadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-700 mb-2">Despesas</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Planejado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesDireita.dados.despesasPlanejadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Realizado:</span>
                              <span>
                                R$ {dadosDoisMeses.mesDireita.dados.despesasRealizadas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Comprometido:</span>
                              <span>
                                R$ {dadosDoisMeses.mesDireita.dados.despesasComprometidas.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <h4 className="font-semibold text-blue-700 mb-2">Saldo</h4>
                          <p className="text-xs text-gray-600 mb-1">Receita Planejada - Despesa Realizada</p>
                          <p
                            className={`text-xl font-bold ${dadosDoisMeses.mesDireita.dados.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            R$ {dadosDoisMeses.mesDireita.dados.saldo.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas de Vencimento */}
              {mostrarAlertas && parcelasProximasVencimento.length > 0 && (
                <Card className="bg-white rounded-2xl shadow-lg mb-6 border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Bell className="w-5 h-5" />
                        Alertas de Vencimento
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {parcelasProximasVencimento.length}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-600">Dias de antecedência:</Label>
                          <Select
                            value={diasAlertaVencimento.toString()}
                            onValueChange={(value) => setDiasAlertaVencimento(Number(value))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setMostrarAlertas(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm text-orange-700 font-medium">Valor Total</p>
                        <p className="text-lg font-bold text-orange-800">
                          R$ {impactoFinanceiroAlertas.valorTotal.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Críticas (≤3 dias)</p>
                        <p className="text-lg font-bold text-red-800">
                          R$ {impactoFinanceiroAlertas.valorCritico.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">Parcelas</p>
                        <p className="text-lg font-bold text-blue-800">
                          {impactoFinanceiroAlertas.quantidadeTotal} total
                          {impactoFinanceiroAlertas.quantidadeCritica > 0 && (
                            <span className="text-red-600">
                              {" "}
                              ({impactoFinanceiroAlertas.quantidadeCritica} críticas)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {parcelasProximasVencimento.map((parcela) => (
                        <motion.div
                          key={parcela.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                            parcela.urgencia === "critica"
                              ? "bg-red-50 border-l-red-500"
                              : parcela.urgencia === "alta"
                                ? "bg-orange-50 border-l-orange-500"
                                : "bg-yellow-50 border-l-yellow-500"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-800">{parcela.despesaNome}</h4>
                              <Badge variant="outline" className="text-xs">
                                {parcela.numeroParcela}/{parcela.totalParcelas}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                {parcela.categoria}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Valor:</span> R${" "}
                                {parcela.valorParcela.toLocaleString("pt-BR")}
                              </div>
                              <div>
                                <span className="font-medium">Cartão:</span> {parcela.cartaoNome}
                              </div>
                              <div>
                                <span className="font-medium">Vencimento:</span>{" "}
                                {format(parcela.dataVencimento, "dd/MM/yyyy")}
                              </div>
                              <div className="flex items-center gap-1">
                                {parcela.urgencia === "critica" ? (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                ) : parcela.urgencia === "alta" ? (
                                  <Clock className="w-4 h-4 text-orange-500" />
                                ) : (
                                  <Calendar className="w-4 h-4 text-yellow-500" />
                                )}
                                <span
                                  className={`font-medium ${
                                    parcela.urgencia === "critica"
                                      ? "text-red-600"
                                      : parcela.urgencia === "alta"
                                        ? "text-orange-600"
                                        : "text-yellow-600"
                                  }`}
                                >
                                  {parcela.diasRestantes === 0
                                    ? "Vence hoje!"
                                    : parcela.diasRestantes === 1
                                      ? "Vence amanhã"
                                      : `${parcela.diasRestantes} dias`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const despesa = despesas.find((d) => d.parcelasDespesa.some((p) => p.id === parcela.id))
                                if (despesa) {
                                  marcarParcelaPaga(despesa.id, parcela.id)
                                }
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Pagar
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {parcelasProximasVencimento.length > 5 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Mostrando {Math.min(5, parcelasProximasVencimento.length)} de{" "}
                          {parcelasProximasVencimento.length} parcelas próximas do vencimento
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botão para reativar alertas quando ocultos */}
              {!mostrarAlertas && parcelasProximasVencimento.length > 0 && (
                <Card className="bg-orange-50 rounded-2xl shadow-lg mb-6 border border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-800">
                            {parcelasProximasVencimento.length} parcela(s) próximas do vencimento
                          </p>
                          <p className="text-sm text-orange-600">
                            Valor total: R$ {impactoFinanceiroAlertas.valorTotal.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMostrarAlertas(true)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        Mostrar Alertas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cards de Resumo Anuais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Receitas Planejadas (Ano)</p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {calcularTotaisDashboard.receitasPlanejadas.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-4">
                      <Progress
                        value={
                          calcularTotaisDashboard.receitasPlanejadas > 0
                            ? (calcularTotaisDashboard.receitasRealizadas /
                                calcularTotaisDashboard.receitasPlanejadas) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Realizado: R$ {calcularTotaisDashboard.receitasRealizadas.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Despesas Realizadas (Ano)</p>
                        <p className="text-2xl font-bold text-red-600">
                          R$ {calcularTotaisDashboard.despesasRealizadas.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="mt-4">
                      <Progress
                        value={
                          calcularTotaisDashboard.despesasPlanejadas > 0
                            ? (calcularTotaisDashboard.despesasRealizadas /
                                calcularTotaisDashboard.despesasPlanejadas) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Planejado: R$ {calcularTotaisDashboard.despesasPlanejadas.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Saldo Anual</p>
                        <p className="text-xs text-gray-500 mb-1">Receita Planejada - Despesa Realizada</p>
                        <p className={`text-2xl font-bold ${saldoTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                          R$ {saldoTotal.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <DollarSign className={`h-8 w-8 ${saldoTotal >= 0 ? "text-green-500" : "text-red-500"}`} />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center mt-2">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${saldoTotal >= 0 ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span className="text-xs text-gray-600">
                          {saldoTotal >= 0 ? "Saldo positivo" : "Saldo negativo"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Despesas Comprometidas</p>
                        <p className="text-2xl font-bold text-orange-600">
                          R$ {calcularTotaisDashboard.despesasComprometidas.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">Todas as parcelas (pagas + pendentes)</p>
                      <div className="flex items-center mt-2">
                        <div className="h-2 w-2 rounded-full mr-2 bg-orange-500"></div>
                        <span className="text-xs text-gray-600">Valores comprometidos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progresso por Categoria Separado */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Progresso por Categoria</h2>

                {/* Receitas */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-green-600 mb-4">Receitas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressoCategorias.receitas.map((categoria, index) => (
                      <Card key={categoria.nome} className="bg-white rounded-xl shadow-md">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{categoria.nome}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Mês Atual:</span>
                              <span>
                                R$ {categoria.realizadoMes.toLocaleString("pt-BR")} / R${" "}
                                {categoria.planejadoMes.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <Progress value={Math.min(categoria.progressoMes, 100)} className="h-2" />
                            <p className="text-xs text-gray-500">{categoria.progressoMes.toFixed(1)}% do planejado</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Despesas */}
                <div>
                  <h3 className="text-xl font-semibold text-red-600 mb-4">Despesas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progressoCategorias.despesas.map((categoria, index) => (
                      <Card key={categoria.nome} className="bg-white rounded-xl shadow-md">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{categoria.nome}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Mês Atual:</span>
                              <span>
                                R$ {categoria.realizadoMes.toLocaleString("pt-BR")} / R${" "}
                                {categoria.planejadoMes.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(categoria.progressoMes, 100)}
                              className={`h-2 ${categoria.progressoMes > 100 ? "bg-red-200" : ""}`}
                            />
                            <p className={`text-xs ${categoria.progressoMes > 100 ? "text-red-600" : "text-gray-500"}`}>
                              {categoria.progressoMes.toFixed(1)}% do planejado
                              {categoria.progressoMes > 100 && " - Acima do orçamento!"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gráfico Mensalizado - Planejado x Realizado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="bg-white rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Evolução Anual - Planejado x Realizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dadosGraficoBarras}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Receita Planejada" stroke="#10B981" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="Receita Realizada" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Despesa Planejada" stroke="#EF4444" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="Despesa Realizada" stroke="#EF4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico de Pizza */}
                <Card className="bg-white rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Distribuição de Despesas Realizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={dadosGraficoPizza}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dadosGraficoPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Valor"]} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo Mês a Mês com Toggle de Saldo Comprometido */}
              <Card className="bg-white rounded-2xl shadow-lg mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Resumo Anual {anoSelecionado} - Mês a Mês
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Calculator className="w-5 h-5 text-gray-600" />
                      <Label htmlFor="saldo-comprometido" className="text-sm font-medium text-gray-700">
                        Saldo Comprometido
                      </Label>
                      <Switch
                        id="saldo-comprometido"
                        checked={saldoComprometido}
                        onCheckedChange={setSaldoComprometido}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {saldoComprometido
                      ? "Cálculo: Receita Planejada - Despesa Comprometida (para meses futuros)"
                      : "Cálculo: Receita Planejada - Despesa Realizada"}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-center">Mês</th>
                          <th className="text-center p-2">Receitas Plan.</th>
                          <th className="text-center p-2 text-green-700">Receitas Real.</th>
                          <th className="text-center p-2">Despesas Plan.</th>
                          <th className="text-center p-2 text-red-700">Despesas Real.</th>
                          <th className="text-center p-2 text-orange-600">Comprometido</th>
                          <th className="text-center p-2">Saldo</th>
                          <th className="text-center p-2">Saldo Acumulado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumoMensalAno.map((item, index) => (
                          <tr
                            key={item.mes}
                            className={`border-b hover:bg-gray-50 ${index === mesAtual ? "bg-blue-50" : ""}`}
                          >
                            <td className="p-2 font-medium text-center">
                              {item.mes}
                              {index === mesAtual && (
                                <Badge variant="secondary" className="ml-2">
                                  Atual
                                </Badge>
                              )}
                            </td>
                            <td className="text-center p-2 text-slate-600">
                              R$ {item.receitasPlanejadas.toLocaleString("pt-BR")}
                            </td>
                            <td className="text-center p-2">R$ {item.receitasRealizadas.toLocaleString("pt-BR")}</td>
                            <td className="text-center p-2 text-slate-600">
                              R$ {item.despesasPlanejadas.toLocaleString("pt-BR")}
                            </td>
                            <td className="text-center p-2">R$ {item.despesasRealizadas.toLocaleString("pt-BR")}</td>
                            <td className="text-center p-2 text-orange-600">
                              R$ {item.despesasComprometidas.toLocaleString("pt-BR")}
                            </td>
                            <td
                              className={`text-center p-2 font-semibold ${item.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              R$ {item.saldo.toLocaleString("pt-BR")}
                              {saldoComprometido && item.isFuturo && !item.temValorRealizado && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  Comp.
                                </Badge>
                              )}
                            </td>
                            <td
                              className={`text-center p-2 font-bold ${item.saldoAcumulado >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              R$ {item.saldoAcumulado.toLocaleString("pt-BR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transações</CardTitle>
                <CardDescription>Lista de todas as suas transações</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma transação encontrada</p>
                    <p className="text-sm text-gray-400">Adicione sua primeira transação para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "receita" ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
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
                                  {new Date(transaction.date).toLocaleDateString("pt-BR")}
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões Flutuantes */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-4">
          {activeTab === "planejamento" && (
            <Dialog open={modalCategoriaPlanoAberto} onOpenChange={setModalCategoriaPlanoAberto}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-orange-600 hover:bg-orange-700"
                  onClick={resetFormularioCategoriaPlano}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Categoria de Planejamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nome da Categoria</Label>
                    <Input
                      value={novaCategoriaPlano.nome}
                      onChange={(e) => setNovaCategoriaPlano({ ...novaCategoriaPlano, nome: e.target.value })}
                      placeholder="Ex: Salário, Alimentação..."
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={novaCategoriaPlano.tipo === "despesa"}
                        onCheckedChange={(checked) =>
                          setNovaCategoriaPlano({ ...novaCategoriaPlano, tipo: checked ? "despesa" : "receita" })
                        }
                      />
                      <Label>{novaCategoriaPlano.tipo === "receita" ? "Receita" : "Despesa"}</Label>
                    </div>
                  </div>
                  <div>
                    <Label>Centro de Custo</Label>
                    <div className="space-y-2">
                      <Select
                        value={novaCategoriaPlano.centroCusto}
                        onValueChange={(value) => {
                          if (value === "novo") {
                            setModalCentroCustoAberto(true)
                          } else {
                            setNovaCategoriaPlano({ ...novaCategoriaPlano, centroCusto: value })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione ou crie novo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">+ Criar novo Centro de Custo</SelectItem>
                          {todosCentrosCusto.map((centro) => (
                            <SelectItem key={centro} value={centro}>
                              <div className="flex items-center justify-between w-full">
                                <span>{centro}</span>
                                {centrosCustoPersonalizados.includes(centro) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      excluirCentroCusto(centro)
                                    }}
                                    className="ml-2 h-4 w-4 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Valor Anual Planejado</Label>
                    <Input
                      type="number"
                      value={novaCategoriaPlano.valorAnual}
                      onChange={(e) =>
                        setNovaCategoriaPlano({ ...novaCategoriaPlano, valorAnual: Number(e.target.value) })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={adicionarCategoriaPlano} className="flex-1">
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetFormularioCategoriaPlano()
                        setModalCategoriaPlanoAberto(false)
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "despesas" && (
            <Dialog open={modalDespesaAberto} onOpenChange={setModalDespesaAberto}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
                  onClick={resetFormularioDespesa}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editandoItem ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nome da Despesa</Label>
                    <Input
                      value={novaDespesa.nome}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, nome: e.target.value })}
                      placeholder="Ex: Supermercado"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Valor Total</Label>
                      <Input
                        type="number"
                        value={novaDespesa.valorTotal}
                        onChange={(e) => setNovaDespesa({ ...novaDespesa, valorTotal: Number(e.target.value) })}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label>Parcelas</Label>
                      <Input
                        type="number"
                        value={novaDespesa.parcelas}
                        onChange={(e) => setNovaDespesa({ ...novaDespesa, parcelas: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Data da Compra</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {novaDespesa.dataCompra ? format(novaDespesa.dataCompra, "dd/MM/yyyy") : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={novaDespesa.dataCompra}
                          onSelect={(date) => {
                            if (date) {
                              setNovaDespesa({ ...novaDespesa, dataCompra: date })
                              setCalendarOpen(false)
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select
                      value={novaDespesa.categoria}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasDespesas.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Centro de Custo</Label>
                    <Select
                      value={novaDespesa.centroCusto}
                      onValueChange={(value) => setNovaDespesa({ ...novaDespesa, centroCusto: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {todosCentrosCusto.map((centro) => (
                          <SelectItem key={centro} value={centro}>
                            {centro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cartão</Label>
                    <Select
                      value={novaDespesa.cartaoId}
                      onValueChange={(value) => setNovaDespesa({ ...novaDespesa, cartaoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cartoes.map((cartao) => (
                          <SelectItem key={cartao.id} value={cartao.id}>
                            {cartao.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={novaDespesa.observacoes}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, observacoes: e.target.value })}
                      placeholder="Observações opcionais..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={novaDespesa.essencial || false}
                      onCheckedChange={(checked) => setNovaDespesa({ ...novaDespesa, essencial: checked })}
                    />
                    <Label>Esta é uma despesa essencial?</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={adicionarDespesa} className="flex-1">
                      {editandoItem ? "Atualizar" : "Adicionar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetFormularioDespesa()
                        setModalDespesaAberto(false)
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "receitas" && (
            <Dialog open={modalReceitaAberto} onOpenChange={setModalReceitaAberto}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
                  onClick={resetFormularioReceita}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editandoItem ? "Editar Receita" : "Nova Receita"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nome da Receita</Label>
                    <Input
                      value={novaReceita.nome}
                      onChange={(e) => setNovaReceita({ ...novaReceita, nome: e.target.value })}
                      placeholder="Ex: Salário Janeiro"
                    />
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={novaReceita.valor}
                      onChange={(e) => setNovaReceita({ ...novaReceita, valor: Number(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Data de Entrada</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {novaReceita.dataEntrada ? format(novaReceita.dataEntrada, "dd/MM/yyyy") : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={novaReceita.dataEntrada}
                          onSelect={(date) => date && setNovaReceita({ ...novaReceita, dataEntrada: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select
                      value={novaReceita.categoria}
                      onValueChange={(value) => setNovaReceita({ ...novaReceita, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasReceitas.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Centro de Custo</Label>
                    <Select
                      value={novaReceita.centroCusto}
                      onValueChange={(value) => setNovaReceita({ ...novaReceita, centroCusto: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {todosCentrosCusto.map((centro) => (
                          <SelectItem key={centro} value={centro}>
                            {centro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={adicionarReceita} className="flex-1">
                      {editandoItem ? "Atualizar" : "Adicionar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetFormularioReceita()
                        setModalReceitaAberto(false)
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "cartoes" && (
            <Dialog open={modalCartaoAberto} onOpenChange={setModalCartaoAberto}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-purple-600 hover:bg-purple-700"
                  onClick={resetFormularioCartao}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editandoItem ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nome do Cartão</Label>
                    <Input
                      value={novoCartao.nome}
                      onChange={(e) => setNovoCartao({ ...novoCartao, nome: e.target.value })}
                      placeholder="Ex: Nubank"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Dia Fechamento</Label>
                      <Input
                        type="number"
                        value={novoCartao.diaFechamento}
                        onChange={(e) => setNovoCartao({ ...novoCartao, diaFechamento: Number(e.target.value) })}
                        min="1"
                        max="31"
                      />
                    </div>
                    <div>
                      <Label>Dia Pagamento</Label>
                      <Input
                        type="number"
                        value={novoCartao.diaPagamento}
                        onChange={(e) => setNovoCartao({ ...novoCartao, diaPagamento: Number(e.target.value) })}
                        min="1"
                        max="31"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Limite Mensal</Label>
                    <Input
                      type="number"
                      value={novoCartao.limite}
                      onChange={(e) => setNovoCartao({ ...novoCartao, limite: Number(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={adicionarCartao} className="flex-1">
                      {editandoItem ? "Atualizar" : "Adicionar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetFormularioCartao()
                        setModalCartaoAberto(false)
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Modal Centro de Custo */}
        <Dialog open={modalCentroCustoAberto} onOpenChange={setModalCentroCustoAberto}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Centro de Custo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome do Centro de Custo</Label>
                <Input
                  value={novoCentroCusto}
                  onChange={(e) => setNovoCentroCusto(e.target.value)}
                  placeholder="Ex: _7.1 Nova Categoria"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={adicionarCentroCusto} className="flex-1">
                  Criar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNovoCentroCusto("")
                    setModalCentroCustoAberto(false)
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
