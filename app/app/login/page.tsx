'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/'); // já logado → volta para home
    });
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      if (modo === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        setMsg('Cadastro criado. Verifique seu e-mail (se a confirmação estiver ativa).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        router.replace('/');
      }
    } catch (err: any) {
      setMsg(err.message ?? 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {modo === 'login' ? 'Entrar' : 'Criar conta'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Seu e-mail"
          className="w-full border rounded-xl p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Senha"
          className="w-full border rounded-xl p-3"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button disabled={loading} className="w-full rounded-xl p-3 border">
          {loading ? 'Aguarde...' : (modo === 'login' ? 'Entrar' : 'Cadastrar')}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm">{msg}</p>}

      <div className="mt-4 text-sm">
        {modo === 'login' ? (
          <button className="underline" onClick={() => setModo('signup')}>
            Não tem conta? Cadastre-se
          </button>
        ) : (
          <button className="underline" onClick={() => setModo('login')}>
            Já tem conta? Entrar
          </button>
        )}
      </div>
    </main>
  );
}

import InteracoesPanel from '@/components/InteracoesPanel';

export default function Home() {
  return (
    <main>
      <InteracoesPanel />
    </main>
  );
}
