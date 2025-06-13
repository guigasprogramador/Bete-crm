// =====================================================
// CRM WhatsApp Manager - Hook para Agendamentos com Supabase
// =====================================================

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addAppointment: (appointment: AppointmentInsert) => Promise<boolean>;
  updateAppointment: (id: string, appointment: AppointmentUpdate) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  cancelAppointment: (id: string, reason?: string) => Promise<boolean>;
  refreshAppointments: () => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  getAppointmentsByClient: (clientId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getDailySchedule: (date?: string) => Promise<any[]>;
  searchAppointments: (filters?: SearchFilters) => Promise<any[]>;
  createAppointmentWithPayment: (data: CreateAppointmentData) => Promise<{ appointmentId: string; paymentId: string } | null>;
}

interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  clientId?: string;
  serviceName?: string;
  limit?: number;
  offset?: number;
}

interface CreateAppointmentData {
  clientId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  value: number;
  notes?: string;
  paymentDueDate?: string;
}

export const useSupabaseAppointments = (): UseAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar agendamentos iniciais
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!inner(
            id,
            name,
            phone,
            email
          )
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      setAppointments(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar agendamento
  const addAppointment = async (appointmentData: AppointmentInsert): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de agendamentos
      await loadAppointments();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao adicionar agendamento:', err);
      return false;
    }
  };

  // Atualizar agendamento
  const updateAppointment = async (id: string, appointmentData: AppointmentUpdate): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de agendamentos
      await loadAppointments();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao atualizar agendamento:', err);
      return false;
    }
  };

  // Deletar agendamento
  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de agendamentos
      await loadAppointments();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao deletar agendamento:', err);
      return false;
    }
  };

  // Cancelar agendamento
  const cancelAppointment = async (id: string, reason?: string): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .rpc('cancel_appointment', {
          p_appointment_id: id,
          p_reason: reason || null
        });

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de agendamentos
      await loadAppointments();
      return data === true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao cancelar agendamento:', err);
      return false;
    }
  };

  // Buscar agendamentos com filtros avançados
  const searchAppointments = async (filters: SearchFilters = {}): Promise<any[]> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .rpc('search_appointments', {
          p_date_from: filters.dateFrom || null,
          p_date_to: filters.dateTo || null,
          p_status: filters.status || null,
          p_client_id: filters.clientId || null,
          p_service_name: filters.serviceName || null,
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
      console.error('Erro ao buscar agendamentos:', err);
      return [];
    }
  };

  // Obter agenda do dia
  const getDailySchedule = async (date?: string): Promise<any[]> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .rpc('get_daily_schedule', {
          p_date: date || new Date().toISOString().split('T')[0]
        });

      if (supabaseError) {
        throw supabaseError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao buscar agenda do dia:', err);
      return [];
    }
  };

  // Criar agendamento com pagamento
  const createAppointmentWithPayment = async (data: CreateAppointmentData): Promise<{ appointmentId: string; paymentId: string } | null> => {
    try {
      setError(null);

      const { data: result, error: supabaseError } = await supabase
        .rpc('create_appointment_with_payment', {
          p_client_id: data.clientId,
          p_service_name: data.serviceName,
          p_appointment_date: data.appointmentDate,
          p_appointment_time: data.appointmentTime,
          p_value: data.value,
          p_notes: data.notes || null,
          p_payment_due_date: data.paymentDueDate || null
        });

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de agendamentos
      await loadAppointments();
      
      return result && result.length > 0 ? {
        appointmentId: result[0].appointment_id,
        paymentId: result[0].payment_id
      } : null;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao criar agendamento com pagamento:', err);
      return null;
    }
  };

  // Atualizar lista de agendamentos
  const refreshAppointments = async () => {
    await loadAppointments();
  };

  // Buscar agendamento por ID
  const getAppointmentById = (id: string): Appointment | undefined => {
    return appointments.find(appointment => appointment.id === id);
  };

  // Buscar agendamentos por cliente
  const getAppointmentsByClient = (clientId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.client_id === clientId);
  };

  // Buscar agendamentos por data
  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(appointment => appointment.appointment_date === date);
  };

  // Filtrar agendamentos localmente por termo de busca
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      appointment.service_name.toLowerCase().includes(term) ||
      appointment.status.toLowerCase().includes(term) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(term))
    );
  });

  // Carregar agendamentos na inicialização
  useEffect(() => {
    loadAppointments();
  }, []);

  // Configurar real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Mudança detectada na tabela appointments:', payload);
          // Recarregar agendamentos quando houver mudanças
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    appointments: filteredAppointments,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    refreshAppointments,
    getAppointmentById,
    getAppointmentsByClient,
    getAppointmentsByDate,
    getDailySchedule,
    searchAppointments,
    createAppointmentWithPayment
  };
};

export default useSupabaseAppointments;