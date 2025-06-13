
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Database } from "@/lib/supabase";

type Client = Database['public']['Tables']['clients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  clients: Client[];
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void;
  preSelectedClientId?: string;
}

export const AppointmentModal = ({ 
  open, 
  onOpenChange, 
  appointment, 
  clients, 
  onSubmit,
  preSelectedClientId 
}: AppointmentModalProps) => {
  const handleSubmit = (appointmentData: Omit<Appointment, 'id'>) => {
    onSubmit(appointmentData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <AppointmentForm
          appointment={appointment}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          preSelectedClientId={preSelectedClientId}
        />
      </DialogContent>
    </Dialog>
  );
};
