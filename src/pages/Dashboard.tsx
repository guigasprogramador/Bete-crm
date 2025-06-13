import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, DollarSign, Phone, MessageSquare, MoreHorizontal, Eye, EditIcon, CalendarIcon, History, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseDashboard } from "@/hooks/useSupabaseDashboard";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useSupabaseAppointments } from "@/hooks/useSupabaseAppointments";
import { useSupabasePayments } from "@/hooks/useSupabasePayments";
import { ClientDetailsModal } from "@/components/modals/ClientDetailsModal";
import { ClientModal } from "@/components/modals/ClientModal";
import { AppointmentModal } from "@/components/modals/AppointmentModal";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { stats: dashboardStats, recentClients, monthlyRevenue, loading: dashboardLoading } = useSupabaseDashboard();
  const { clients, updateClient, loading: clientsLoading } = useSupabaseClients();
  const { addAppointment, getAppointmentsByClient } = useSupabaseAppointments();
  const { getPaymentsByClient } = useSupabasePayments();
  const { toast } = useToast();

  const [clientModal, setClientModal] = useState<{ open: boolean; client?: any }>({ open: false });
  const [appointmentModal, setAppointmentModal] = useState<{ open: boolean; clientId?: string }>({ open: false });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; client?: any }>({ open: false });
  const [periodFilter, setPeriodFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const stats = [
    {
      title: "Total de Clientes",
      value: dashboardStats?.total_clients?.toString() || "0",
      subtitle: `+${dashboardStats?.new_clients_week || 0} novos esta semana`,
      icon: Users,
    },
    {
      title: "Agendamentos",
      value: dashboardStats?.total_appointments?.toString() || "0",
      subtitle: `${dashboardStats?.appointments_this_week || 0} para esta semana`,
      icon: Calendar,
    },
    {
      title: "Atendimentos",
      value: dashboardStats?.completed_appointments?.toString() || "0",
      subtitle: `+${dashboardStats?.completed_this_month || 0} este mês`,
      icon: Clock,
    },
    {
      title: "Clientes Ativos",
      value: dashboardStats?.active_clients?.toString() || "0",
      subtitle: "Clientes em atividade",
      icon: Users,
    },
  ];

  const monthlyRevenueCard = {
    title: "Receita Mensal",
    value: `R$ ${(dashboardStats?.revenue_this_month || 0).toFixed(2).replace('.', ',')}`,
    subtitle: `Total: R$ ${(dashboardStats?.total_revenue || 0).toFixed(2).replace('.', ',')}`,
    icon: DollarSign,
  };

  const pendingRevenueCard = {
    title: "Receita Pendente",
    value: `R$ ${(dashboardStats?.pending_revenue || 0).toFixed(2).replace('.', ',')}`,
    subtitle: `Atrasado: R$ ${(dashboardStats?.overdue_revenue || 0).toFixed(2).replace('.', ',')}`,
    icon: DollarSign,
  };

  const chartData = monthlyRevenue || [];

  // Filtrar clientes baseado nos filtros selecionados
  const filteredClients = (recentClients || []).filter(client => {
    // Filtro por status
    if (statusFilter !== "todos" && client.status.toLowerCase() !== statusFilter) {
      return false;
    }

    // Filtro por período (baseado na data de registro)
    if (periodFilter !== "todos") {
      const clientDate = new Date(client.registration_date);
      const now = new Date();
      
      switch (periodFilter) {
        case "hoje":
          return clientDate.toDateString() === now.toDateString();
        case "semana":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return clientDate >= weekAgo;
        case "mes":
          return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
        case "trimestre":
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const clientQuarter = Math.floor(clientDate.getMonth() / 3);
          return clientQuarter === currentQuarter && clientDate.getFullYear() === now.getFullYear();
        case "ano":
          return clientDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    }
    
    return true;
  });

  const displayClients = filteredClients;

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Ativo: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
      Pendente: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium",
      Inativo: "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium",
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.Inativo;
  };

  const handleCall = (phone: string) => {
    toast({
      title: "Ligação iniciada",
      description: `Discando para ${phone}`,
    });
  };

  const handleMessage = (phone: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  if (dashboardLoading || clientsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{monthlyRevenueCard.title}</CardTitle>
            <monthlyRevenueCard.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{monthlyRevenueCard.value}</div>
            <p className="text-xs text-gray-500 mt-1">{monthlyRevenueCard.subtitle}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{pendingRevenueCard.title}</CardTitle>
            <pendingRevenueCard.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingRevenueCard.value}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingRevenueCard.subtitle}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os períodos</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="trimestre">Este trimestre</SelectItem>
              <SelectItem value="ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recent Clients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Clientes Recentes</CardTitle>
            <p className="text-sm text-gray-500">Lista dos últimos clientes cadastrados</p>
          </div>
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Último Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-blue-600">{client.phone}</TableCell>
                  <TableCell>{client.lastContact}</TableCell>
                  <TableCell>
                    <span className={getStatusBadge(client.status)}>
                      {client.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCall(client.phone)}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMessage(client.phone)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-md">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setDetailsModal({ open: true, client })}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setClientModal({ open: true, client })}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            Editar cliente
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setAppointmentModal({ open: true, clientId: client.id })}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Agendar atendimento
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setDetailsModal({ open: true, client })}>
                            <History className="mr-2 h-4 w-4" />
                            Histórico de atendimentos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receita Mensal</CardTitle>
          <p className="text-sm text-gray-500">Evolução da receita ao longo dos meses</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') {
                      return [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Receita'];
                    }
                    return [value, name === 'appointments' ? 'Agendamentos' : 'Clientes'];
                  }}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    switch(value) {
                      case 'revenue': return 'Receita (R$)';
                      case 'appointments': return 'Agendamentos';
                      case 'clients': return 'Clientes';
                      default: return value;
                    }
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" name="revenue" />
                <Bar dataKey="appointments" fill="#10b981" name="appointments" />
                <Bar dataKey="clients" fill="#f59e0b" name="clients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ClientModal
        open={clientModal.open}
        onOpenChange={(open) => setClientModal({ open })}
        client={clientModal.client}
        onSubmit={(clientData) => {
          if (clientModal.client) {
            updateClient(clientModal.client.id, clientData);
            toast({
              title: "Cliente atualizado",
              description: "As informações do cliente foram atualizadas com sucesso.",
            });
          }
        }}
      />

      <AppointmentModal
        open={appointmentModal.open}
        onOpenChange={(open) => setAppointmentModal({ open })}
        clients={clients}
        onSubmit={(appointmentData) => {
          addAppointment(appointmentData);
          toast({
            title: "Agendamento criado",
            description: "Novo agendamento foi criado com sucesso.",
          });
        }}
        preSelectedClientId={appointmentModal.clientId}
      />

      {detailsModal.client && (
        <ClientDetailsModal
          open={detailsModal.open}
          onOpenChange={(open) => setDetailsModal({ open })}
          client={detailsModal.client}
          appointments={getAppointmentsByClient(detailsModal.client.id)}
          payments={getPaymentsByClient(detailsModal.client.id)}
        />
      )}
    </div>
  );
};

export default Dashboard;
