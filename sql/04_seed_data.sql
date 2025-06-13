-- =====================================================
-- CRM WhatsApp Manager - Dados Iniciais (Seeds)
-- Supabase PostgreSQL
-- =====================================================

-- =====================================================
-- INSERIR SERVIÇOS PADRÃO
-- =====================================================
INSERT INTO services (name, description, default_price, duration_minutes) VALUES
('Consulta inicial', 'Primeira consulta com avaliação completa', 150.00, 60),
('Acompanhamento', 'Consulta de acompanhamento regular', 100.00, 45),
('Acompanhamento mensal', 'Pacote de acompanhamento mensal', 300.00, 45),
('Pacote completo', 'Pacote completo de tratamento', 500.00, 90),
('Avaliação', 'Avaliação inicial sem compromisso', 80.00, 30),
('Consulta de retorno', 'Consulta de retorno pós-tratamento', 120.00, 45),
('Sessão de emergência', 'Atendimento de emergência', 200.00, 60)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INSERIR CLIENTES DE EXEMPLO
-- =====================================================
INSERT INTO clients (id, name, phone, email, status, origin, registration_date, last_contact, total_appointments, total_spent) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Maria Silva', '(11) 98765-4321', 'maria.silva@email.com', 'Ativo', 'Indicação', '2025-05-15', '2025-06-10', 5, 750.00),
('550e8400-e29b-41d4-a716-446655440002', 'João Oliveira', '(11) 91234-5678', 'joao.oliveira@email.com', 'Pendente', 'Redes Sociais', '2025-05-20', '2025-06-09', 3, 450.00),
('550e8400-e29b-41d4-a716-446655440003', 'Ana Santos', '(11) 99876-5432', 'ana.santos@email.com', 'Ativo', 'WhatsApp', '2025-05-10', '2025-06-08', 7, 1050.00),
('550e8400-e29b-41d4-a716-446655440004', 'Carlos Ferreira', '(11) 98877-6655', 'carlos.ferreira@email.com', 'Inativo', 'Outros', '2025-05-01', '2025-06-07', 2, 300.00),
('550e8400-e29b-41d4-a716-446655440005', 'Patrícia Lima', '(11) 97788-9900', 'patricia.lima@email.com', 'Ativo', 'Indicação', '2025-04-25', '2025-06-06', 4, 600.00),
('550e8400-e29b-41d4-a716-446655440006', 'Roberto Costa', '(11) 96677-8899', 'roberto.costa@email.com', 'Ativo', 'Redes Sociais', '2025-06-01', '2025-06-05', 2, 250.00),
('550e8400-e29b-41d4-a716-446655440007', 'Fernanda Alves', '(11) 95566-7788', 'fernanda.alves@email.com', 'Pendente', 'WhatsApp', '2025-05-28', '2025-06-04', 1, 150.00),
('550e8400-e29b-41d4-a716-446655440008', 'Lucas Pereira', '(11) 94455-6677', 'lucas.pereira@email.com', 'Ativo', 'Indicação', '2025-05-18', '2025-06-03', 3, 450.00),
('550e8400-e29b-41d4-a716-446655440009', 'Juliana Rocha', '(11) 93344-5566', 'juliana.rocha@email.com', 'Ativo', 'Outros', '2025-05-22', '2025-06-02', 6, 900.00),
('550e8400-e29b-41d4-a716-446655440010', 'Pedro Martins', '(11) 92233-4455', 'pedro.martins@email.com', 'Inativo', 'Redes Sociais', '2025-04-20', '2025-05-30', 1, 100.00)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSERIR AGENDAMENTOS DE EXEMPLO
-- =====================================================
INSERT INTO appointments (id, client_id, service_name, appointment_date, appointment_time, status, value, notes) VALUES
-- Agendamentos passados (concluídos)
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Consulta inicial', '2025-05-16', '10:00', 'Concluído', 150.00, 'Primeira consulta realizada com sucesso'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Acompanhamento', '2025-05-30', '14:30', 'Concluído', 100.00, 'Acompanhamento regular'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Consulta inicial', '2025-05-12', '09:15', 'Concluído', 150.00, 'Excelente primeira consulta'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Acompanhamento', '2025-05-25', '11:00', 'Concluído', 100.00, 'Progresso satisfatório'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Pacote completo', '2025-05-02', '15:30', 'Concluído', 500.00, 'Pacote completo iniciado'),

-- Agendamentos futuros
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Acompanhamento', '2025-06-15', '10:00', 'Confirmado', 100.00, 'Próximo acompanhamento'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Consulta inicial', '2025-06-16', '14:30', 'Agendado', 150.00, 'Primeira consulta agendada'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Acompanhamento mensal', '2025-06-18', '09:15', 'Confirmado', 300.00, 'Acompanhamento mensal'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', 'Avaliação', '2025-06-20', '11:00', 'Agendado', 80.00, 'Avaliação inicial'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', 'Acompanhamento', '2025-06-22', '15:30', 'Confirmado', 100.00, 'Acompanhamento regular'),

-- Agendamentos da semana atual
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440009', 'Consulta de retorno', '2025-06-12', '08:00', 'Confirmado', 120.00, 'Retorno pós-tratamento'),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440007', 'Consulta inicial', '2025-06-13', '16:00', 'Agendado', 150.00, 'Primeira consulta'),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Acompanhamento', '2025-06-14', '10:30', 'Cancelado', 100.00, 'Cliente cancelou')
ON CONFLICT (client_id, appointment_date, appointment_time) DO NOTHING;

-- =====================================================
-- INSERIR PAGAMENTOS DE EXEMPLO
-- =====================================================
INSERT INTO payments (id, client_id, appointment_id, service_name, value, due_date, payment_date, status, payment_method) VALUES
-- Pagamentos realizados
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Consulta inicial', 150.00, '2025-05-20', '2025-05-18', 'Pago', 'PIX'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Acompanhamento', 100.00, '2025-06-05', '2025-06-03', 'Pago', 'Cartão'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'Consulta inicial', 150.00, '2025-05-15', '2025-05-14', 'Pago', 'PIX'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 'Pacote completo', 500.00, '2025-05-10', '2025-05-08', 'Pago', 'Transferência'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440009', NULL, 'Consulta de retorno', 120.00, '2025-06-01', '2025-05-30', 'Pago', 'Dinheiro'),

-- Pagamentos pendentes
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440007', 'Consulta inicial', 150.00, '2025-06-20', NULL, 'Pendente', NULL),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 'Acompanhamento mensal', 300.00, '2025-06-25', NULL, 'Pendente', NULL),
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440009', 'Avaliação', 80.00, '2025-06-22', NULL, 'Pendente', NULL),

-- Pagamentos em atraso
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', NULL, 'Acompanhamento', 100.00, '2025-06-05', NULL, 'Atrasado', NULL),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', NULL, 'Consulta inicial', 150.00, '2025-06-08', NULL, 'Atrasado', NULL),
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010', NULL, 'Acompanhamento', 100.00, '2025-05-25', NULL, 'Atrasado', NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- INSERIR HISTÓRICO DE INTERAÇÕES
-- =====================================================
INSERT INTO client_history (client_id, interaction_type, description, interaction_date, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'call', 'Ligação para confirmação de consulta', '2025-05-15 09:30:00', '{"duration": "5 min", "outcome": "confirmed"}'),
('550e8400-e29b-41d4-a716-446655440001', 'whatsapp', 'Mensagem de lembrete enviada', '2025-05-29 18:00:00', '{"message_type": "reminder", "appointment_date": "2025-05-30"}'),
('550e8400-e29b-41d4-a716-446655440002', 'whatsapp', 'Cliente entrou em contato via WhatsApp', '2025-05-19 14:20:00', '{"message_type": "inquiry", "topic": "scheduling"}'),
('550e8400-e29b-41d4-a716-446655440003', 'email', 'Email de boas-vindas enviado', '2025-05-10 10:00:00', '{"email_type": "welcome", "template": "new_client"}'),
('550e8400-e29b-41d4-a716-446655440003', 'call', 'Ligação de follow-up pós-consulta', '2025-05-13 16:45:00', '{"duration": "8 min", "satisfaction": "high"}'),
('550e8400-e29b-41d4-a716-446655440004', 'note', 'Cliente demonstrou interesse em retomar tratamento', '2025-06-01 11:00:00', '{"priority": "medium", "follow_up_date": "2025-06-15"}'),
('550e8400-e29b-41d4-a716-446655440005', 'whatsapp', 'Agradecimento pelo atendimento', '2025-05-03 20:30:00', '{"message_type": "feedback", "rating": "5"}'),
('550e8400-e29b-41d4-a716-446655440006', 'call', 'Primeira ligação de contato', '2025-06-01 15:15:00', '{"duration": "12 min", "outcome": "scheduled"}'),
('550e8400-e29b-41d4-a716-446655440007', 'whatsapp', 'Cliente solicitou informações sobre preços', '2025-05-28 19:45:00', '{"message_type": "inquiry", "topic": "pricing"}'),
('550e8400-e29b-41d4-a716-446655440008', 'email', 'Envio de material educativo', '2025-05-20 08:30:00', '{"email_type": "educational", "material": "care_guide"}'),
('550e8400-e29b-41d4-a716-446655440009', 'note', 'Cliente muito satisfeito com resultados', '2025-06-02 17:00:00', '{"satisfaction": "very_high", "referral_potential": "high"}'),
('550e8400-e29b-41d4-a716-446655440010', 'call', 'Tentativa de reativação - sem sucesso', '2025-05-30 14:00:00', '{"duration": "3 min", "outcome": "no_answer"}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ATUALIZAR ESTATÍSTICAS DOS CLIENTES
-- =====================================================
-- Esta função será executada automaticamente pelos triggers,
-- mas vamos executar manualmente para garantir consistência inicial
SELECT update_client_stats(id) FROM clients;

-- =====================================================
-- ATUALIZAR PAGAMENTOS EM ATRASO
-- =====================================================
SELECT update_overdue_payments();