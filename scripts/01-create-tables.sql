-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    foto TEXT,
    conta_principal_id UUID REFERENCES public.users(id),
    permissao VARCHAR(20) DEFAULT 'visualizacao' CHECK (permissao IN ('visualizacao', 'edicao')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico
CREATE TABLE IF NOT EXISTS public.historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    acao TEXT NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    tabela_afetada VARCHAR(100),
    registro_id VARCHAR(100),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de dados financeiros (para integrar com o sistema existente)
CREATE TABLE IF NOT EXISTS public.cartoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    dia_fechamento INTEGER NOT NULL,
    dia_pagamento INTEGER NOT NULL,
    limite DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    centro_custo VARCHAR(255),
    categoria VARCHAR(100),
    data_compra DATE NOT NULL,
    parcelas INTEGER DEFAULT 1,
    cartao_id UUID REFERENCES public.cartoes(id),
    observacoes TEXT,
    essencial BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_entrada DATE NOT NULL,
    centro_custo VARCHAR(255),
    categoria VARCHAR(100),
    recebido BOOLEAN DEFAULT false,
    data_recebimento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = auth_user_id OR conta_principal_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Main accounts can manage sub-users" ON public.users
    FOR ALL USING (
        auth.uid() = auth_user_id OR 
        conta_principal_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Políticas para histórico
CREATE POLICY "Users can view own history" ON public.historico
    FOR SELECT USING (usuario_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR conta_principal_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    ));

-- Políticas para dados financeiros
CREATE POLICY "Users can manage own financial data" ON public.cartoes
    FOR ALL USING (usuario_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR conta_principal_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage own expenses" ON public.despesas
    FOR ALL USING (usuario_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR conta_principal_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage own income" ON public.receitas
    FOR ALL USING (usuario_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid() OR conta_principal_id IN (
            SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
    ));
