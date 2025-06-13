
import { useState } from 'react';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  service: string;
  status: 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado';
  value: string;
  notes?: string;
}

const initialAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Maria Silva',
    date: '2025-06-10',
    time: '10:00',
    service: 'Consulta inicial',
    status: 'Confirmado',
    value: 'R$ 150,00',
    notes: 'Primeira consulta'
  },
  {
    id: '2',
    clientId: '1',
    clientName: 'Maria Silva',
    date: '2025-06-10',
    time: '14:30',
    service: 'Acompanhamento',
    status: 'Agendado',
    value: 'R$ 100,00'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Ana Santos',
    date: '2025-06-11',
    time: '09:15',
    service: 'Consulta inicial',
    status: 'Confirmado',
    value: 'R$ 150,00'
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Carlos Ferreira',
    date: '2025-06-12',
    time: '11:00',
    service: 'Acompanhamento',
    status: 'Agendado',
    value: 'R$ 100,00'
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'Patrícia Lima',
    date: '2025-06-15',
    time: '15:30',
    service: 'Pacote completo',
    status: 'Confirmado',
    value: 'R$ 300,00'
  },
];

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, updatedAppointment: Partial<Appointment>) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id ? { ...appointment, ...updatedAppointment } : appointment
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  const getAppointmentById = (id: string) => {
    return appointments.find(appointment => appointment.id === id);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  const getAppointmentsByClient = (clientId: string) => {
    return appointments.filter(appointment => appointment.clientId === clientId);
  };

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    getAppointmentsByDate,
    getAppointmentsByClient,
  };
};
