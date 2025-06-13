
import { useState } from 'react';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastContact: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  registrationDate: string;
  totalAppointments: number;
  totalSpent: string;
  origin?: string;
}

const initialClients: Client[] = [
  {
    id: '1',
    name: "Maria Silva",
    phone: "(11) 98765-4321",
    email: "maria.silva@email.com",
    lastContact: "10/06/2025",
    status: "Ativo",
    registrationDate: "15/05/2025",
    totalAppointments: 5,
    totalSpent: "R$ 750,00",
    origin: "Indicação"
  },
  {
    id: '2',
    name: "João Oliveira",
    phone: "(11) 91234-5678",
    email: "joao.oliveira@email.com",
    lastContact: "09/06/2025",
    status: "Pendente",
    registrationDate: "20/05/2025",
    totalAppointments: 3,
    totalSpent: "R$ 450,00",
    origin: "Redes Sociais"
  },
  {
    id: '3',
    name: "Ana Santos",
    phone: "(11) 99876-5432",
    email: "ana.santos@email.com",
    lastContact: "08/06/2025",
    status: "Ativo",
    registrationDate: "10/05/2025",
    totalAppointments: 7,
    totalSpent: "R$ 1.050,00",
    origin: "WhatsApp"
  },
  {
    id: '4',
    name: "Carlos Ferreira",
    phone: "(11) 98877-6655",
    email: "carlos.ferreira@email.com",
    lastContact: "07/06/2025",
    status: "Inativo",
    registrationDate: "01/05/2025",
    totalAppointments: 2,
    totalSpent: "R$ 300,00",
    origin: "Outros"
  },
  {
    id: '5',
    name: "Patrícia Lima",
    phone: "(11) 97788-9900",
    email: "patricia.lima@email.com",
    lastContact: "06/06/2025",
    status: "Ativo",
    registrationDate: "25/04/2025",
    totalAppointments: 4,
    totalSpent: "R$ 600,00",
    origin: "Indicação"
  },
];

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updatedClient } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  return {
    clients: filteredClients,
    allClients: clients,
    searchTerm,
    setSearchTerm,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
  };
};
