# 🚀 Guia de Integração - CRM WhatsApp Manager com Supabase

## 📋 Visão Geral do Projeto

O **CRM WhatsApp Manager** é um sistema completo de gestão de clientes e agendamentos desenvolvido em React/TypeScript com integração ao Supabase PostgreSQL. O sistema oferece funcionalidades completas de CRUD para clientes, agendamentos, pagamentos e relatórios.

## 🏗️ Arquitetura do Sistema

### Frontend (React + TypeScript)
- **Framework**: React 18 com Vite
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Query + Custom Hooks
- **Routing**: React Router DOM
- **Forms**: React Hook Form

### Backend (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (se necessário)
- **Edge Functions**: Para lógicas complexas

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `clients` - Gestão de Clientes
```sql
- id (UUID, PK)
- name (VARCHAR) - Nome do cliente
- phone (VARCHAR) - Telefone
- email (VARCHAR) - Email
- status (ENUM) - Ativo, Pendente, Inativo
- origin (ENUM) - Indicação, Redes Sociais, WhatsApp, Outros
- registration_date (DATE) - Data de cadastro
- last_contact (DATE) - Último contato
- total_appointments (INTEGER) - Total de agendamentos
- total_spent (DECIMAL) - Total gasto
- notes (TEXT) - Observações
```

#### 2. `services` - Catálogo de Serviços
```sql
- id (UUID, PK)
- name (VARCHAR) - Nome do serviço
- description (TEXT) - Descrição
- default_price (DECIMAL) - Preço padrão
- duration_minutes (INTEGER) - Duração em minutos
- active (BOOLEAN) - Ativo/Inativo
```

#### 3. `appointments` - Agendamentos
```sql
- id (UUID, PK)
- client_id (UUID, FK) - Referência ao cliente
- service_id (UUID, FK) - Referência ao serviço
- service_name (VARCHAR) - Nome do serviço
- appointment_date (DATE) - Data do agendamento
- appointment_time (TIME) - Horário
- status (ENUM) - Agendado, Confirmado, Concluído, Cancelado
- value (DECIMAL) - Valor do serviço
- notes (TEXT) - Observações
```

#### 4. `payments` - Controle de Pagamentos
```sql
- id (UUID, PK)
- client_id (UUID, FK) - Referência ao cliente
- appointment_id (UUID, FK) - Referência ao agendamento
- service_name (VARCHAR) - Nome do serviço
- value (DECIMAL) - Valor
- due_date (DATE) - Data de vencimento
- payment_date (DATE) - Data do pagamento
- status (ENUM) - Pago, Pendente, Atrasado
- payment_method (ENUM) - PIX, Boleto, Cartão, etc.
- notes (TEXT) - Observações
```

#### 5. `client_history` - Histórico de Interações
```sql
- id (UUID, PK)
- client_id (UUID, FK) - Referência ao cliente
- interaction_type (ENUM) - call, whatsapp, email, appointment, payment, note
- description (TEXT) - Descrição da interação
- interaction_date (TIMESTAMP) - Data/hora da interação
- created_by (VARCHAR) - Usuário que criou
- metadata (JSONB) - Dados adicionais
```

## 🔧 Funcionalidades Implementadas

### 📊 Dashboard
- ✅ **Estatísticas Gerais**: Total de clientes, agendamentos, receita
- ✅ **Métricas Semanais**: Novos clientes, agendamentos da semana
- ✅ **Indicadores Financeiros**: Receita mensal, valores pendentes, atrasados
- ✅ **Clientes Recentes**: Lista dos últimos clientes cadastrados
- ✅ **Gráficos**: Receita mensal, performance de serviços

### 👥 Gestão de Clientes
- ✅ **CRUD Completo**: Criar, visualizar, editar, excluir clientes
- ✅ **Busca Avançada**: Por nome, telefone, email
- ✅ **Filtros**: Por status (Ativo, Pendente, Inativo) e origem
- ✅ **Histórico**: Registro de todas as interações
- ✅ **Estatísticas**: Total gasto, número de agendamentos
- ✅ **Ações Rápidas**: Ligar, enviar WhatsApp, email
- ✅ **Exportação**: Dados para CSV/PDF

### 📅 Agenda e Agendamentos
- ✅ **Visualizações**: Calendário mensal e lista
- ✅ **CRUD de Agendamentos**: Criar, editar, cancelar
- ✅ **Filtros**: Por data, status, cliente, serviço
- ✅ **Verificação de Conflitos**: Evita agendamentos simultâneos
- ✅ **Status**: Agendado, Confirmado, Concluído, Cancelado
- ✅ **Agenda Diária**: Visualização dos agendamentos do dia
- ✅ **Notificações**: Lembretes automáticos

### 💰 Controle de Pagamentos
- ✅ **CRUD de Pagamentos**: Criar, editar, marcar como pago
- ✅ **Status Automático**: Atualização de pagamentos em atraso
- ✅ **Métodos de Pagamento**: PIX, Boleto, Cartão, Transferência, Dinheiro
- ✅ **Filtros**: Por status, cliente, período
- ✅ **Relatórios**: Receita, pendências, inadimplência
- ✅ **Integração**: Vinculação com agendamentos

### 📈 Relatórios e Analytics
- ✅ **Relatório de Clientes**: Por origem, status, período
- ✅ **Performance de Serviços**: Mais vendidos, receita por serviço
- ✅ **Relatórios Financeiros**: Receita mensal, anual, comparativos
- ✅ **Análise de Agendamentos**: Taxa de conclusão, cancelamentos
- ✅ **Exportação**: PDF, CSV, Excel
- ✅ **Dashboards Visuais**: Gráficos e métricas

## 🛠️ Configuração e Instalação

### 1. Configuração do Supabase

#### Passo 1: Executar Scripts SQL
Execute os arquivos SQL na seguinte ordem no SQL Editor do Supabase:

```bash
1. sql/01_create_tables.sql      # Criação das tabelas
2. sql/02_functions_triggers.sql # Funções e triggers
3. sql/03_views_reports.sql      # Views para relatórios
4. sql/04_seed_data.sql          # Dados de exemplo (opcional)
5. sql/05_security_policies.sql  # Políticas de segurança
6. sql/06_stored_procedures.sql  # Procedimentos armazenados
```

#### Passo 2: Configurar Autenticação
1. Acesse **Authentication > Settings** no Supabase
2. Configure os provedores desejados (Email, Google, etc.)
3. Defina as URLs de redirecionamento
4. Configure templates de email

### 2. Configuração do Frontend

#### Passo 1: Instalar Dependências
```bash
npm install @supabase/supabase-js
```

#### Passo 2: Configurar Variáveis de Ambiente
O arquivo `.env.local` já está configurado com suas credenciais:
```env
VITE_SUPABASE_URL=https://katsiwvrfolsnkwwnnkx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Passo 3: Integrar Hooks do Supabase
Substitua os hooks existentes pelos novos hooks do Supabase:

```typescript
// Antes (hooks mockados)
import { useClients } from './hooks/useClients';
import { useAppointments } from './hooks/useAppointments';
import { usePayments } from './hooks/usePayments';

// Depois (hooks com Supabase)
import { useSupabaseClients } from './hooks/useSupabaseClients';
import { useSupabaseAppointments } from './hooks/useSupabaseAppointments';
import { useSupabasePayments } from './hooks/useSupabasePayments';
import { useSupabaseDashboard } from './hooks/useSupabaseDashboard';
```

## 🔄 Migração dos Componentes

### 1. Atualizar Páginas Principais

#### Dashboard.tsx
```typescript
// Substituir
const { clients } = useClients();
const { appointments } = useAppointments();
const { payments } = usePayments();

// Por
const { 
  stats, 
  recentClients, 
  monthlyRevenue, 
  loading, 
  error 
} = useSupabaseDashboard();
```

#### Clients.tsx
```typescript
// Substituir
const { 
  clients, 
  addClient, 
  updateClient, 
  deleteClient 
} = useClients();

// Por
const { 
  clients, 
  addClient, 
  updateClient, 
  deleteClient,
  searchClients,
  loading,
  error
} = useSupabaseClients();
```

#### Schedule.tsx
```typescript
// Substituir
const { 
  appointments, 
  addAppointment, 
  updateAppointment, 
  deleteAppointment 
} = useAppointments();

// Por
const { 
  appointments, 
  addAppointment, 
  updateAppointment, 
  deleteAppointment,
  cancelAppointment,
  getDailySchedule,
  createAppointmentWithPayment,
  loading,
  error
} = useSupabaseAppointments();
```

#### Payments.tsx
```typescript
// Substituir
const { 
  payments, 
  addPayment, 
  updatePayment, 
  deletePayment, 
  markAsPaid 
} = usePayments();

// Por
const { 
  payments, 
  addPayment, 
  updatePayment, 
  deletePayment, 
  markAsPaid,
  getPaymentStats,
  getOverduePayments,
  loading,
  error
} = useSupabasePayments();
```

### 2. Adicionar Tratamento de Erros

Em todos os componentes, adicione tratamento de erros:

```typescript
const { data, loading, error } = useSupabaseHook();

// Mostrar loading
if (loading) {
  return <div>Carregando...</div>;
}

// Mostrar erro
if (error) {
  return (
    <div className="text-red-500">
      Erro: {error}
      <button onClick={refresh}>Tentar novamente</button>
    </div>
  );
}
```

### 3. Implementar Real-time Updates

Os hooks já incluem subscriptions em tempo real. Para componentes específicos:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('custom_channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'clients'
    }, (payload) => {
      // Atualizar estado local
      console.log('Mudança detectada:', payload);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## 🔐 Segurança e Autenticação

### Row Level Security (RLS)
Todas as tabelas têm RLS habilitado com políticas que permitem:
- **SELECT**: Usuários autenticados podem visualizar dados
- **INSERT**: Usuários autenticados podem inserir dados
- **UPDATE**: Usuários autenticados podem atualizar dados
- **DELETE**: Usuários autenticados podem deletar dados

### Implementar Autenticação

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
```

## 📱 Funcionalidades Avançadas

### 1. Notificações Push
```typescript
// Implementar notificações para:
- Novos agendamentos
- Pagamentos em atraso
- Lembretes de consulta
- Aniversários de clientes
```

### 2. Integração WhatsApp
```typescript
// Usar API do WhatsApp Business para:
- Enviar lembretes automáticos
- Confirmar agendamentos
- Enviar cobranças
- Marketing direto
```

### 3. Relatórios Avançados
```typescript
// Implementar:
- Exportação para PDF/Excel
- Gráficos interativos
- Análises preditivas
- Dashboards personalizados
```

## 🚀 Deploy e Produção

### 1. Build do Projeto
```bash
npm run build
```

### 2. Deploy no Vercel/Netlify
```bash
# Configurar variáveis de ambiente
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

### 3. Configurar Domínio Personalizado
- Configure DNS
- Adicione domínio no Supabase
- Configure SSL

## 🔧 Manutenção e Monitoramento

### 1. Backup Automático
- Configure backups diários no Supabase
- Implemente rotinas de backup local

### 2. Monitoramento
- Use Supabase Dashboard para métricas
- Configure alertas de erro
- Monitore performance das queries

### 3. Atualizações
- Mantenha dependências atualizadas
- Teste em ambiente de staging
- Implemente CI/CD

## 📞 Suporte e Documentação

### Recursos Úteis
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação React](https://react.dev)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

### Solução de Problemas
1. **Erro de Conexão**: Verifique credenciais do Supabase
2. **Erro de Permissão**: Revise políticas RLS
3. **Performance Lenta**: Analise queries e índices
4. **Erro de Build**: Verifique dependências e tipos

---

**🎉 Parabéns! Seu CRM WhatsApp Manager está pronto para uso!**

O sistema agora possui uma base sólida e escalável, com todas as funcionalidades necessárias para gerenciar clientes, agendamentos e pagamentos de forma eficiente.