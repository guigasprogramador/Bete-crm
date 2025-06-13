// =====================================================
// CRM WhatsApp Manager - Configuração Supabase
// =====================================================

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// =====================================================
// TIPOS TYPESCRIPT PARA AS TABELAS
// =====================================================

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          status: 'Ativo' | 'Pendente' | 'Inativo';
          origin: 'Indicação' | 'Redes Sociais' | 'WhatsApp' | 'Outros';
          registration_date: string;
          last_contact: string;
          total_appointments: number;
          total_spent: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          status?: 'Ativo' | 'Pendente' | 'Inativo';
          origin?: 'Indicação' | 'Redes Sociais' | 'WhatsApp' | 'Outros';
          registration_date?: string;
          last_contact?: string;
          total_appointments?: number;
          total_spent?: number;
          notes?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          status?: 'Ativo' | 'Pendente' | 'Inativo';
          origin?: 'Indicação' | 'Redes Sociais' | 'WhatsApp' | 'Outros';
          registration_date?: string;
          last_contact?: string;
          total_appointments?: number;
          total_spent?: number;
          notes?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description?: string;
          default_price: number;
          duration_minutes: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          default_price: number;
          duration_minutes?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          default_price?: number;
          duration_minutes?: number;
          active?: boolean;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          service_id?: string;
          service_name: string;
          appointment_date: string;
          appointment_time: string;
          status: 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado';
          value: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          service_id?: string;
          service_name: string;
          appointment_date: string;
          appointment_time: string;
          status?: 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado';
          value: number;
          notes?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          service_id?: string;
          service_name?: string;
          appointment_date?: string;
          appointment_time?: string;
          status?: 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado';
          value?: number;
          notes?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          client_id: string;
          appointment_id?: string;
          service_name: string;
          value: number;
          due_date: string;
          payment_date?: string;
          status: 'Pago' | 'Pendente' | 'Atrasado';
          payment_method?: 'PIX' | 'Boleto' | 'Cartão' | 'Transferência' | 'Dinheiro';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          appointment_id?: string;
          service_name: string;
          value: number;
          due_date: string;
          payment_date?: string;
          status?: 'Pago' | 'Pendente' | 'Atrasado';
          payment_method?: 'PIX' | 'Boleto' | 'Cartão' | 'Transferência' | 'Dinheiro';
          notes?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          appointment_id?: string;
          service_name?: string;
          value?: number;
          due_date?: string;
          payment_date?: string;
          status?: 'Pago' | 'Pendente' | 'Atrasado';
          payment_method?: 'PIX' | 'Boleto' | 'Cartão' | 'Transferência' | 'Dinheiro';
          notes?: string;
        };
      };
      client_history: {
        Row: {
          id: string;
          client_id: string;
          interaction_type: 'call' | 'whatsapp' | 'email' | 'appointment' | 'payment' | 'note';
          description: string;
          interaction_date: string;
          created_by?: string;
          metadata?: any;
        };
        Insert: {
          id?: string;
          client_id: string;
          interaction_type: 'call' | 'whatsapp' | 'email' | 'appointment' | 'payment' | 'note';
          description: string;
          interaction_date?: string;
          created_by?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          client_id?: string;
          interaction_type?: 'call' | 'whatsapp' | 'email' | 'appointment' | 'payment' | 'note';
          description?: string;
          interaction_date?: string;
          created_by?: string;
          metadata?: any;
        };
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          active_clients: number;
          new_clients_week: number;
          total_clients: number;
          total_appointments: number;
          appointments_this_week: number;
          completed_appointments: number;
          completed_this_month: number;
          total_revenue: number;
          revenue_this_month: number;
          pending_revenue: number;
          overdue_revenue: number;
        };
      };
      client_details: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          status: string;
          origin: string;
          registration_date: string;
          last_contact: string;
          total_appointments: number;
          total_spent: number;
          appointment_count: number;
          last_appointment_date?: string;
          total_paid_amount: number;
          total_pending_amount: number;
          last_payment_date?: string;
          contact_status: string;
        };
      };
    };
    Functions: {
      search_clients: {
        Args: {
          p_search_term?: string;
          p_status?: string;
          p_origin?: string;
          p_date_from?: string;
          p_date_to?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          name: string;
          phone: string;
          email: string;
          status: string;
          origin: string;
          registration_date: string;
          last_contact: string;
          total_appointments: number;
          total_spent: number;
          contact_status: string;
        }[];
      };
      search_appointments: {
        Args: {
          p_date_from?: string;
          p_date_to?: string;
          p_status?: string;
          p_client_id?: string;
          p_service_name?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          client_name: string;
          client_phone: string;
          appointment_date: string;
          appointment_time: string;
          service_name: string;
          status: string;
          value: number;
          formatted_date: string;
          formatted_time: string;
        }[];
      };
      mark_payment_as_paid: {
        Args: {
          p_payment_id: string;
          p_payment_method: string;
          p_payment_date?: string;
        };
        Returns: boolean;
      };
      create_appointment_with_payment: {
        Args: {
          p_client_id: string;
          p_service_name: string;
          p_appointment_date: string;
          p_appointment_time: string;
          p_value: number;
          p_notes?: string;
          p_payment_due_date?: string;
        };
        Returns: {
          appointment_id: string;
          payment_id: string;
        }[];
      };
    };
  };
}

// Tipo para o cliente Supabase tipado
export type SupabaseClient = typeof supabase;

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

// Função para formatar erros do Supabase
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Erro desconhecido ao conectar com o banco de dados';
};

// Função para verificar conexão
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return { success: true, message: 'Conexão estabelecida com sucesso' };
  } catch (error) {
    return { 
      success: false, 
      message: handleSupabaseError(error) 
    };
  }
};

// Função para converter valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para converter string monetária para número
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

// Função para formatar data
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// Função para formatar data e hora
export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('pt-BR');
};

export default supabase;