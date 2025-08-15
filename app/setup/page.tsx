"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink, Database, Key, Globe } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const sqlScript = `-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_transacao DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas transações
CREATE POLICY "Usuários podem ver suas próprias transações" ON transacoes
  FOR ALL USING (auth.uid() = usuario_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_id ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_transacoes_updated_at 
  BEFORE UPDATE ON transacoes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Configuração do Sistema Financeiro</h1>
          <p className="text-lg text-gray-600">Siga os passos abaixo para configurar seu sistema financeiro pessoal</p>
        </div>

        <div className="space-y-6">
          {/* Passo 1: Criar projeto Supabase */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Criar Projeto no Supabase
                  </CardTitle>
                  <CardDescription>Crie uma conta gratuita e um novo projeto</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Acesse{" "}
                  <Link href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank">
                    supabase.com
                  </Link>
                </li>
                <li>Clique em "Start your project" e crie uma conta</li>
                <li>Clique em "New Project"</li>
                <li>Escolha um nome e senha para o banco de dados</li>
                <li>Aguarde a criação do projeto (pode levar alguns minutos)</li>
              </ol>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="https://supabase.com" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Supabase
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Passo 2: Configurar banco de dados */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <span className="text-sm font-semibold text-green-600">2</span>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Executar Script SQL
                  </CardTitle>
                  <CardDescription>Configure as tabelas e políticas de segurança</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>No painel do Supabase, vá para "SQL Editor"</li>
                <li>Clique em "New Query"</li>
                <li>Cole o script SQL abaixo</li>
                <li>Clique em "Run" para executar</li>
              </ol>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                  <code>{sqlScript}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-transparent"
                  onClick={() => copyToClipboard(sqlScript)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Passo 3: Configurar variáveis de ambiente */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-sm font-semibold text-purple-600">3</span>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Configurar Variáveis de Ambiente
                  </CardTitle>
                  <CardDescription>Adicione as chaves do seu projeto</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>No Supabase, vá para "Settings" → "API"</li>
                <li>Copie a "Project URL" e a "anon public" key</li>
                <li>
                  Crie um arquivo <Badge variant="secondary">.env.local</Badge> na raiz do projeto
                </li>
                <li>Adicione as variáveis conforme o exemplo abaixo</li>
              </ol>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                  <code>{`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-transparent"
                  onClick={() =>
                    copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui`)
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Importante:</strong> Substitua os valores de exemplo pelas suas chaves reais do Supabase.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Passo 4: Finalizar */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Configuração Concluída!</CardTitle>
                  <CardDescription>Reinicie o servidor e faça seu primeiro login</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento com{" "}
                  <Badge variant="secondary">npm run dev</Badge>
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <Link href="/login">Ir para Login</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/">Página Inicial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
