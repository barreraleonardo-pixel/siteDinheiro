"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface Cartao {
  id: string
  nome: string
  diaFechamento: number
  diaPagamento: number
  limite: number
}

interface NovaDespesaButtonProps {
  cartoes: Cartao[]
  onAdicionarDespesa: (despesa: any) => void
  centrosCusto: string[]
  categorias: string[]
}

export default function NovaDespesaButton({
  cartoes,
  onAdicionarDespesa,
  centrosCusto,
  categorias,
}: NovaDespesaButtonProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { toast } = useToast()

  const [novaDespesa, setNovaDespesa] = useState({
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

  const resetFormulario = () => {
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

    onAdicionarDespesa(novaDespesa)
    resetFormulario()
    setModalAberto(false)

    toast({
      title: "Sucesso",
      description: "Despesa adicionada com sucesso!",
    })
  }

  return (
    <Dialog open={modalAberto} onOpenChange={setModalAberto}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
          onClick={resetFormulario}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
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
              onValueChange={(value) => setNovaDespesa({ ...novaDespesa, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
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
                {centrosCusto.map((centro) => (
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
              Adicionar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetFormulario()
                setModalAberto(false)
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
