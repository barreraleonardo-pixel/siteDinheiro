"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface DashboardProps {
  receitas: any[]
  despesas: any[]
  categorias: any[]
  cartoes: any[]
  ano: number
}

const coresCategorias = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

export default function FinancialDashboard({ receitas, despesas, categorias, cartoes, ano }: DashboardProps) {
  const dadosCalculados = useMemo(() => {
    const receitasAno = receitas.filter((r) => r.dataEntrada.getFullYear() === ano)
    const despesasAno = despesas.filter((d) => d.dataCompra.getFullYear() === ano)
    const categoriasAno = categorias.filter((c) => c.ano === ano)

    // Calcular totais
    const receitasPlanejadas = categoriasAno
      .filter((c) => c.tipo === "receita")
      .reduce((acc, c) => acc + c.valorAnual, 0)

    const receitasRealizadas = receitasAno.filter((r) => r.recebido).reduce((acc, r) => acc + r.valor, 0)

    const despesasPlanejadas = categoriasAno
      .filter((c) => c.tipo === "despesa")
      .reduce((acc, c) => acc + c.valorAnual, 0)

    let despesasRealizadas = 0
    let despesasComprometidas = 0

    despesasAno.forEach((despesa) => {
      despesa.parcelasDespesa.forEach((parcela: any) => {
        despesasComprometidas += parcela.valorParcela
        if (parcela.pago) {
          despesasRealizadas += parcela.valorParcela
        }
      })
    })

    // Dados para gráfico de linha mensal
    const dadosMensais = Array.from({ length: 12 }, (_, index) => {
      const receitaPlanejada = categoriasAno
        .filter((c) => c.tipo === "receita")
        .reduce((acc, c) => acc + (c.distribuicaoMensal[index] || 0), 0)

      const receitaRealizada = receitasAno
        .filter((r) => r.dataEntrada.getMonth() === index && r.recebido)
        .reduce((acc, r) => acc + r.valor, 0)

      const despesaPlanejada = categoriasAno
        .filter((c) => c.tipo === "despesa")
        .reduce((acc, c) => acc + (c.distribuicaoMensal[index] || 0), 0)

      let despesaRealizada = 0
      despesasAno.forEach((despesa) => {
        despesa.parcelasDespesa
          .filter((p: any) => p.mesVencimento === index && p.pago)
          .forEach((p: any) => {
            despesaRealizada += p.valorParcela
          })
      })

      return {
        mes: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][index],
        "Receita Planejada": receitaPlanejada,
        "Receita Realizada": receitaRealizada,
        "Despesa Planejada": despesaPlanejada,
        "Despesa Realizada": despesaRealizada,
      }
    })

    // Dados para gráfico de pizza
    const categoriasDespesas = new Map<string, number>()
    despesasAno.forEach((despesa) => {
      despesa.parcelasDespesa
        .filter((p: any) => p.pago)
        .forEach((p: any) => {
          const categoria = despesa.categoria
          categoriasDespesas.set(categoria, (categoriasDespesas.get(categoria) || 0) + p.valorParcela)
        })
    })

    const dadosPizza = Array.from(categoriasDespesas.entries()).map(([nome, valor], index) => ({
      name: nome,
      value: valor,
      color: coresCategorias[index % coresCategorias.length],
    }))

    return {
      receitasPlanejadas,
      receitasRealizadas,
      despesasPlanejadas,
      despesasRealizadas,
      despesasComprometidas,
      saldo: receitasRealizadas - despesasRealizadas,
      dadosMensais,
      dadosPizza,
    }
  }, [receitas, despesas, categorias, ano])

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receitas Planejadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {dadosCalculados.receitasPlanejadas.toLocaleString("pt-BR")}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-4">
                <Progress
                  value={
                    dadosCalculados.receitasPlanejadas > 0
                      ? (dadosCalculados.receitasRealizadas / dadosCalculados.receitasPlanejadas) * 100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Realizado: R$ {dadosCalculados.receitasRealizadas.toLocaleString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas Realizadas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {dadosCalculados.despesasRealizadas.toLocaleString("pt-BR")}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-4">
                <Progress
                  value={
                    dadosCalculados.despesasPlanejadas > 0
                      ? (dadosCalculados.despesasRealizadas / dadosCalculados.despesasPlanejadas) * 100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Planejado: R$ {dadosCalculados.despesasPlanejadas.toLocaleString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-2xl font-bold ${dadosCalculados.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {dadosCalculados.saldo.toLocaleString("pt-BR")}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${dadosCalculados.saldo >= 0 ? "text-green-500" : "text-red-500"}`} />
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-2 ${dadosCalculados.saldo >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {dadosCalculados.saldo >= 0 ? "Saldo positivo" : "Saldo negativo"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comprometido</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {dadosCalculados.despesasComprometidas.toLocaleString("pt-BR")}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">Parcelas pendentes + pagas</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal - Planejado vs Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosCalculados.dadosMensais}>
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

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosCalculados.dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosCalculados.dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Valor"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
