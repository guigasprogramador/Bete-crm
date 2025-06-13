
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/lib/supabase";

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface AppointmentFormProps {
  appointment?: Appointment;
  clients: Client[];
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void;
  onCancel: () => void;
  preSelectedClientId?: string;
}

export const AppointmentForm = ({ appointment, clients, onSubmit, onCancel, preSelectedClientId }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    client_id: appointment?.client_id || preSelectedClientId || '',
    appointment_date: appointment?.appointment_date || '',
    appointment_time: appointment?.appointment_time || '',
    service_name: appointment?.service_name || '',
    status: appointment?.status || 'Agendado' as const,
    value: appointment?.value || 0,
    notes: appointment?.notes || ''
  });

  const selectedClient = clients.find(c => c.id === formData.client_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    onSubmit({
      ...formData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="clientId">Cliente *</Label>
        <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="time">Horário *</Label>
          <Input
            id="time"
            type="time"
            value={formData.appointment_time}
            onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="service">Serviço *</Label>
        <Select value={formData.service_name} onValueChange={(value) => setFormData(prev => ({ ...prev, service_name: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Consulta inicial">Consulta inicial</SelectItem>
            <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
            <SelectItem value="Acompanhamento mensal">Acompanhamento mensal</SelectItem>
            <SelectItem value="Pacote completo">Pacote completo</SelectItem>
            <SelectItem value="Avaliação">Avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="value">Valor *</Label>
        <Input
          id="value"
          type="number"
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
          placeholder="R$ 0,00"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado') => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Agendado">Agendado</SelectItem>
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Observações sobre o agendamento..."
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {appointment ? 'Atualizar' : 'Agendar'} Atendimento
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
