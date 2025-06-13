import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Download, Plus, ChevronLeft, ChevronRight, Filter, Eye, Edit, Trash2, MoreHorizontal, Phone, MessageSquare } from "lucide-react";
import { useSupabaseAppointments } from "@/hooks/useSupabaseAppointments";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useExport } from "@/hooks/useExport";
import { AppointmentModal } from "@/components/modals/AppointmentModal";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // June 2025
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [appointmentModal, setAppointmentModal] = useState<{ open: boolean; appointment?: any }>({ open: false });
  
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment, getDailySchedule } = useSupabaseAppointments();
  const { clients } = useSupabaseClients();
  const { exportAppointments } = useExport();
  const { toast } = useToast();

  const filteredAppointments = appointments.filter(appointment => {
    const clientName = clients.find(c => c.id === appointment.client_id)?.name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
    
    // Apply status filter to calendar view as well
    return statusFilter === 'Todos' 
      ? dayAppointments 
      : dayAppointments.filter(apt => apt.status === statusFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-200 text-green-800';
      case 'Agendado': return 'bg-blue-200 text-blue-800';
      case 'Concluído': return 'bg-gray-200 text-gray-800';
      case 'Cancelado': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleDeleteAppointment = (appointmentId: string, clientName: string) => {
    if (confirm(`Tem certeza que deseja excluir o agendamento de ${clientName}?`)) {
      deleteAppointment(appointmentId);
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi removido com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            className={viewMode === 'calendar' ? 'bg-gray-900' : ''}
            onClick={() => setViewMode('calendar')}
          >
            Calendário
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => exportAppointments(filteredAppointments)}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" onClick={() => setAppointmentModal({ open: true })}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar agendamentos..."
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
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Agendado')}>
              Agendado
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Confirmado')}>
              Confirmado
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Concluído')}>
              Concluído
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('Cancelado')}>
              Cancelado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-2 h-24"></div>
              ))}
              
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayAppointments = getAppointmentsForDay(day);
                
                return (
                  <div key={day} className="p-1 h-24 border border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt, index) => (
                        <div
                          key={index}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(apt.status)}`}
                          onClick={() => setAppointmentModal({ open: true, appointment: apt })}
                        >
                          {apt.appointment_time} - {clients.find(c => c.id === apt.client_id)?.name || 'Cliente não encontrado'}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{clients.find(c => c.id === appointment.client_id)?.name || 'Cliente não encontrado'}</h3>
                          <p className="text-sm text-gray-500">{appointment.service_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
                          </p>
                          <p className="text-sm text-gray-500">R$ {appointment.value?.toFixed(2) || '0,00'}</p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-md">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setAppointmentModal({ open: true, appointment })}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setAppointmentModal({ open: true, appointment })}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar agendamento
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => handleDeleteAppointment(appointment.id, clients.find(c => c.id === appointment.client_id)?.name || 'Cliente')}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir agendamento
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum agendamento encontrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        open={appointmentModal.open}
        onOpenChange={(open) => setAppointmentModal({ open })}
        appointment={appointmentModal.appointment}
        clients={clients}
        onSubmit={(appointmentData) => {
          if (appointmentModal.appointment) {
            updateAppointment(appointmentModal.appointment.id, appointmentData);
            toast({
              title: "Agendamento atualizado",
              description: "O agendamento foi atualizado com sucesso.",
            });
          } else {
            addAppointment(appointmentData);
            toast({
              title: "Agendamento criado",
              description: "Novo agendamento foi criado com sucesso.",
            });
          }
        }}
      />
    </div>
  );
};

export default Schedule;
