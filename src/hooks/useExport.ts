
import { Client } from './useClients';
import { Appointment } from './useAppointments';
import { Payment } from './usePayments';
import { useToast } from '@/hooks/use-toast';

export const useExport = () => {
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação realizada com sucesso!",
        description: `Arquivo ${filename}.csv foi baixado.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const exportClients = (clients: Client[]) => {
    const headers = ['name', 'phone', 'email', 'status', 'registrationDate', 'lastContact', 'totalAppointments', 'totalSpent'];
    exportToCSV(clients, 'clientes', headers);
  };

  const exportAppointments = (appointments: Appointment[]) => {
    const headers = ['clientName', 'date', 'time', 'service', 'status', 'value', 'notes'];
    exportToCSV(appointments, 'agendamentos', headers);
  };

  const exportPayments = (payments: Payment[]) => {
    const headers = ['clientName', 'service', 'value', 'dueDate', 'paymentDate', 'status', 'method'];
    exportToCSV(payments, 'pagamentos', headers);
  };

  return {
    exportClients,
    exportAppointments,
    exportPayments,
  };
};
