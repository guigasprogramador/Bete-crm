
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/lib/supabase";

type Client = Database['public']['Tables']['clients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface ClientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  appointments: Appointment[];
  payments: Payment[];
}

export const ClientDetailsModal = ({ 
  open, 
  onOpenChange, 
  client, 
  appointments,
  payments 
}: ClientDetailsModalProps) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      Ativo: "bg-green-500",
      Pendente: "bg-yellow-500",
      Inativo: "bg-gray-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Nome:</strong> {client.name}</div>
              <div><strong>Telefone:</strong> {client.phone}</div>
              <div><strong>Email:</strong> {client.email}</div>
              <div><strong>Data de Cadastro:</strong> {client.registration_date ? new Date(client.registration_date).toLocaleDateString('pt-BR') : 'N/A'}</div>
              <div><strong>Último Contato:</strong> {client.last_contact ? new Date(client.last_contact).toLocaleDateString('pt-BR') : 'N/A'}</div>
              <div><strong>Status:</strong> <Badge className={`${getStatusBadge(client.status)} text-white ml-2`}>{client.status}</Badge></div>
              <div><strong>Total Gasto:</strong> R$ {client.total_spent ? client.total_spent.toFixed(2) : '0,00'}</div>
              <div><strong>Total de Atendimentos:</strong> {client.total_appointments || 0}</div>
            </CardContent>
          </Card>

          {/* Histórico de Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Agendamentos ({appointments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-2">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{appointment.service_name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
                          </div>
                          {appointment.notes && (
                            <div className="text-sm text-gray-600 mt-1">{appointment.notes}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">R$ {appointment.value ? appointment.value.toFixed(2) : '0,00'}</div>
                          <Badge className="text-xs">{appointment.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum agendamento encontrado.</p>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Pagamentos ({payments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map(payment => (
                    <div key={payment.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{payment.service_name}</div>
                          <div className="text-sm text-gray-500">
                            Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                          </div>
                          {payment.payment_date && (
                            <div className="text-sm text-gray-600">
                              Pago em: {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">R$ {payment.value ? payment.value.toFixed(2) : '0,00'}</div>
                          <Badge className={`text-xs ${payment.status === 'Pago' ? 'bg-green-500' : payment.status === 'Atrasado' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                            {payment.status}
                          </Badge>
                          {payment.payment_method && (
                            <div className="text-xs text-gray-500 mt-1">{payment.payment_method}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum pagamento encontrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
