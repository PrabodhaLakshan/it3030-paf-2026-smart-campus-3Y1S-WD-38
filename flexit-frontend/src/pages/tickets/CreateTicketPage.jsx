import { useLocation, useNavigate } from "react-router-dom";
import { createTicket } from "../../api/ticketApi";
import TicketForm from "../../components/tickets/TicketForm";

function CreateTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin") ? "/admin/tickets" : "/tickets";

  const handleSubmit = async (payload) => {
    const savedTicket = await createTicket(payload);

    if (savedTicket?.id) {
      navigate(`${basePath}/${savedTicket.id}`);
    }

    return savedTicket;
  };

  return (
    <TicketForm
      heading="Create a new ticket"
      description="Open an incident report with the minimum details needed to start triage."
      submitLabel="Create Ticket"
      onSubmit={handleSubmit}
    />
  );
}

export default CreateTicketPage;