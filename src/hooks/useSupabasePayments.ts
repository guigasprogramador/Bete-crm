// =====================================================
// CRM WhatsApp Manager - Hook para Pagamentos com Supabase
// =====================================================

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addPayment: (payment: PaymentInsert) => Promise<boolean>;
  updatePayment: (id: string, payment: PaymentUpdate) => Promise<boolean>;
  deletePayment: (id: string) => Promise<boolean>;
  markAsPaid: (id: string, method: string, date?: string) => Promise<boolean>;
  refreshPayments: () => Promise<void>;
  getPaymentById: (id: string) => Payment | undefined;
  getPaymentsByClient: (clientId: string) => Payment[];
  getOverduePayments: () => Payment[];
  searchPayments: (filters?: SearchFilters) => Promise<any[]>;
  getPaymentStats: () => PaymentStats;
}

interface SearchFilters {
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  overdueOnly?: boolean;
  limit?: number;
  offset?: number;
}

interface PaymentStats {
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
}

export const useSupabasePayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar pagamentos iniciais
  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('payments')
        .select(`
          *,
          clients!inner(
            id,
            name,
            phone,
            email
          ),
          appointments(
            id,
            appointment_date,
            appointment_time
          )
        `)
        .order('due_date', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setPayments(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar pagamento
  const addPayment = async (paymentData: PaymentInsert): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de pagamentos
      await loadPayments();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao adicionar pagamento:', err);
      return false;
    }
  };

  // Atualizar pagamento
  const updatePayment = async (id: string, paymentData: PaymentUpdate): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de pagamentos
      await loadPayments();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao atualizar pagamento:', err);
      return false;
    }
  };

  // Deletar pagamento
  const deletePayment = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de pagamentos
      await loadPayments();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao deletar pagamento:', err);
      return false;
    }
  };

  // Marcar pagamento como pago
  const markAsPaid = async (id: string, method: string, date?: string): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .rpc('mark_payment_as_paid', {
          p_payment_id: id,
          p_payment_method: method,
          p_payment_date: date || new Date().toISOString().split('T')[0]
        });

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de pagamentos
      await loadPayments();
      return data === true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao marcar pagamento como pago:', err);
      return false;
    }
  };

  // Buscar pagamentos com filtros avançados
  const searchPayments = async (filters: SearchFilters = {}): Promise<any[]> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .rpc('search_payments', {
          p_status: filters.status || null,
          p_client_id: filters.clientId || null,
          p_date_from: filters.dateFrom || null,
          p_date_to: filters.dateTo || null,
          p_overdue_only: filters.overdueOnly || false,
          p_limit: filters.limit || 50,
          p_offset: filters.offset || 0
        });

      if (supabaseError) {
        throw supabaseError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao buscar pagamentos:', err);
      return [];
    }
  };

  // Atualizar lista de pagamentos
  const refreshPayments = async () => {
    await loadPayments();
  };

  // Buscar pagamento por ID
  const getPaymentById = (id: string): Payment | undefined => {
    return payments.find(payment => payment.id === id);
  };

  // Buscar pagamentos por cliente
  const getPaymentsByClient = (clientId: string): Payment[] => {
    return payments.filter(payment => payment.client_id === clientId);
  };

  // Buscar pagamentos em atraso
  const getOverduePayments = (): Payment[] => {
    const today = new Date().toISOString().split('T')[0];
    return payments.filter(payment => 
      payment.status === 'Atrasado' || 
      (payment.status === 'Pendente' && payment.due_date < today)
    );
  };

  // Calcular estatísticas de pagamentos
  const getPaymentStats = (): PaymentStats => {
    const stats = payments.reduce(
      (acc, payment) => {
        acc.totalRevenue += payment.value;
        acc.totalPayments += 1;

        switch (payment.status) {
          case 'Pago':
            acc.paidAmount += payment.value;
            acc.paidPayments += 1;
            break;
          case 'Pendente':
            acc.pendingAmount += payment.value;
            acc.pendingPayments += 1;
            break;
          case 'Atrasado':
            acc.overdueAmount += payment.value;
            acc.overduePayments += 1;
            break;
        }

        return acc;
      },
      {
        totalRevenue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        totalPayments: 0,
        paidPayments: 0,
        pendingPayments: 0,
        overduePayments: 0
      }
    );

    return stats;
  };

  // Filtrar pagamentos localmente por termo de busca
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      payment.service_name.toLowerCase().includes(term) ||
      payment.status.toLowerCase().includes(term) ||
      (payment.payment_method && payment.payment_method.toLowerCase().includes(term)) ||
      (payment.notes && payment.notes.toLowerCase().includes(term))
    );
  });

  // Carregar pagamentos na inicialização
  useEffect(() => {
    loadPayments();
  }, []);

  // Configurar real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Mudança detectada na tabela payments:', payload);
          // Recarregar pagamentos quando houver mudanças
          loadPayments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Atualizar pagamentos em atraso periodicamente
  useEffect(() => {
    const updateOverduePayments = async () => {
      try {
        await supabase.rpc('update_overdue_payments');
        await loadPayments();
      } catch (err) {
        console.error('Erro ao atualizar pagamentos em atraso:', err);
      }
    };

    // Executar na inicialização
    updateOverduePayments();

    // Executar a cada hora
    const interval = setInterval(updateOverduePayments, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    payments: filteredPayments,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    addPayment,
    updatePayment,
    deletePayment,
    markAsPaid,
    refreshPayments,
    getPaymentById,
    getPaymentsByClient,
    getOverduePayments,
    searchPayments,
    getPaymentStats
  };
};

export default useSupabasePayments;