-- =====================================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO E POLÍTICAS RLS
-- =====================================================

-- Habilitar RLS nas tabelas (caso tenha sido desabilitado)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA USUÁRIOS AUTENTICADOS
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "clients_policy" ON clients;
DROP POLICY IF EXISTS "services_policy" ON services;
DROP POLICY IF EXISTS "appointments_policy" ON appointments;
DROP POLICY IF EXISTS "payments_policy" ON payments;
DROP POLICY IF EXISTS "client_history_policy" ON client_history;

-- Políticas para CLIENTS
CREATE POLICY "clients_authenticated_access" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para SERVICES
CREATE POLICY "services_authenticated_access" ON services
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para APPOINTMENTS
CREATE POLICY "appointments_authenticated_access" ON appointments
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para PAYMENTS
CREATE POLICY "payments_authenticated_access" ON payments
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para CLIENT_HISTORY
CREATE POLICY "client_history_authenticated_access" ON client_history
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- CONFIGURAÇÕES ADICIONAIS DE AUTENTICAÇÃO
-- =====================================================

-- Permitir que usuários vejam seus próprios dados de perfil
-- (Supabase já gerencia isso automaticamente)

-- Configurar confirmação de email (opcional)
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- =====================================================
-- FUNÇÕES AUXILIARES PARA AUTENTICAÇÃO
-- =====================================================

-- Função para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Função para verificar se o usuário está autenticado
CREATE OR REPLACE FUNCTION auth.is_authenticated()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT auth.role() = 'authenticated';
$$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Este arquivo configura a autenticação para o CRM WhatsApp Manager
-- 
-- IMPORTANTE:
-- 1. Execute este script APÓS configurar a autenticação no Supabase Dashboard
-- 2. Certifique-se de que o email confirmation está configurado corretamente
-- 3. As políticas RLS garantem que apenas usuários autenticados acessem os dados
-- 4. Para desenvolvimento, você pode usar o arquivo disable_rls_dev.sql temporariamente
--
-- PRÓXIMOS PASSOS:
-- 1. Configure o Supabase Auth no Dashboard
-- 2. Ative a confirmação por email se necessário
-- 3. Configure provedores de autenticação adicionais (Google, GitHub, etc.) se desejado
-- 4. Teste o login/registro na aplicação