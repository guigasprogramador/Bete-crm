
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/lib/supabase";

type Payment = Database['public']['Tables']['payments']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface PaymentFormProps {
  payment?: Payment;
  clients: Client[];
  onSubmit: (payment: Omit<Payment, 'id'>) => void;
  onCancel: () => void;
}

export const PaymentForm = ({ payment, clients, onSubmit, onCancel }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    client_id: payment?.client_id || '',
    service_name: payment?.service_name || '',
    value: payment?.value || 0,
    due_date: payment?.due_date || '',
    status: payment?.status || 'Pendente' as const,
    payment_method: payment?.payment_method || '',
    payment_date: payment?.payment_date || ''
  });

  const selectedClient = clients.find(c => c.id === formData.client_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    // Converter strings vazias para null para campos de data
    const processedData = {
      ...formData,
      payment_date: formData.payment_date || null,
      payment_method: formData.payment_method || null
    };
    
    onSubmit(processedData);
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
      
      <div>
        <Label htmlFor="service">Serviço *</Label>
        <Input
          id="service"
          value={formData.service_name}
          onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
          required
        />
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
        <Label htmlFor="dueDate">Data de Vencimento *</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'Pago' | 'Pendente' | 'Atrasado') => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {formData.status === 'Pago' && (
        <>
          <div>
            <Label htmlFor="paymentDate">Data do Pagamento</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="method">Método de Pagamento</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {payment ? 'Atualizar' : 'Criar'} Cobrança
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
