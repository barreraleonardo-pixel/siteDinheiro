import { supabase } from "@/lib/supabase/client"
import type { HistoricoItem } from "@/lib/types"

export class HistoricoService {
  static async registrarAlteracao(
    usuarioId: string,
    acao: string,
    dadosAnteriores: any,
    dadosNovos: any,
    tabelaAfetada?: string,
    registroId?: string,
  ) {
    try {
      const { error } = await supabase.from("historico").insert({
        usuario_id: usuarioId,
        acao,
        dados_anteriores: dadosAnteriores,
        dados_novos: dadosNovos,
        tabela_afetada: tabelaAfetada,
        registro_id: registroId,
      })

      if (error) {
        console.error("Erro ao registrar histórico:", error)
      }
    } catch (error) {
      console.error("Erro ao registrar histórico:", error)
    }
  }

  static async buscarHistorico(usuarioId?: string, limite = 50): Promise<HistoricoItem[]> {
    try {
      let query = supabase
        .from("historico")
        .select(`
          *,
          users!historico_usuario_id_fkey(nome, email)
        `)
        .order("data_hora", { ascending: false })
        .limit(limite)

      if (usuarioId) {
        query = query.eq("usuario_id", usuarioId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Erro ao buscar histórico:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      return []
    }
  }
}
