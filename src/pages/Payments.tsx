import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Search, Download, Plus, Filter, Edit, Trash2, CheckCircle } from "lucide-react";
import { useSupabasePayments } from "@/hooks/useSupabasePayments";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useExport } from "@/hooks/useExport";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; payment?: any }>({ open: false });
  
  const { payments, loading, addPayment, updatePayment, deletePayment, markAsPaid } = useSupabasePayments();
  const { clients } = useSupabaseClients();
  const { exportPayments } = useExport();
  const { toast } = useToast();

  const filteredPayments = payments.filter(payment => {
    const clientName = payment.clients?.name || '';
    const serviceName = payment.service_name || '';
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: "Total Recebido",
      value: `R$ ${filteredPayments.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.value, 0).toFixed(2).replace('.', ',')}`,
      color: "text-green-600",
      icon: "₹",
    },
    {
      title: "A Receber",
      value: `R$ ${filteredPayments.filter(p => p.status === 'Pendente').reduce((sum, p) => sum + p.value, 0).toFixed(2).replace('.', ',')}`,
      color: "text-orange-600",
      icon: "₹",
    },
    {
      title: "Em Atraso",
      value: `R$ ${filteredPayments.filter(p => p.status === 'Atrasado').reduce((sum, p) => sum + p.value, 0).toFixed(2).replace('.', ',')}`,
      color: "text-red-600",
      icon: "₹",
    },
    {
      title: "Taxa de Recebimento",
      value: `${payments.length > 0 ? Math.round((payments.filter(p => p.status === 'Pago').length / payments.length) * 100) : 0}%`,
      color: "text-blue-600",
      icon: "%",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-500';
      case 'Pendente': return 'bg-yellow-500';
      case 'Atrasado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleMarkAsPaid = (paymentId: string) => {
    const method = prompt('Método de pagamento (PIX, Boleto, Cartão, Transferência, Dinheiro):');
    if (method) {
      markAsPaid(paymentId, method);
      toast({
        title: "Pagamento confirmado",
        description: "O pagamento foi marcado como pago.",
      });
    }
  };

  const handleDeletePayment = (paymentId: string, clientName: string) => {
    if (confirm(`Tem certeza que deseja excluir a cobrança de ${clientName}?`)) {
      deletePayment(paymentId);
      toast({
        title: "Cobrança excluída",
        description: "A cobrança foi removida com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => exportPayments(filteredPayments)}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" onClick={() => setPaymentModal({ open: true })}>
            <Plus className="h-4 w-4" />
            Nova Cobrança
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar pagamentos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border shadow-md">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Todos')}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Pago')}>
              Pago
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Pendente')}>
              Pendente
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Atrasado')}>
              Atrasado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.clients?.name || 'Cliente não encontrado'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{payment.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">R$ {payment.value}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getStatusColor(payment.status)} text-white`}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{payment.payment_method || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-md">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setPaymentModal({ open: true, payment })}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar cobrança
                          </DropdownMenuItem>
                          {payment.status !== 'Pago' && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleMarkAsPaid(payment.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como pago
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => handleDeletePayment(payment.id, payment.clients?.name || 'Cliente')}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir cobrança
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => setPaymentModal({ open })}
        payment={paymentModal.payment}
        clients={clients}
        onSubmit={(paymentData) => {
          if (paymentModal.payment) {
            updatePayment(paymentModal.payment.id, paymentData);
            toast({
              title: "Cobrança atualizada",
              description: "A cobrança foi atualizada com sucesso.",
            });
          } else {
            addPayment(paymentData);
            toast({
              title: "Cobrança criada",
              description: "Nova cobrança foi criada com sucesso.",
            });
          }
        }}
      />
    </div>
  );
};

export default Payments;
