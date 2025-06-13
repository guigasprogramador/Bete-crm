-- =====================================================
-- CRM WhatsApp Manager - Views e Relatórios
-- Supabase PostgreSQL
-- =====================================================

-- =====================================================
-- VIEW: Dashboard Statistics
-- =====================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    -- Estatísticas de Clientes
    (SELECT COUNT(*) FROM clients WHERE status = 'Ativo') as active_clients,
    (SELECT COUNT(*) FROM clients WHERE registration_date >= CURRENT_DATE - INTERVAL '7 days') as new_clients_week,
    (SELECT COUNT(*) FROM clients) as total_clients,
    
    -- Estatísticas de Agendamentos
    (SELECT COUNT(*) FROM appointments WHERE status NOT IN ('Cancelado')) as total_appointments,
    (SELECT COUNT(*) FROM appointments WHERE appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('Cancelado')) as appointments_this_week,
    (SELECT COUNT(*) FROM appointments WHERE status = 'Concluído') as completed_appointments,
    (SELECT COUNT(*) FROM appointments WHERE status = 'Concluído' AND appointment_date >= CURRENT_DATE - INTERVAL '30 days') as completed_this_month,
    
    -- Estatísticas Financeiras
    (SELECT COALESCE(SUM(value), 0) FROM payments WHERE status = 'Pago') as total_revenue,
    (SELECT COALESCE(SUM(value), 0) FROM payments WHERE status = 'Pago' AND payment_date >= DATE_TRUNC('month', CURRENT_DATE)) as revenue_this_month,
    (SELECT COALESCE(SUM(value), 0) FROM payments WHERE status = 'Pendente') as pending_revenue,
    (SELECT COALESCE(SUM(value), 0) FROM payments WHERE status = 'Atrasado') as overdue_revenue;

-- =====================================================
-- VIEW: Client Details with Stats
-- =====================================================
CREATE OR REPLACE VIEW client_details AS
SELECT 
    c.*,
    COALESCE(a.appointment_count, 0) as appointment_count,
    COALESCE(a.last_appointment, NULL) as last_appointment_date,
    COALESCE(p.total_paid, 0) as total_paid_amount,
    COALESCE(p.total_pending, 0) as total_pending_amount,
    COALESCE(p.last_payment, NULL) as last_payment_date,
    CASE 
        WHEN c.last_contact < CURRENT_DATE - INTERVAL '30 days' THEN 'Inativo há mais de 30 dias'
        WHEN c.last_contact < CURRENT_DATE - INTERVAL '15 days' THEN 'Sem contato há 15+ dias'
        ELSE 'Ativo'
    END as contact_status
FROM clients c
LEFT JOIN (
    SELECT 
        client_id,
        COUNT(*) as appointment_count,
        MAX(appointment_date) as last_appointment
    FROM appointments 
    WHERE status = 'Concluído'
    GROUP BY client_id
) a ON c.id = a.client_id
LEFT JOIN (
    SELECT 
        client_id,
        SUM(CASE WHEN status = 'Pago' THEN value ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'Pendente' THEN value ELSE 0 END) as total_pending,
        MAX(CASE WHEN status = 'Pago' THEN payment_date ELSE NULL END) as last_payment
    FROM payments
    GROUP BY client_id
) p ON c.id = p.client_id;

-- =====================================================
-- VIEW: Appointment Calendar
-- =====================================================
CREATE OR REPLACE VIEW appointment_calendar AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.service_name,
    a.value,
    a.notes,
    c.name as client_name,
    c.phone as client_phone,
    c.email as client_email,
    s.duration_minutes,
    EXTRACT(DOW FROM a.appointment_date) as day_of_week,
    TO_CHAR(a.appointment_date, 'DD/MM/YYYY') as formatted_date,
    TO_CHAR(a.appointment_time, 'HH24:MI') as formatted_time
FROM appointments a
JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
ORDER BY a.appointment_date, a.appointment_time;

-- =====================================================
-- VIEW: Payment Summary
-- =====================================================
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    p.*,
    c.name as client_name,
    c.phone as client_phone,
    c.email as client_email,
    TO_CHAR(p.due_date, 'DD/MM/YYYY') as formatted_due_date,
    TO_CHAR(p.payment_date, 'DD/MM/YYYY') as formatted_payment_date,
    CASE 
        WHEN p.status = 'Pendente' AND p.due_date < CURRENT_DATE THEN 'Atrasado'
        ELSE p.status
    END as current_status,
    CASE 
        WHEN p.status = 'Pendente' AND p.due_date < CURRENT_DATE THEN CURRENT_DATE - p.due_date
        ELSE 0
    END as days_overdue
FROM payments p
JOIN clients c ON p.client_id = c.id
ORDER BY p.due_date DESC;

-- =====================================================
-- VIEW: Monthly Revenue Report
-- =====================================================
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', payment_date) as month,
    TO_CHAR(DATE_TRUNC('month', payment_date), 'MM/YYYY') as month_year,
    COUNT(*) as payment_count,
    SUM(value) as total_revenue,
    AVG(value) as average_payment,
    COUNT(DISTINCT client_id) as unique_clients
FROM payments 
WHERE status = 'Pago' AND payment_date IS NOT NULL
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- =====================================================
-- VIEW: Client Origin Analysis
-- =====================================================
CREATE OR REPLACE VIEW client_origin_stats AS
SELECT 
    origin,
    COUNT(*) as client_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clients), 2) as percentage,
    AVG(total_spent) as avg_spent_per_client,
    SUM(total_spent) as total_revenue_by_origin
FROM clients
GROUP BY origin
ORDER BY client_count DESC;

-- =====================================================
-- VIEW: Service Performance
-- =====================================================
CREATE OR REPLACE VIEW service_performance AS
SELECT 
    a.service_name,
    COUNT(*) as appointment_count,
    COUNT(DISTINCT a.client_id) as unique_clients,
    AVG(a.value) as average_price,
    SUM(a.value) as total_revenue,
    ROUND(COUNT(CASE WHEN a.status = 'Concluído' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate,
    ROUND(COUNT(CASE WHEN a.status = 'Cancelado' THEN 1 END) * 100.0 / COUNT(*), 2) as cancellation_rate
FROM appointments a
GROUP BY a.service_name
ORDER BY appointment_count DESC;

-- =====================================================
-- VIEW: Client Activity Timeline
-- =====================================================
CREATE OR REPLACE VIEW client_activity_timeline AS
SELECT 
    ch.client_id,
    c.name as client_name,
    ch.interaction_type,
    ch.description,
    ch.interaction_date,
    ch.metadata,
    TO_CHAR(ch.interaction_date, 'DD/MM/YYYY HH24:MI') as formatted_date
FROM client_history ch
JOIN clients c ON ch.client_id = c.id
ORDER BY ch.interaction_date DESC;

-- =====================================================
-- VIEW: Overdue Payments Report
-- =====================================================
CREATE OR REPLACE VIEW overdue_payments_report AS
SELECT 
    p.id,
    c.name as client_name,
    c.phone as client_phone,
    c.email as client_email,
    p.service_name,
    p.value,
    p.due_date,
    CURRENT_DATE - p.due_date as days_overdue,
    TO_CHAR(p.due_date, 'DD/MM/YYYY') as formatted_due_date,
    CASE 
        WHEN CURRENT_DATE - p.due_date <= 7 THEN 'Recente'
        WHEN CURRENT_DATE - p.due_date <= 30 THEN 'Moderado'
        ELSE 'Crítico'
    END as urgency_level
FROM payments p
JOIN clients c ON p.client_id = c.id
WHERE p.status = 'Pendente' AND p.due_date < CURRENT_DATE
ORDER BY p.due_date ASC;

-- =====================================================
-- VIEW: Weekly Schedule
-- =====================================================
CREATE OR REPLACE VIEW weekly_schedule AS
SELECT 
    a.appointment_date,
    TO_CHAR(a.appointment_date, 'Day') as day_name,
    a.appointment_time,
    a.service_name,
    a.status,
    c.name as client_name,
    c.phone as client_phone,
    a.value,
    EXTRACT(DOW FROM a.appointment_date) as day_number
FROM appointments a
JOIN clients c ON a.client_id = c.id
WHERE a.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
AND a.status NOT IN ('Cancelado')
ORDER BY a.appointment_date, a.appointment_time;

-- =====================================================
-- VIEW: Top Clients by Revenue
-- =====================================================
CREATE OR REPLACE VIEW top_clients_revenue AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    c.registration_date,
    c.total_appointments,
    c.total_spent,
    COALESCE(p.total_paid, 0) as verified_total_paid,
    COALESCE(p.pending_amount, 0) as pending_amount,
    ROUND(COALESCE(p.total_paid, 0) / NULLIF(c.total_appointments, 0), 2) as avg_per_appointment
FROM clients c
LEFT JOIN (
    SELECT 
        client_id,
        SUM(CASE WHEN status = 'Pago' THEN value ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'Pendente' THEN value ELSE 0 END) as pending_amount
    FROM payments
    GROUP BY client_id
) p ON c.id = p.client_id
WHERE c.total_spent > 0
ORDER BY c.total_spent DESC
LIMIT 20;