"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [step, setStep] = useState(1)

  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const sqlScript = `-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  tipo_usuario TEXT DEFAULT 'usuario' CHECK (tipo_usuario IN ('admin', 'usuario')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_transacao DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.historico_acoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_acoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver próprios dados" ON public.usuarios
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar próprios dados" ON public.usuarios
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Permitir inserção de usuários" ON public.usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem ver próprias transações" ON public.transacoes
  FOR ALL USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem ver próprio histórico" ON public.historico_acoes
  FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar usuários existentes
  SELECT COUNT(*) INTO user_count FROM public.usuarios;
  
  -- Inserir novo usuário
  INSERT INTO public.usuarios (id, email, nome, tipo_usuario)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'usuario' END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuração do Sistema Financeiro</h1>
          <p className="mt-2 text-gray-600">Configure o Supabase para começar a usar o sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Passo 1: Criar projeto Supabase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                Criar Projeto Supabase
              </CardTitle>
              <CardDescription>Crie uma conta e projeto no Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  1. Acesse{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    className="text-blue-500 hover:underline inline-flex items-center gap-1"
                    rel="noreferrer"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="text-sm text-gray-600">2. Crie uma conta gratuita</p>
                <p className="text-sm text-gray-600">3. Crie um novo projeto</p>
                <p className="text-sm text-gray-600">4. Anote a URL e a chave anônima</p>
              </div>
            </CardContent>
          </Card>

          {/* Passo 2: Configurar variáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                Configurar Variáveis
              </CardTitle>
              <CardDescription>Insira as credenciais do seu projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">URL do Supabase</Label>
                <Input
                  id="supabase-url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://seu-projeto.supabase.co"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase-key">Chave Anônima</Label>
                <Input
                  id="supabase-key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>

              {supabaseUrl && supabaseKey && (
                <div className="mt-4">
                  <Label>Arquivo .env.local</Label>
                  <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm font-mono relative">
                    <pre>{envContent}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(envContent)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Copie este conteúdo para o arquivo .env.local na raiz do projeto
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passo 3: Executar SQL */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                Executar Script SQL
              </CardTitle>
              <CardDescription>Execute este script no SQL Editor do Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto max-h-96">
                    {sqlScript}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={() => copyToClipboard(sqlScript)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    1. Vá para o SQL Editor no painel do Supabase
                    <br />
                    2. Cole e execute este script
                    <br />
                    3. Reinicie a aplicação após configurar as variáveis
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Passo 4: Finalizar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Sistema Pronto!
              </CardTitle>
              <CardDescription>Após configurar tudo, você poderá usar o sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Funcionalidades disponíveis:</strong>
                    <br />• Controle de receitas e despesas
                    <br />• Dashboard com estatísticas
                    <br />• Histórico com filtros avançados
                    <br />• Exportação para CSV
                    <br />• Gerenciamento de usuários
                    <br />• Sistema de permissões
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <Button asChild>
                    <a href="/login">Ir para Login</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
