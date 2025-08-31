import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Sistema Financeiro</CardTitle>
            <CardDescription>Configure o Supabase para habilitar autenticação e persistência de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Sistema funcionando em modo demo!</strong> Para habilitar todas as funcionalidades, configure o
                Supabase seguindo as instruções abaixo.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passo 1: Criar projeto no Supabase</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Acesse{" "}
                  <a
                    href="https://supabase.com"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    supabase.com
                  </a>
                </li>
                <li>Crie uma nova conta ou faça login</li>
                <li>Clique em "New Project"</li>
                <li>Escolha um nome e senha para o banco de dados</li>
                <li>Aguarde a criação do projeto</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passo 2: Configurar variáveis de ambiente</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>No painel do Supabase, vá em Settings → API</li>
                <li>Copie a "Project URL" e "anon public" key</li>
                <li>No arquivo .env.local, descomente e configure:</li>
              </ol>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passo 3: Executar scripts SQL</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>No painel do Supabase, vá em SQL Editor</li>
                <li>
                  Execute o conteúdo do arquivo <code>scripts/01-create-tables.sql</code>
                </li>
                <li>
                  Execute o conteúdo do arquivo <code>scripts/02-create-functions.sql</code>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passo 4: Configurar autenticação</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>No painel do Supabase, vá em Authentication → Settings</li>
                <li>
                  Configure "Site URL" como: <code>http://localhost:3000</code> (desenvolvimento)
                </li>
                <li>Para produção, use sua URL do Vercel</li>
                <li>Habilite "Enable email confirmations" se desejar</li>
              </ol>
            </div>

            <div className="flex gap-4 pt-6">
              <Button asChild>
                <Link href="/">Continuar em Modo Demo</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://supabase.com" target="_blank" rel="noreferrer">
                  Abrir Supabase
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
