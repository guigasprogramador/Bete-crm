// =====================================================
// CRM WhatsApp Manager - Hook para Dashboard com Supabase
// =====================================================

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type DashboardStats = Database['public']['Views']['dashboard_stats']['Row'];

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentClients: any[];
  monthlyRevenue: any[];
  performanceData: any[];
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  getMonthlyPerformance: (year?: number, month?: number) => Promise<any[]>;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  appointments: number;
  clients: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  countValue: number;
  percentage: number;
}

export const useSupabaseDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar estatísticas do dashboard
  const loadDashboardStats = async () => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setStats(data);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar estatísticas do dashboard:', err);
    }
  };

  // Carregar clientes recentes
  const loadRecentClients = async () => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('client_details')
        .select('*')
        .order('registration_date', { ascending: false })
        .limit(5);

      if (supabaseError) {
        throw supabaseError;
      }

      setRecentClients(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar clientes recentes:', err);
    }
  };

  // Carregar receita mensal
  const loadMonthlyRevenue = async () => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('monthly_revenue')
        .select('*')
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .limit(12);

      if (supabaseError) {
        throw supabaseError;
      }

      // Transformar dados para o formato esperado pelo gráfico
      const formattedData: MonthlyRevenueData[] = (data || []).map(item => ({
        month: `${item.month_name}/${item.year}`,
        revenue: item.total_revenue || 0,
        appointments: item.total_appointments || 0,
        clients: item.unique_clients || 0
      }));

      setMonthlyRevenue(formattedData);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar receita mensal:', err);
    }
  };

  // Carregar dados de performance do mês atual
  const loadPerformanceData = async () => {
    try {
      setError(null);

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const { data, error: supabaseError } = await supabase
        .rpc('get_monthly_performance', {
          p_year: year,
          p_month: month
        });

      if (supabaseError) {
        throw supabaseError;
      }

      setPerformanceData(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar dados de performance:', err);
    }
  };

  // Obter performance mensal específica
  const getMonthlyPerformance = async (year?: number, month?: number): Promise<PerformanceMetric[]> => {
    try {
      setError(null);

      const currentDate = new Date();
      const targetYear = year || currentDate.getFullYear();
      const targetMonth = month || (currentDate.getMonth() + 1);

      const { data, error: supabaseError } = await supabase
        .rpc('get_monthly_performance', {
          p_year: targetYear,
          p_month: targetMonth
        });

      if (supabaseError) {
        throw supabaseError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao buscar performance mensal:', err);
      return [];
    }
  };

  // Carregar todos os dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        loadDashboardStats(),
        loadRecentClients(),
        loadMonthlyRevenue(),
        loadPerformanceData()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dashboard
  const refreshDashboard = async () => {
    await loadDashboardData();
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Configurar real-time subscriptions para atualizar automaticamente
  useEffect(() => {
    const subscriptions = [
      // Subscription para mudanças em clientes
      supabase
        .channel('dashboard_clients_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients'
          },
          () => {
            console.log('Mudança detectada em clientes - atualizando dashboard');
            loadDashboardStats();
            loadRecentClients();
          }
        )
        .subscribe(),

      // Subscription para mudanças em agendamentos
      supabase
        .channel('dashboard_appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          () => {
            console.log('Mudança detectada em agendamentos - atualizando dashboard');
            loadDashboardStats();
            loadPerformanceData();
          }
        )
        .subscribe(),

      // Subscription para mudanças em pagamentos
      supabase
        .channel('dashboard_payments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments'
          },
          () => {
            console.log('Mudança detectada em pagamentos - atualizando dashboard');
            loadDashboardStats();
            loadMonthlyRevenue();
            loadPerformanceData();
          }
        )
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    };
  }, []);

  // Atualizar dados periodicamente (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Atualizando dados do dashboard automaticamente');
      loadDashboardData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    stats,
    recentClients,
    monthlyRevenue,
    performanceData,
    loading,
    error,
    refreshDashboard,
    getMonthlyPerformance
  };
};

export default useSupabaseDashboard;