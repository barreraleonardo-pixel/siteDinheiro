-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS public.transacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    valor DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.metas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    valor_alvo DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) DEFAULT 0,
    data_limite DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orcamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL,
    limite DECIMAL(10,2) NOT NULL,
    gasto_atual DECIMAL(10,2) DEFAULT 0,
    mes_ano VARCHAR(7) NOT NULL, -- formato YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, categoria, mes_ano)
);

-- Enable Row Level Security
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own transacoes" ON public.transacoes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transacoes" ON public.transacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transacoes" ON public.transacoes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transacoes" ON public.transacoes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metas" ON public.metas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metas" ON public.metas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metas" ON public.metas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metas" ON public.metas
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orcamentos" ON public.orcamentos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orcamentos" ON public.orcamentos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orcamentos" ON public.orcamentos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orcamentos" ON public.orcamentos
    FOR DELETE USING (auth.uid() = user_id);
