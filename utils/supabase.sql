-- Script de Migração e Otimização para Supabase
-- Versão 2: Idempotente e segura para estruturas existentes.

-- ========= HABILITAÇÃO DE RLS E EXTENSÕES =========
-- Garante que a extensão para UUIDs está ativa.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========= TABELA DE PERFIS (USUÁRIOS) =========
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Funcionário')),
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Reprovado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.profiles;
CREATE POLICY "Enable all access for authenticated users" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');


-- ========= TABELA DE PRODUTOS =========
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Pizza', 'Bebida', 'Adicional')),
    description TEXT,
    price DECIMAL(10, 2),
    sizes JSONB,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.products;
CREATE POLICY "Enable all access for authenticated users" ON public.products FOR ALL USING (auth.role() = 'authenticated');


-- ========= TABELA DE CLIENTES =========
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    location_link TEXT,
    order_count INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    last_order_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.customers;
CREATE POLICY "Enable all access for authenticated users" ON public.customers FOR ALL USING (auth.role() = 'authenticated');


-- ========= TABELA DE PEDIDOS (ORDERS) =========
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Recebido' CHECK (status IN ('Recebido', 'Preparando', 'Pronto', 'Em Entrega', 'Entregue', 'Cancelado')),
    order_type VARCHAR(50) CHECK (order_type IN ('Retirada', 'Entrega')),
    notes TEXT,
    timestamp VARCHAR(5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona colunas de forma segura (apenas se não existirem)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_id') THEN
    ALTER TABLE public.orders ADD COLUMN customer_id UUID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_id') THEN
    ALTER TABLE public.orders ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='address') THEN
    ALTER TABLE public.orders ADD COLUMN address TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='location_link') THEN
    ALTER TABLE public.orders ADD COLUMN location_link TEXT;
  END IF;
  -- Adicione aqui outras colunas que possam estar faltando em `orders`
END;
$$;

-- Adiciona chaves estrangeiras de forma segura
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_id_fkey') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_fkey') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- Cria índices
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Habilita RLS e cria políticas
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.orders;
CREATE POLICY "Enable all access for authenticated users" ON public.orders FOR ALL USING (auth.role() = 'authenticated');


-- ========= TABELA DE NOTIFICAÇÕES =========
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    target_roles TEXT[] NOT NULL,
    created_at TIMESTAMTz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for target roles" ON public.notifications;
-- Nota: A política de RLS para notificações requer uma configuração adicional no JWT, o que será abordado no código do app.
-- Por enquanto, permitiremos a leitura para todos os autenticados para evitar erros.
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.notifications;
CREATE POLICY "Enable read for authenticated" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated');


-- ========= TABELA DE CONFIGURAÇÕES =========
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY,
    base_prices JSONB,
    size_availability JSONB
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.settings;
CREATE POLICY "Enable all access for authenticated users" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- Inserção de configurações padrão (apenas se a tabela estiver vazia)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.settings) THEN
    INSERT INTO public.settings (id, base_prices, size_availability)
    VALUES (
      1,
      '{ "pequeno": 20.00, "medio": 25.00, "grande": 30.00, "GG": 35.00 }',
      '{ "pequeno": true, "medio": true, "grande": true, "GG": true }'
    );
  END IF;
END;
$$;
