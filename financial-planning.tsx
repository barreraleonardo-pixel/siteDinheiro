"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react"
import { motion } from "framer-motion"

interface PlanejamentoFinanceiroProps {
  ano: number
  receitas: any[]
  despesas: any[]
  categorias: any[]
}

export default function PlanejamentoFinanceiro({ ano, receitas, despesas, categorias }: PlanejamentoFinanceiroProps) {
  const { toast } = useToast()
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos")

  const calcularTotais = () => {
    const receitasAno = receitas.filter((r) => r.dataEntrada.getFullYear() === ano)
    const despesasAno = despesas.filter((d) => d.dataCompra.getFullYear() === ano)

    const totalReceitas = receitasAno.reduce((acc, r) => acc + (r.recebido ? r.valor : 0), 0)
    const totalDespesas = despesasAno.reduce((acc, d) => {
      return acc + d.parcelasDespesa.reduce((sum: number, p: any) => sum + (p.pago ? p.valorParcela : 0), 0)
    }, 0)

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: totalReceitas - totalDespesas,
    }
  }

  const totais = calcularTotais()
  const categoriasFiltradas = categorias.filter(
    (c) => c.ano === ano && (filtroTipo === "todos" || c.tipo === filtroTipo),
  )

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Planejamento Financeiro {ano}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Receitas Realizadas</p>
                  <p className="text-xl font-bold text-green-600">R$ {totais.receitas.toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Despesas Realizadas</p>
                  <p className="text-xl font-bold text-red-600">R$ {totais.despesas.toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <DollarSign className={`w-8 h-8 ${totais.saldo >= 0 ? "text-green-500" : "text-red-500"}`} />
                <div>
                  <p className="text-sm text-gray-600">Saldo Atual</p>
                  <p className={`text-xl font-bold ${totais.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {totais.saldo.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filtrar por tipo:</Label>
            <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoriasFiltradas.map((categoria) => (
          <motion.div
            key={categoria.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                    <p className="text-sm text-gray-500">{categoria.centroCusto}</p>
                  </div>
                  <Badge
                    variant={categoria.tipo === "receita" ? "default" : "destructive"}
                    className={categoria.tipo === "receita" ? "bg-green-600" : ""}
                  >
                    {categoria.tipo === "receita" ? "Receita" : "Despesa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      R$ {categoria.valorAnual.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-gray-500">Valor anual planejado</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Distribuição mensal:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {categoria.distribuicaoMensal.map((valor: number, index: number) => (
                        <div key={index} className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">
                            {
                              ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][
                                index
                              ]
                            }
                          </p>
                          <p className="text-sm font-medium">R$ {valor.toLocaleString("pt-BR")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {categoriasFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma categoria encontrada para os filtros selecionados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
