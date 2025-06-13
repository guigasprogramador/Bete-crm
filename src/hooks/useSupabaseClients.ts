// =====================================================
// CRM WhatsApp Manager - Hook para Clientes com Supabase
// =====================================================

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addClient: (client: ClientInsert) => Promise<boolean>;
  updateClient: (id: string, client: ClientUpdate) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  refreshClients: () => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  searchClients: (filters?: SearchFilters) => Promise<Client[]>;
}

interface SearchFilters {
  searchTerm?: string;
  status?: string;
  origin?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export const useSupabaseClients = (): UseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar clientes iniciais
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('client_details')
        .select('*')
        .order('last_contact', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setClients(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar cliente
  const addClient = async (clientData: ClientInsert): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de clientes
      await loadClients();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao adicionar cliente:', err);
      return false;
    }
  };

  // Atualizar cliente
  const updateClient = async (id: string, clientData: ClientUpdate): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de clientes
      await loadClients();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao atualizar cliente:', err);
      return false;
    }
  };

  // Deletar cliente
  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recarregar a lista de clientes
      await loadClients();
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error('Erro ao deletar cliente:', err);
      return false;
    }
  };

  // Buscar clientes com filtros avançados
  const searchClients = async (filters: SearchFilters = {}): Promise<Client[]> => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .rpc('search_clients', {
          p_search_term: filters.searchTerm || null,
          p_status: filters.status || null,
          p_origin: filters.origin || null,
          p_date_from: filters.dateFrom || null,
          p_date_to: filters.dateTo || null,
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
      console.error('Erro ao buscar clientes:', err);
      return [];
    }
  };

  // Atualizar lista de clientes
  const refreshClients = async () => {
    await loadClients();
  };

  // Buscar cliente por ID
  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  // Filtrar clientes localmente por termo de busca
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.phone.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  });

  // Carregar clientes na inicialização
  useEffect(() => {
    loadClients();
  }, []);

  // Configurar real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log('Mudança detectada na tabela clients:', payload);
          // Recarregar clientes quando houver mudanças
          loadClients();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    clients: filteredClients,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
    getClientById,
    searchClients
  };
};

export default useSupabaseClients;