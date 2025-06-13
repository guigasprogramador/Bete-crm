
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { Database } from "@/lib/supabase";

type Payment = Database['public']['Tables']['payments']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
  clients: Client[];
  onSubmit: (payment: Omit<Payment, 'id'>) => void;
}

export const PaymentModal = ({ 
  open, 
  onOpenChange, 
  payment, 
  clients, 
  onSubmit 
}: PaymentModalProps) => {
  const handleSubmit = (paymentData: Omit<Payment, 'id'>) => {
    onSubmit(paymentData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {payment ? 'Editar Cobrança' : 'Nova Cobrança'}
          </DialogTitle>
          <DialogDescription>
            {payment ? 'Edite as informações da cobrança existente.' : 'Preencha os dados para criar uma nova cobrança.'}
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          payment={payment}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
