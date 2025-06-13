-- =====================================================
-- CRM WhatsApp Manager - Estrutura de Banco de Dados
-- Supabase PostgreSQL
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: clients (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Pendente', 'Inativo')),
    origin VARCHAR(50) DEFAULT 'Indicação' CHECK (origin IN ('Indicação', 'Redes Sociais', 'WhatsApp', 'Outros')),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_contact DATE DEFAULT CURRENT_DATE,
    total_appointments INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: services (Serviços)
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    default_price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: appointments (Agendamentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    service_name VARCHAR(255) NOT NULL, -- Para casos onde o serviço pode ser customizado
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Concluído', 'Cancelado')),
    value DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_client_datetime UNIQUE (client_id, appointment_date, appointment_time)
);

-- =====================================================
-- TABELA: payments (Pagamentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    service_name VARCHAR(255) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Pendente', 'Atrasado')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('PIX', 'Boleto', 'Cartão', 'Transferência', 'Dinheiro')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: client_history (Histórico de Interações)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('call', 'whatsapp', 'email', 'appointment', 'payment', 'note')),
    description TEXT NOT NULL,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255), -- Para futuro controle de usuários
    metadata JSONB -- Para dados adicionais flexíveis
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_origin ON clients(origin);
CREATE INDEX IF NOT EXISTS idx_clients_registration_date ON clients(registration_date);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, appointment_time);

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Índices para client_history
CREATE INDEX IF NOT EXISTS idx_client_history_client_id ON client_history(client_id);
CREATE INDEX IF NOT EXISTS idx_client_history_type ON client_history(interaction_type);
CREATE INDEX IF NOT EXISTS idx_client_history_date ON client_history(interaction_date);

-- Índices para services
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);