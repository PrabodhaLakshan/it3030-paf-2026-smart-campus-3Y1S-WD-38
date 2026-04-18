import { useNavigate } from "react-router-dom";
import { createTicketWithFiles } from "../../api/ticketApi";
import TicketForm from "../../components/tickets/TicketForm";
import { getSessionUser } from "../../utils/sessionUser";

function CreateTicketPage() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const handleSubmit = async (payload, files) => {
    const savedTicket = await createTicketWithFiles(payload, files);

    if (savedTicket?.id) {
      navigate("/user/dashboard", { replace: true });
    }

    return savedTicket;
  };

  return (
    <TicketForm
      heading="Create a new ticket"
      description="Open an incident report with the minimum details needed to start triage."
      submitLabel="Create Ticket"
      onSubmit={handleSubmit}
      currentUserId={sessionUser.userId}
      currentUserName={sessionUser.userName}
      showReporterFields={!sessionUser.userId}
      allowAttachmentUpload
    />
  );
}

export default CreateTicketPage;