-- =====================================================
-- CRM WhatsApp Manager - Stored Procedures e Funções Utilitárias
-- Supabase PostgreSQL
-- =====================================================

-- =====================================================
-- FUNÇÃO: Buscar clientes com filtros avançados
-- =====================================================
CREATE OR REPLACE FUNCTION search_clients(
    p_search_term TEXT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_origin VARCHAR(50) DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(20),
    origin VARCHAR(50),
    registration_date DATE,
    last_contact DATE,
    total_appointments INTEGER,
    total_spent DECIMAL(10,2),
    contact_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.id,
        cd.name,
        cd.phone,
        cd.email,
        cd.status,
        cd.origin,
        cd.registration_date,
        cd.last_contact,
        cd.total_appointments,
        cd.total_spent,
        cd.contact_status
    FROM client_details cd
    WHERE 
        (p_search_term IS NULL OR (
            cd.name ILIKE '%' || p_search_term || '%' OR
            cd.phone ILIKE '%' || p_search_term || '%' OR
            cd.email ILIKE '%' || p_search_term || '%'
        ))
        AND (p_status IS NULL OR cd.status = p_status)
        AND (p_origin IS NULL OR cd.origin = p_origin)
        AND (p_date_from IS NULL OR cd.registration_date >= p_date_from)
        AND (p_date_to IS NULL OR cd.registration_date <= p_date_to)
    ORDER BY cd.last_contact DESC, cd.name
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Buscar agendamentos com filtros
-- =====================================================
CREATE OR REPLACE FUNCTION search_appointments(
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_client_id UUID DEFAULT NULL,
    p_service_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    appointment_date DATE,
    appointment_time TIME,
    service_name VARCHAR(255),
    status VARCHAR(20),
    value DECIMAL(10,2),
    formatted_date TEXT,
    formatted_time TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.client_name,
        ac.client_phone,
        ac.appointment_date,
        ac.appointment_time,
        ac.service_name,
        ac.status,
        ac.value,
        ac.formatted_date,
        ac.formatted_time
    FROM appointment_calendar ac
    WHERE 
        (p_date_from IS NULL OR ac.appointment_date >= p_date_from)
        AND (p_date_to IS NULL OR ac.appointment_date <= p_date_to)
        AND (p_status IS NULL OR ac.status = p_status)
        AND (p_client_id IS NULL OR EXISTS (
            SELECT 1 FROM appointments a 
            WHERE a.id = ac.id AND a.client_id = p_client_id
        ))
        AND (p_service_name IS NULL OR ac.service_name ILIKE '%' || p_service_name || '%')
    ORDER BY ac.appointment_date, ac.appointment_time
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Buscar pagamentos com filtros
-- =====================================================
CREATE OR REPLACE FUNCTION search_payments(
    p_status VARCHAR(20) DEFAULT NULL,
    p_client_id UUID DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_overdue_only BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    service_name VARCHAR(255),
    value DECIMAL(10,2),
    due_date DATE,
    payment_date DATE,
    current_status VARCHAR(20),
    payment_method VARCHAR(50),
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.client_name,
        ps.client_phone,
        ps.service_name,
        ps.value,
        ps.due_date,
        ps.payment_date,
        ps.current_status,
        ps.payment_method,
        ps.days_overdue
    FROM payment_summary ps
    WHERE 
        (p_status IS NULL OR ps.current_status = p_status)
        AND (p_client_id IS NULL OR EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.id = ps.id AND p.client_id = p_client_id
        ))
        AND (p_date_from IS NULL OR ps.due_date >= p_date_from)
        AND (p_date_to IS NULL OR ps.due_date <= p_date_to)
        AND (p_overdue_only = FALSE OR ps.days_overdue > 0)
    ORDER BY ps.due_date DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Criar agendamento completo
-- =====================================================
CREATE OR REPLACE FUNCTION create_appointment_with_payment(
    p_client_id UUID,
    p_service_name VARCHAR(255),
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_value DECIMAL(10,2),
    p_notes TEXT DEFAULT NULL,
    p_payment_due_date DATE DEFAULT NULL
)
RETURNS TABLE(
    appointment_id UUID,
    payment_id UUID
) AS $$
DECLARE
    v_appointment_id UUID;
    v_payment_id UUID;
    v_service_id UUID;
BEGIN
    -- Buscar service_id se existir
    SELECT id INTO v_service_id 
    FROM services 
    WHERE name = p_service_name AND active = true
    LIMIT 1;
    
    -- Criar agendamento
    INSERT INTO appointments (
        client_id, 
        service_id, 
        service_name, 
        appointment_date, 
        appointment_time, 
        value, 
        notes
    )
    VALUES (
        p_client_id,
        v_service_id,
        p_service_name,
        p_appointment_date,
        p_appointment_time,
        p_value,
        p_notes
    )
    RETURNING id INTO v_appointment_id;
    
    -- Criar pagamento se data de vencimento foi fornecida
    IF p_payment_due_date IS NOT NULL THEN
        INSERT INTO payments (
            client_id,
            appointment_id,
            service_name,
            value,
            due_date
        )
        VALUES (
            p_client_id,
            v_appointment_id,
            p_service_name,
            p_value,
            p_payment_due_date
        )
        RETURNING id INTO v_payment_id;
    END IF;
    
    RETURN QUERY SELECT v_appointment_id, v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Marcar pagamento como pago
-- =====================================================
CREATE OR REPLACE FUNCTION mark_payment_as_paid(
    p_payment_id UUID,
    p_payment_method VARCHAR(50),
    p_payment_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_client_id UUID;
BEGIN
    -- Atualizar pagamento
    UPDATE payments 
    SET 
        status = 'Pago',
        payment_method = p_payment_method,
        payment_date = p_payment_date
    WHERE id = p_payment_id
    RETURNING client_id INTO v_client_id;
    
    -- Verificar se a atualização foi bem-sucedida
    IF v_client_id IS NOT NULL THEN
        -- Atualizar estatísticas do cliente
        PERFORM update_client_stats(v_client_id);
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Cancelar agendamento
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_appointment(
    p_appointment_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_client_id UUID;
    v_client_name VARCHAR(255);
BEGIN
    -- Atualizar agendamento
    UPDATE appointments 
    SET 
        status = 'Cancelado',
        notes = COALESCE(notes || ' | ', '') || 'Cancelado: ' || COALESCE(p_reason, 'Sem motivo informado')
    WHERE id = p_appointment_id
    RETURNING client_id INTO v_client_id;
    
    -- Verificar se a atualização foi bem-sucedida
    IF v_client_id IS NOT NULL THEN
        -- Buscar nome do cliente
        SELECT name INTO v_client_name FROM clients WHERE id = v_client_id;
        
        -- Criar entrada no histórico
        PERFORM create_client_history_entry(
            v_client_id,
            'appointment',
            'Agendamento cancelado: ' || COALESCE(p_reason, 'Sem motivo informado'),
            jsonb_build_object(
                'appointment_id', p_appointment_id,
                'reason', p_reason,
                'cancelled_at', NOW()
            )
        );
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Obter agenda do dia
-- =====================================================
CREATE OR REPLACE FUNCTION get_daily_schedule(
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    appointment_id UUID,
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    appointment_time TIME,
    service_name VARCHAR(255),
    status VARCHAR(20),
    value DECIMAL(10,2),
    notes TEXT,
    duration_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        c.name,
        c.phone,
        a.appointment_time,
        a.service_name,
        a.status,
        a.value,
        a.notes,
        COALESCE(s.duration_minutes, 60) as duration_minutes
    FROM appointments a
    JOIN clients c ON a.client_id = c.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date = p_date
    AND a.status NOT IN ('Cancelado')
    ORDER BY a.appointment_time;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Relatório de performance mensal
-- =====================================================
CREATE OR REPLACE FUNCTION get_monthly_performance(
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS TABLE(
    metric VARCHAR(50),
    value DECIMAL(10,2),
    count_value INTEGER,
    percentage DECIMAL(5,2)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_appointments INTEGER;
    v_total_clients INTEGER;
BEGIN
    v_start_date := DATE(p_year || '-' || p_month || '-01');
    v_end_date := v_start_date + INTERVAL '1 month' - INTERVAL '1 day';
    
    -- Contar totais para percentuais
    SELECT COUNT(*) INTO v_total_appointments 
    FROM appointments 
    WHERE appointment_date BETWEEN v_start_date AND v_end_date;
    
    SELECT COUNT(DISTINCT client_id) INTO v_total_clients 
    FROM appointments 
    WHERE appointment_date BETWEEN v_start_date AND v_end_date;
    
    RETURN QUERY
    -- Receita total
    SELECT 
        'receita_total'::VARCHAR(50),
        COALESCE(SUM(p.value), 0),
        0,
        0::DECIMAL(5,2)
    FROM payments p
    WHERE p.status = 'Pago' 
    AND p.payment_date BETWEEN v_start_date AND v_end_date
    
    UNION ALL
    
    -- Agendamentos concluídos
    SELECT 
        'agendamentos_concluidos'::VARCHAR(50),
        0::DECIMAL(10,2),
        COUNT(*)::INTEGER,
        ROUND(COUNT(*) * 100.0 / NULLIF(v_total_appointments, 0), 2)
    FROM appointments
    WHERE status = 'Concluído'
    AND appointment_date BETWEEN v_start_date AND v_end_date
    
    UNION ALL
    
    -- Taxa de cancelamento
    SELECT 
        'taxa_cancelamento'::VARCHAR(50),
        0::DECIMAL(10,2),
        COUNT(*)::INTEGER,
        ROUND(COUNT(*) * 100.0 / NULLIF(v_total_appointments, 0), 2)
    FROM appointments
    WHERE status = 'Cancelado'
    AND appointment_date BETWEEN v_start_date AND v_end_date
    
    UNION ALL
    
    -- Novos clientes
    SELECT 
        'novos_clientes'::VARCHAR(50),
        0::DECIMAL(10,2),
        COUNT(*)::INTEGER,
        0::DECIMAL(5,2)
    FROM clients
    WHERE registration_date BETWEEN v_start_date AND v_end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Limpar dados antigos (manutenção)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_data(
    p_days_to_keep INTEGER DEFAULT 365
)
RETURNS TABLE(
    table_name TEXT,
    deleted_count INTEGER
) AS $$
DECLARE
    v_cutoff_date DATE;
    v_deleted_history INTEGER;
BEGIN
    v_cutoff_date := CURRENT_DATE - INTERVAL '1 day' * p_days_to_keep;
    
    -- Limpar histórico antigo
    DELETE FROM client_history 
    WHERE interaction_date < v_cutoff_date;
    
    GET DIAGNOSTICS v_deleted_history = ROW_COUNT;
    
    RETURN QUERY
    SELECT 'client_history'::TEXT, v_deleted_history;
    
    -- Adicionar outras limpezas conforme necessário
END;
$$ LANGUAGE plpgsql;