import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Erro de Autenticação</CardTitle>
          <CardDescription>Ocorreu um erro durante o processo de autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Não foi possível completar o processo de autenticação. Isso pode acontecer se o link de confirmação expirou
            ou já foi usado.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/login">Tentar Novamente</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/">Ir para Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
