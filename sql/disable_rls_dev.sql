-- CRM WhatsApp Manager - Desabilitar RLS para Desenvolvimento
-- Execute este script no Supabase SQL Editor para permitir acesso durante desenvolvimento
-- =====================================================

-- DESABILITAR ROW LEVEL SECURITY TEMPORARIAMENTE
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_history DISABLE ROW LEVEL SECURITY;

-- OU ALTERNATIVAMENTE, CRIAR POLÍTICAS PÚBLICAS PARA DESENVOLVIMENTO
-- (Descomente as linhas abaixo se preferir manter RLS ativo com acesso público)

/*
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view all clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients" ON clients;

DROP POLICY IF EXISTS "Users can view all services" ON services;
DROP POLICY IF EXISTS "Users can insert services" ON services;
DROP POLICY IF EXISTS "Users can update services" ON services;
DROP POLICY IF EXISTS "Users can delete services" ON services;

DROP POLICY IF EXISTS "Users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON appointments;

DROP POLICY IF EXISTS "Users can view all payments" ON payments;
DROP POLICY IF EXISTS "Users can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can update payments" ON payments;
DROP POLICY IF EXISTS "Users can delete payments" ON payments;

-- Criar políticas públicas para desenvolvimento
CREATE POLICY "Public access to clients" ON clients FOR ALL USING (true);
CREATE POLICY "Public access to services" ON services FOR ALL USING (true);
CREATE POLICY "Public access to appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Public access to payments" ON payments FOR ALL USING (true);
*/

-- NOTA: Lembre-se de reabilitar RLS em produção!
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE client_history ENABLE ROW LEVEL SECURITY;