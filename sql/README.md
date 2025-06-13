# CRM WhatsApp Manager - Configuração do Banco de Dados Supabase

## 📋 Visão Geral

Este diretório contém todos os scripts SQL necessários para configurar o banco de dados PostgreSQL do Supabase para o CRM WhatsApp Manager.

## 🗂️ Estrutura dos Arquivos SQL

### 1. `01_create_tables.sql`
**Descrição**: Criação das tabelas principais do sistema
- `clients` - Dados dos clientes
- `services` - Serviços oferecidos
- `appointments` - Agendamentos
- `payments` - Pagamentos
- `client_history` - Histórico de interações

### 2. `02_functions_triggers.sql`
**Descrição**: Funções e triggers automáticos
- Atualização automática de `updated_at`
- Atualização de estatísticas de clientes
- Verificação de conflitos de agendamento
- Criação automática de histórico
- Atualização de pagamentos em atraso

### 3. `03_views_reports.sql`
**Descrição**: Views para relatórios e consultas otimizadas
- `dashboard_stats` - Estatísticas do dashboard
- `client_details` - Detalhes completos dos clientes
- `appointment_calendar` - Calendário de agendamentos
- `payment_summary` - Resumo de pagamentos
- `monthly_revenue` - Receita mensal
- E outras views para relatórios

### 4. `04_seed_data.sql`
**Descrição**: Dados iniciais para teste
- Serviços padrão
- Clientes de exemplo
- Agendamentos de teste
- Pagamentos de exemplo
- Histórico de interações

### 5. `05_security_policies.sql`
**Descrição**: Políticas de segurança RLS (Row Level Security)
- Habilitação do RLS em todas as tabelas
- Políticas de acesso para usuários autenticados
- Permissões para views e funções

### 6. `06_stored_procedures.sql`
**Descrição**: Procedimentos armazenados e funções utilitárias
- Busca avançada de clientes
- Busca de agendamentos com filtros
- Busca de pagamentos
- Criação de agendamentos com pagamento
- Funções de relatórios
- Funções de manutenção

## 🚀 Como Executar

### Pré-requisitos
1. Conta no Supabase criada
2. Projeto Supabase configurado
3. Acesso ao SQL Editor do Supabase

### Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute os Scripts na Ordem**
   
   **⚠️ IMPORTANTE: Execute os arquivos na ordem numérica!**
   
   ```sql
   -- 1. Primeiro, execute o conteúdo de 01_create_tables.sql
   -- 2. Depois, execute o conteúdo de 02_functions_triggers.sql
   -- 3. Em seguida, execute o conteúdo de 03_views_reports.sql
   -- 4. Execute o conteúdo de 04_seed_data.sql (opcional, para dados de teste)
   -- 5. Execute o conteúdo de 05_security_policies.sql
   -- 6. Por último, execute o conteúdo de 06_stored_procedures.sql
   ```

4. **Verificar a Instalação**
   ```sql
   -- Verificar se as tabelas foram criadas
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Verificar se as views foram criadas
   SELECT table_name FROM information_schema.views 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Testar uma consulta simples
   SELECT * FROM dashboard_stats;
   ```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `clients`
- **Propósito**: Armazenar dados dos clientes
- **Campos principais**: nome, telefone, email, status, origem
- **Relacionamentos**: 1:N com appointments e payments

#### `services`
- **Propósito**: Catálogo de serviços oferecidos
- **Campos principais**: nome, descrição, preço padrão, duração
- **Relacionamentos**: 1:N com appointments

#### `appointments`
- **Propósito**: Gerenciar agendamentos
- **Campos principais**: data, hora, serviço, status, valor
- **Relacionamentos**: N:1 com clients e services, 1:1 com payments

#### `payments`
- **Propósito**: Controlar pagamentos
- **Campos principais**: valor, data vencimento, status, método
- **Relacionamentos**: N:1 com clients, 1:1 com appointments

#### `client_history`
- **Propósito**: Histórico de interações com clientes
- **Campos principais**: tipo interação, descrição, data
- **Relacionamentos**: N:1 com clients

### Views Principais

- **`dashboard_stats`**: Estatísticas gerais para o dashboard
- **`client_details`**: Visão completa dos clientes com estatísticas
- **`appointment_calendar`**: Calendário formatado de agendamentos
- **`payment_summary`**: Resumo de pagamentos com status
- **`monthly_revenue`**: Receita agrupada por mês

## 🔧 Configuração da Aplicação

### 1. Instalar Dependência do Supabase
```bash
npm install @supabase/supabase-js
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://katsiwvrfolsnkwwnnkx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdHNpd3ZyZm9sc25rd3dubmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDQyMzQsImV4cCI6MjA2NTQyMDIzNH0.blmo4dk4c7JrXjmPLHPk_bzV6ad_eeFiyCvr4lw4CAc
```

### 3. Usar o Cliente Supabase
O arquivo `src/lib/supabase.ts` já está configurado e pronto para uso.

## 🔒 Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Apenas usuários autenticados podem acessar os dados
- Políticas configuradas para operações CRUD

### Autenticação
- Configure a autenticação no Supabase Dashboard
- Habilite os provedores desejados (email, Google, etc.)
- Configure URLs de redirecionamento

## 📈 Funcionalidades Implementadas

### Dashboard
- ✅ Estatísticas de clientes (total, ativos, novos)
- ✅ Estatísticas de agendamentos (total, semana, concluídos)
- ✅ Estatísticas financeiras (receita total, mensal, pendente)
- ✅ Lista de clientes recentes

### Clientes
- ✅ CRUD completo de clientes
- ✅ Busca por nome, telefone, email
- ✅ Filtros por status e origem
- ✅ Histórico de interações
- ✅ Estatísticas por cliente

### Agenda
- ✅ CRUD de agendamentos
- ✅ Visualização em calendário
- ✅ Filtros por data, status, cliente
- ✅ Verificação de conflitos
- ✅ Agenda diária

### Pagamentos
- ✅ CRUD de pagamentos
- ✅ Controle de status (pago, pendente, atrasado)
- ✅ Múltiplos métodos de pagamento
- ✅ Relatórios financeiros
- ✅ Atualização automática de atrasos

### Relatórios
- ✅ Relatórios de clientes por origem
- ✅ Performance de serviços
- ✅ Receita mensal
- ✅ Pagamentos em atraso
- ✅ Estatísticas de agendamentos

## 🛠️ Manutenção

### Backup
- Configure backups automáticos no Supabase
- Exporte dados regularmente

### Monitoramento
- Use o dashboard do Supabase para monitorar performance
- Configure alertas para erros

### Limpeza de Dados
- Execute a função `cleanup_old_data()` periodicamente
- Monitore o crescimento das tabelas

## 🆘 Solução de Problemas

### Erro de Conexão
1. Verifique as credenciais do Supabase
2. Confirme se o projeto está ativo
3. Teste a conexão com `checkConnection()`

### Erro de Permissão
1. Verifique se o RLS está configurado corretamente
2. Confirme se o usuário está autenticado
3. Revise as políticas de segurança

### Performance Lenta
1. Verifique se os índices foram criados
2. Analise as consultas no SQL Editor
3. Use as views otimizadas para relatórios

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação do Supabase
2. Verifique os logs no dashboard
3. Teste as funções individualmente no SQL Editor

---

**Desenvolvido para CRM WhatsApp Manager**  
*Sistema completo de gestão de clientes e agendamentos*