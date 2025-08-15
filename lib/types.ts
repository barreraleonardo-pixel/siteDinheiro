export interface User {
  id: string
  auth_user_id: string
  nome: string
  email: string
  foto?: string
  conta_principal_id?: string
  permissao: "visualizacao" | "edicao"
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface HistoricoItem {
  id: string
  usuario_id: string
  acao: string
  dados_anteriores?: any
  dados_novos?: any
  tabela_afetada?: string
  registro_id?: string
  data_hora: string
}

export interface CartaoDb {
  id: string
  usuario_id: string
  nome: string
  dia_fechamento: number
  dia_pagamento: number
  limite: number
  created_at: string
  updated_at: string
}

export interface DespesaDb {
  id: string
  usuario_id: string
  nome: string
  valor_total: number
  centro_custo?: string
  categoria?: string
  data_compra: string
  parcelas: number
  cartao_id?: string
  observacoes?: string
  essencial: boolean
  created_at: string
  updated_at: string
}

export interface ReceitaDb {
  id: string
  usuario_id: string
  nome: string
  valor: number
  data_entrada: string
  centro_custo?: string
  categoria?: string
  recebido: boolean
  data_recebimento?: string
  created_at: string
  updated_at: string
}
