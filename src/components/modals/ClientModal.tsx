
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/ClientForm";
import { Database } from "@/lib/supabase";

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSubmit: (client: Omit<Client, 'id'>) => void;
}

export const ClientModal = ({ open, onOpenChange, client, onSubmit }: ClientModalProps) => {
  const handleSubmit = (clientData: Omit<Client, 'id'>) => {
    onSubmit(clientData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <ClientForm
          client={client}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
