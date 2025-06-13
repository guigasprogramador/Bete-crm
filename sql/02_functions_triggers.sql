-- =====================================================
-- CRM WhatsApp Manager - Funções e Triggers
-- Supabase PostgreSQL
-- =====================================================

-- =====================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS: updated_at para todas as tabelas
-- =====================================================
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Atualizar estatísticas do cliente
-- =====================================================
CREATE OR REPLACE FUNCTION update_client_stats(client_uuid UUID)
RETURNS VOID AS $$
DECLARE
    appointment_count INTEGER;
    total_spent_amount DECIMAL(10,2);
BEGIN
    -- Contar agendamentos concluídos
    SELECT COUNT(*) INTO appointment_count
    FROM appointments 
    WHERE client_id = client_uuid AND status = 'Concluído';
    
    -- Calcular total gasto (pagamentos confirmados)
    SELECT COALESCE(SUM(value), 0) INTO total_spent_amount
    FROM payments 
    WHERE client_id = client_uuid AND status = 'Pago';
    
    -- Atualizar cliente
    UPDATE clients 
    SET 
        total_appointments = appointment_count,
        total_spent = total_spent_amount,
        last_contact = CURRENT_DATE
    WHERE id = client_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Trigger para atualizar stats do cliente
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT e UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_client_stats(NEW.client_id);
        RETURN NEW;
    END IF;
    
    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM update_client_stats(OLD.client_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Atualizar stats do cliente
-- =====================================================
CREATE TRIGGER trigger_appointments_update_client_stats
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION trigger_update_client_stats();

CREATE TRIGGER trigger_payments_update_client_stats
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_update_client_stats();

-- =====================================================
-- FUNÇÃO: Atualizar status de pagamento em atraso
-- =====================================================
CREATE OR REPLACE FUNCTION update_overdue_payments()
RETURNS VOID AS $$
BEGIN
    UPDATE payments 
    SET status = 'Atrasado'
    WHERE status = 'Pendente' 
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Criar histórico automático
-- =====================================================
CREATE OR REPLACE FUNCTION create_client_history_entry(
    p_client_id UUID,
    p_interaction_type VARCHAR(50),
    p_description TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    history_id UUID;
BEGIN
    INSERT INTO client_history (client_id, interaction_type, description, metadata)
    VALUES (p_client_id, p_interaction_type, p_description, p_metadata)
    RETURNING id INTO history_id;
    
    RETURN history_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Trigger para criar histórico automático
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_create_history()
RETURNS TRIGGER AS $$
DECLARE
    description_text TEXT;
    metadata_json JSONB;
BEGIN
    -- Para appointments
    IF TG_TABLE_NAME = 'appointments' THEN
        IF TG_OP = 'INSERT' THEN
            description_text := 'Agendamento criado: ' || NEW.service_name || ' em ' || NEW.appointment_date || ' às ' || NEW.appointment_time;
            metadata_json := jsonb_build_object(
                'appointment_id', NEW.id,
                'service', NEW.service_name,
                'value', NEW.value,
                'status', NEW.status
            );
            PERFORM create_client_history_entry(NEW.client_id, 'appointment', description_text, metadata_json);
        ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
            description_text := 'Status do agendamento alterado de ' || OLD.status || ' para ' || NEW.status;
            metadata_json := jsonb_build_object(
                'appointment_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status
            );
            PERFORM create_client_history_entry(NEW.client_id, 'appointment', description_text, metadata_json);
        END IF;
    END IF;
    
    -- Para payments
    IF TG_TABLE_NAME = 'payments' THEN
        IF TG_OP = 'INSERT' THEN
            description_text := 'Cobrança criada: ' || NEW.service_name || ' - R$ ' || NEW.value;
            metadata_json := jsonb_build_object(
                'payment_id', NEW.id,
                'service', NEW.service_name,
                'value', NEW.value,
                'due_date', NEW.due_date
            );
            PERFORM create_client_history_entry(NEW.client_id, 'payment', description_text, metadata_json);
        ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
            description_text := 'Status do pagamento alterado de ' || OLD.status || ' para ' || NEW.status;
            IF NEW.status = 'Pago' THEN
                description_text := description_text || ' via ' || COALESCE(NEW.payment_method, 'método não informado');
            END IF;
            metadata_json := jsonb_build_object(
                'payment_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'payment_method', NEW.payment_method,
                'payment_date', NEW.payment_date
            );
            PERFORM create_client_history_entry(NEW.client_id, 'payment', description_text, metadata_json);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Criar histórico automático
-- =====================================================
CREATE TRIGGER trigger_appointments_history
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION trigger_create_history();

CREATE TRIGGER trigger_payments_history
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_create_history();

-- =====================================================
-- FUNÇÃO: Validar conflitos de agendamento
-- =====================================================
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Verificar se já existe agendamento no mesmo horário (exceto o próprio registro em caso de UPDATE)
    SELECT COUNT(*) INTO conflict_count
    FROM appointments 
    WHERE appointment_date = NEW.appointment_date 
    AND appointment_time = NEW.appointment_time
    AND status NOT IN ('Cancelado')
    AND (TG_OP = 'INSERT' OR id != NEW.id);
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Já existe um agendamento confirmado para este horário: % às %', NEW.appointment_date, NEW.appointment_time;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Validar conflitos de agendamento
-- =====================================================
CREATE TRIGGER trigger_check_appointment_conflict
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION check_appointment_conflict();