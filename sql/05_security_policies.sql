-- =====================================================
-- CRM WhatsApp Manager - Políticas de Segurança (RLS)
-- Supabase PostgreSQL
-- =====================================================

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA TABELA: clients
-- =====================================================

-- Política para leitura (SELECT)
CREATE POLICY "Users can view all clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (INSERT)
CREATE POLICY "Users can insert clients" ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (UPDATE)
CREATE POLICY "Users can update clients" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (DELETE)
CREATE POLICY "Users can delete clients" ON clients
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS PARA TABELA: services
-- =====================================================

-- Política para leitura (SELECT)
CREATE POLICY "Users can view all services" ON services
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (INSERT)
CREATE POLICY "Users can insert services" ON services
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (UPDATE)
CREATE POLICY "Users can update services" ON services
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (DELETE)
CREATE POLICY "Users can delete services" ON services
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS PARA TABELA: appointments
-- =====================================================

-- Política para leitura (SELECT)
CREATE POLICY "Users can view all appointments" ON appointments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (INSERT)
CREATE POLICY "Users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (UPDATE)
CREATE POLICY "Users can update appointments" ON appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (DELETE)
CREATE POLICY "Users can delete appointments" ON appointments
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS PARA TABELA: payments
-- =====================================================

-- Política para leitura (SELECT)
CREATE POLICY "Users can view all payments" ON payments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (INSERT)
CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (UPDATE)
CREATE POLICY "Users can update payments" ON payments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (DELETE)
CREATE POLICY "Users can delete payments" ON payments
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS PARA TABELA: client_history
-- =====================================================

-- Política para leitura (SELECT)
CREATE POLICY "Users can view all client history" ON client_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (INSERT)
CREATE POLICY "Users can insert client history" ON client_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (UPDATE)
CREATE POLICY "Users can update client history" ON client_history
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (DELETE)
CREATE POLICY "Users can delete client history" ON client_history
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS MAIS RESTRITIVAS (OPCIONAL)
-- =====================================================
-- Caso queira implementar controle por usuário no futuro,
-- descomente e ajuste as políticas abaixo:

/*
-- Exemplo: Política baseada em user_id (requer coluna user_id nas tabelas)

-- Para clients
DROP POLICY IF EXISTS "Users can view all clients" ON clients;
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (user_id = auth.uid());
*/

-- =====================================================
-- PERMISSÕES PARA USUÁRIOS ANÔNIMOS (PÚBLICO)
-- =====================================================
-- Por segurança, não permitimos acesso anônimo
-- Todas as operações requerem autenticação

-- =====================================================
-- PERMISSÕES PARA VIEWS
-- =====================================================
-- As views herdam as permissões das tabelas base,
-- mas podemos criar políticas específicas se necessário

-- Permitir acesso às views para usuários autenticados
GRANT SELECT ON dashboard_stats TO authenticated;
GRANT SELECT ON client_details TO authenticated;
GRANT SELECT ON appointment_calendar TO authenticated;
GRANT SELECT ON payment_summary TO authenticated;
GRANT SELECT ON monthly_revenue TO authenticated;
GRANT SELECT ON client_origin_stats TO authenticated;
GRANT SELECT ON service_performance TO authenticated;
GRANT SELECT ON client_activity_timeline TO authenticated;
GRANT SELECT ON overdue_payments_report TO authenticated;
GRANT SELECT ON weekly_schedule TO authenticated;
GRANT SELECT ON top_clients_revenue TO authenticated;

-- =====================================================
-- PERMISSÕES PARA FUNÇÕES
-- =====================================================
-- Permitir execução das funções para usuários autenticados
GRANT EXECUTE ON FUNCTION update_client_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_overdue_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION create_client_history_entry(UUID, VARCHAR(50), TEXT, JSONB) TO authenticated;

-- =====================================================
-- CONFIGURAÇÕES ADICIONAIS DE SEGURANÇA
-- =====================================================

-- Configurar timeout para conexões
-- ALTER SYSTEM SET statement_timeout = '30s';

-- Configurar limite de conexões por usuário
-- ALTER SYSTEM SET max_connections_per_user = 10;

-- =====================================================
-- AUDITORIA E LOGS (OPCIONAL)
-- =====================================================
-- Para implementar auditoria completa, descomente:

/*
-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers de auditoria
CREATE TRIGGER audit_clients
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
*/