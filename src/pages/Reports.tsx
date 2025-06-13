import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Filter, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useSupabaseAppointments } from "@/hooks/useSupabaseAppointments";
import { useSupabasePayments } from "@/hooks/useSupabasePayments";
import { useExport } from "@/hooks/useExport";

const Reports = () => {
  const [activeTab, setActiveTab] = useState('clientes');
  const [periodFilter, setPeriodFilter] = useState('ultimo-mes');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Hooks para buscar dados reais
  const { clients, loading: clientsLoading } = useSupabaseClients();
  const { appointments, loading: appointmentsLoading } = useSupabaseAppointments();
  const { payments, loading: paymentsLoading } = useSupabasePayments();
  const { exportClients, exportAppointments, exportPayments } = useExport();

  const loading = clientsLoading || appointmentsLoading || paymentsLoading;

  // Calcular dados reais baseados nos dados do Supabase
  const clientStatusData = useMemo(() => {
    if (!clients.length) return [];
    const statusCounts = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = clients.length;
    return [
      { name: "Ativos", value: Math.round(((statusCounts['Ativo'] || 0) / total) * 100), color: "#22c55e" },
      { name: "Pendentes", value: Math.round(((statusCounts['Pendente'] || 0) / total) * 100), color: "#eab308" },
      { name: "Inativos", value: Math.round(((statusCounts['Inativo'] || 0) / total) * 100), color: "#6b7280" },
    ];
  }, [clients]);

  const clientOriginData = useMemo(() => {
    if (!clients.length) return [];
    const originCounts = clients.reduce((acc, client) => {
      acc[client.origin || 'Outros'] = (acc[client.origin || 'Outros'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = clients.length;
    return [
      { name: "Indicação", value: Math.round(((originCounts['Indicação'] || 0) / total) * 100), color: "#3b82f6" },
      { name: "Redes Sociais", value: Math.round(((originCounts['Redes Sociais'] || 0) / total) * 100), color: "#ec4899" },
      { name: "WhatsApp", value: Math.round(((originCounts['WhatsApp'] || 0) / total) * 100), color: "#8b5cf6" },
      { name: "Outros", value: Math.round(((originCounts['Outros'] || 0) / total) * 100), color: "#f97316" },
    ];
  }, [clients]);

  const performanceData = useMemo(() => {
    if (!appointments.length || !clients.length || !payments.length) return [];
    
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentYear = new Date().getFullYear();
    
    return monthNames.map((month, index) => {
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.getMonth() === index && aptDate.getFullYear() === currentYear;
      });
      
      const monthClients = clients.filter(client => {
        const regDate = new Date(client.registration_date);
        return regDate.getMonth() === index && regDate.getFullYear() === currentYear;
      });
      
      const monthPayments = payments.filter(payment => {
        if (!payment.payment_date) return false;
        const payDate = new Date(payment.payment_date);
        return payDate.getMonth() === index && payDate.getFullYear() === currentYear && payment.status === 'Pago';
      });
      
      const revenue = monthPayments.reduce((sum, payment) => sum + (payment.value || 0), 0);
      
      return {
        month,
        appointments: monthAppointments.length,
        clients: monthClients.length,
        revenue
      };
    });
  }, [appointments, clients, payments]);

  const appointmentStatusData = useMemo(() => {
    if (!appointments.length) return [];
    const statusCounts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = appointments.length;
    return [
      { name: "Concluídos", value: Math.round(((statusCounts['Concluído'] || 0) / total) * 100), color: "#22c55e" },
      { name: "Agendados", value: Math.round(((statusCounts['Agendado'] || 0) / total) * 100), color: "#3b82f6" },
      { name: "Confirmados", value: Math.round(((statusCounts['Confirmado'] || 0) / total) * 100), color: "#8b5cf6" },
      { name: "Cancelados", value: Math.round(((statusCounts['Cancelado'] || 0) / total) * 100), color: "#ef4444" },
    ];
  }, [appointments]);

  const paymentMethodData = useMemo(() => {
    if (!payments.length) return [];
    const paidPayments = payments.filter(p => p.status === 'Pago' && p.payment_method);
    if (!paidPayments.length) return [];
    
    const methodCounts = paidPayments.reduce((acc, payment) => {
      acc[payment.payment_method!] = (acc[payment.payment_method!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = paidPayments.length;
    return [
      { name: "PIX", value: Math.round(((methodCounts['PIX'] || 0) / total) * 100), color: "#22c55e" },
      { name: "Cartão", value: Math.round(((methodCounts['Cartão'] || 0) / total) * 100), color: "#3b82f6" },
      { name: "Boleto", value: Math.round(((methodCounts['Boleto'] || 0) / total) * 100), color: "#eab308" },
      { name: "Transferência", value: Math.round(((methodCounts['Transferência'] || 0) / total) * 100), color: "#8b5cf6" },
      { name: "Dinheiro", value: Math.round(((methodCounts['Dinheiro'] || 0) / total) * 100), color: "#6b7280" },
    ].filter(item => item.value > 0);
  }, [payments]);

  const clientsData = useMemo(() => {
    return clients.map(client => {
      const clientAppointments = appointments.filter(apt => apt.client_id === client.id);
      const clientPayments = payments.filter(pay => pay.client_id === client.id && pay.status === 'Pago');
      const totalSpent = clientPayments.reduce((sum, payment) => sum + (payment.value || 0), 0);
      
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'Ativo': return 'bg-green-500';
          case 'Pendente': return 'bg-yellow-500';
          case 'Inativo': return 'bg-gray-500';
          default: return 'bg-gray-500';
        }
      };
      
      return {
        name: client.name,
        phone: client.phone,
        email: client.email,
        registrationDate: new Date(client.registration_date).toLocaleDateString('pt-BR'),
        totalAppointments: clientAppointments.length,
        totalSpent: `R$ ${totalSpent.toFixed(2).replace('.', ',')}`,
        status: client.status,
        statusColor: getStatusColor(client.status),
      };
    });
  }, [clients, appointments, payments]);

  const handleExportPDF = () => {
    console.log(`Exportando relatório de ${activeTab} em PDF para o período: ${periodFilter}`);
    // TODO: Implementar exportação em PDF
  };

  const handleExportCSV = () => {
    switch (activeTab) {
      case 'clientes':
        exportClients(clients);
        break;
      case 'agendamentos':
        exportAppointments(appointments);
        break;
      case 'financeiro':
        exportPayments(payments);
        break;
      default:
        console.log(`Exportando relatório de ${activeTab} em CSV`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando relatórios...</div>
      </div>
    );
  }

  const renderClientReports = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Relatório de Clientes</h2>
      <p className="text-gray-600 mb-6">Análise de clientes cadastrados e status no período selecionado.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {clientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Origem dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientOriginData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {clientOriginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Mensal</CardTitle>
          <p className="text-sm text-gray-500">Agendamentos e novos clientes por mês</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Bar dataKey="appointments" fill="#22c55e" name="Agendamentos" />
              <Bar dataKey="clients" fill="#3b82f6" name="Novos Clientes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Atendimentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gasto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientsData.map((client, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.registrationDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.totalAppointments}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.totalSpent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${client.statusColor} text-white`}>
                        {client.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointmentReports = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Relatório de Agendamentos</h2>
      <p className="text-gray-600 mb-6">Análise de agendamentos e atendimentos no período selecionado.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="appointments" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPerformanceReports = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Relatório de Desempenho</h2>
      <p className="text-gray-600 mb-6">Análise de performance e crescimento no período selecionado.</p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Mensal Completa</CardTitle>
          <p className="text-sm text-gray-500">Agendamentos, novos clientes e receita por mês</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Bar dataKey="appointments" fill="#22c55e" name="Agendamentos" />
              <Bar dataKey="clients" fill="#3b82f6" name="Novos Clientes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialReports = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Relatório Financeiro</h2>
      <p className="text-gray-600 mb-6">Análise financeira e métodos de pagamento no período selecionado.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        </div>
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-md">
              <SelectItem value="ultima-semana">Última semana</SelectItem>
              <SelectItem value="ultimo-mes">Último mês</SelectItem>
              <SelectItem value="ultimos-3-meses">Últimos 3 meses</SelectItem>
              <SelectItem value="ultimos-6-meses">Últimos 6 meses</SelectItem>
              <SelectItem value="ultimo-ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          className={`px-4 py-2 border-b-2 font-medium ${
            activeTab === 'clientes' 
              ? 'border-green-600 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('clientes')}
        >
          Clientes
        </button>
        <button 
          className={`px-4 py-2 border-b-2 font-medium ${
            activeTab === 'agendamentos' 
              ? 'border-green-600 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('agendamentos')}
        >
          Agendamentos
        </button>
        <button 
          className={`px-4 py-2 border-b-2 font-medium ${
            activeTab === 'desempenho' 
              ? 'border-green-600 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('desempenho')}
        >
          Desempenho
        </button>
        <button 
          className={`px-4 py-2 border-b-2 font-medium ${
            activeTab === 'financeiro' 
              ? 'border-green-600 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('financeiro')}
        >
          Financeiro
        </button>
      </div>

      {/* Report Content */}
      {activeTab === 'clientes' && renderClientReports()}
      {activeTab === 'agendamentos' && renderAppointmentReports()}
      {activeTab === 'desempenho' && renderPerformanceReports()}
      {activeTab === 'financeiro' && renderFinancialReports()}
    </div>
  );
};

export default Reports;
