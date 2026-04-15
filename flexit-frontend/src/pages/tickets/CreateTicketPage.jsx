import { useLocation, useNavigate } from "react-router-dom";
import { createTicketWithFiles } from "../../api/ticketApi";
import TicketForm from "../../components/tickets/TicketForm";
import { getSessionUser } from "../../utils/sessionUser";

function CreateTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getSessionUser();
  const basePath = location.pathname.startsWith("/admin")
    ? "/admin/tickets"
    : location.pathname.startsWith("/user")
      ? "/user/tickets"
      : "/tickets";

  const handleSubmit = async (payload, files) => {
    const savedTicket = await createTicketWithFiles(payload, files);

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
      currentUserId={sessionUser.userId}
      currentUserName={sessionUser.userName}
      showReporterFields={!sessionUser.userId}
      allowAttachmentUpload
    />
  );
}

export default CreateTicketPage;