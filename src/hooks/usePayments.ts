
import { useState } from 'react';

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  value: string;
  dueDate: string;
  paymentDate?: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  method?: string;
  appointmentId?: string;
}

const initialPayments: Payment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Maria Silva',
    service: 'Consulta inicial',
    value: 'R$ 150,00',
    dueDate: '2025-06-15',
    paymentDate: '2025-06-14',
    status: 'Pago',
    method: 'PIX',
    appointmentId: '1'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'João Oliveira',
    service: 'Acompanhamento mensal',
    value: 'R$ 300,00',
    dueDate: '2025-06-20',
    status: 'Pendente',
    method: 'Boleto',
    appointmentId: '2'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Ana Santos',
    service: 'Consulta inicial',
    value: 'R$ 150,00',
    dueDate: '2025-06-10',
    status: 'Atrasado',
    method: 'Cartão',
    appointmentId: '3'
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Carlos Ferreira',
    service: 'Pacote completo',
    value: 'R$ 500,00',
    dueDate: '2025-06-25',
    paymentDate: '2025-06-23',
    status: 'Pago',
    method: 'Transferência',
    appointmentId: '4'
  },
];

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, updatedPayment: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updatedPayment } : payment
    ));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(payment => payment.id !== id));
  };

  const markAsPaid = (id: string, method: string) => {
    updatePayment(id, {
      status: 'Pago',
      paymentDate: new Date().toISOString().split('T')[0],
      method
    });
  };

  const getPaymentsByClient = (clientId: string) => {
    return payments.filter(payment => payment.clientId === clientId);
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    markAsPaid,
    getPaymentsByClient,
  };
};
