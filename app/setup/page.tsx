'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [showEnvContent, setShowEnvContent] = useState(false)
  const { toast } = useToast()

  const envContent = supabaseUrl && supabaseKey ? 
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}` :
    `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Configuração do Sistema Financeiro</h1>
          <p className="text-gray-600">Configure sua integração com Supabase para persistência de dados</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo Demo Ativo:</strong> O sistema já funciona perfeitamente sem configuração! 
            Os dados são salvos localmente no seu navegador. A configuração do Supabase é opcional para sincronização na nuvem.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Criar Projeto Supabase
              </CardTitle>
              <CardDescription>
                Crie uma conta gratuita no Supabase e configure seu projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">1. Acesse o Supabase e crie uma conta</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://supabase.com', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Supabase
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">2. Crie um novo projeto</p>
                <p className="text-sm text-gray-600">3. Anote a URL e a chave anônima do projeto</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Configurar Variáveis
              </CardTitle>
              <CardDescription>
                Insira suas credenciais do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">URL do Supabase</Label>
                <Input
                  id="supabase-url"
                  placeholder="https://seu-projeto.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supabase-key">Chave Anônima</Label>
                <Input
                  id="supabase-key"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>

              <Button 
                onClick={() => setShowEnvContent(true)}
                className="w-full"
                disabled={!supabaseUrl || !supabaseKey}
              >
                Gerar Configuração
              </Button>
            </CardContent>
          </Card>
        </div>

        {showEnvContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                Arquivo .env.local
              </CardTitle>
              <CardDescription>
                Copie este conteúdo para seu arquivo .env.local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm relative">
                <pre className="whitespace-pre-wrap">{envContent}</pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envContent)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Crie um arquivo <code>.env.local</code> na raiz do projeto e cole este conteúdo.
                  Reinicie o servidor de desenvolvimento após salvar.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              Executar Scripts SQL
            </CardTitle>
            <CardDescription>
              Configure as tabelas no seu banco Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Execute os scripts SQL na pasta <code>/scripts</code> no editor SQL do Supabase:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm">01-create-tables.sql</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('-- Execute este script no editor SQL do Supabase')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm">02-create-functions.sql</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('-- Execute este script após o primeiro')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Execute os scripts na ordem correta. O primeiro cria as tabelas, o segundo cria as funções.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Sistema Pronto!
            </CardTitle>
            <CardDescription className="text-green-700">
              Seu sistema financeiro está configurado e funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-green-700">
                ✅ Interface responsiva e moderna<br/>
                ✅ Gestão completa de transações<br/>
                ✅ Controle de orçamentos por categoria<br/>
                ✅ Metas financeiras com progresso<br/>
                ✅ Relatórios detalhados e estatísticas<br/>
                ✅ Persistência local (localStorage)<br/>
                {supabaseUrl && supabaseKey && '✅ Sincronização na nuvem (Supabase)'}
              </p>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/'}
              >
                Ir para o Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
