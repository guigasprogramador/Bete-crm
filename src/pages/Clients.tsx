import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Download, Plus, Phone, MessageSquare, MoreHorizontal, Eye, Edit, Calendar, History, Trash2 } from "lucide-react";
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
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useSupabaseAppointments } from "@/hooks/useSupabaseAppointments";
import { useSupabasePayments } from "@/hooks/useSupabasePayments";
import { useExport } from "@/hooks/useExport";
import { ClientModal } from "@/components/modals/ClientModal";
import { AppointmentModal } from "@/components/modals/AppointmentModal";
import { ClientDetailsModal } from "@/components/modals/ClientDetailsModal";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { clients, loading, addClient, updateClient, deleteClient, searchClients } = useSupabaseClients();
  const { addAppointment, getAppointmentsByClient } = useSupabaseAppointments();
  const { payments, getPaymentsByClient } = useSupabasePayments();
  const { exportClients } = useExport();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');

  const [clientModal, setClientModal] = useState<{ open: boolean; client?: any }>({ open: false });
  const [appointmentModal, setAppointmentModal] = useState<{ open: boolean; clientId?: string }>({ open: false });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; client?: any }>({ open: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-500';
      case 'Pendente': return 'bg-yellow-500';
      case 'Inativo': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${clientName}?`)) {
      deleteClient(clientId);
      toast({
        title: "Cliente excluído",
        description: `${clientName} foi removido com sucesso.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => exportClients(clients)}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" onClick={() => setClientModal({ open: true })}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Último Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-blue-600">{client.phone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.last_contact}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(client.status)} text-white`}>
                      {client.status}
                    </Badge>
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
                            <Edit className="mr-2 h-4 w-4" />
                            Editar cliente
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setAppointmentModal({ open: true, clientId: client.id })}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendar atendimento
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setDetailsModal({ open: true, client })}>
                            <History className="mr-2 h-4 w-4" />
                            Histórico de atendimentos
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => handleDeleteClient(client.id, client.name)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir cliente
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
          } else {
            addClient(clientData);
            toast({
              title: "Cliente cadastrado",
              description: "Novo cliente foi adicionado com sucesso.",
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

export default Clients;
