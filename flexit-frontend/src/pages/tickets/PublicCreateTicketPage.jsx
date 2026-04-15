import { useState } from "react";
import { Link } from "react-router-dom";
import { createTicketWithFiles, deleteTicket } from "../../api/ticketApi";
import TicketForm from "../../components/tickets/TicketForm";
import { getSessionUser } from "../../utils/sessionUser";

function PublicCreateTicketPage() {
  const sessionUser = getSessionUser();
  const [createdTicket, setCreatedTicket] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (payload, files) => {
    return createTicketWithFiles(payload, files);
  };

  const handleCreateSuccess = (savedTicket, payload) => {
    const fallbackUserId = (payload?.reportedByUserId || "").trim();
    const ownerUserId = (savedTicket?.reportedByUserId || fallbackUserId || "").trim();

    setDeleteError("");
    setDeleteSuccess("");
    setCreatedTicket({
      ...savedTicket,
      reportedByUserId: ownerUserId,
      reportedByUserName: savedTicket?.reportedByUserName || payload?.reportedByUserName || "",
    });
  };

  const handleDelete = async () => {
    if (!createdTicket?.id) {
      return;
    }

    const ownerUserId = (createdTicket.reportedByUserId || "").trim();
    if (!ownerUserId) {
      setDeleteError("User ID is required to delete this ticket.");
      return;
    }

    const confirmed = window.confirm("Delete this ticket permanently?");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteError("");
    setDeleteSuccess("");

    try {
      await deleteTicket(createdTicket.id, ownerUserId);
      setDeleteSuccess("Ticket deleted successfully.");
      setCreatedTicket(null);
    } catch (submitError) {
      setDeleteError(submitError.message || "Unable to delete ticket.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 px-4 py-10 sm:px-8 space-y-6">
      <TicketForm
        heading="Report an issue"
        description="Submit your incident without logging in. Add your user details so the support team can reach you."
        submitLabel="Submit Ticket"
        onSubmit={handleSubmit}
        onSuccess={handleCreateSuccess}
        currentUserId={sessionUser.userId}
        currentUserName={sessionUser.userName}
        showReporterFields={!sessionUser.userId}
        allowAttachmentUpload
      />

      {deleteSuccess ? (
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100">
          {deleteSuccess}
        </div>
      ) : null}

      {createdTicket ? (
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 text-slate-100 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Created Ticket Summary</p>
          <h3 className="mt-3 text-xl font-semibold">Ticket #{createdTicket.id}</h3>
          <p className="mt-2 text-sm text-slate-300">{createdTicket.title || "No title"}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">User ID</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{createdTicket.reportedByUserId || "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{createdTicket.status || "OPEN"}</p>
            </div>
          </div>

          {deleteError ? (
            <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
              {deleteError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to={`/report-ticket/manage/${createdTicket.id}?userId=${encodeURIComponent(createdTicket.reportedByUserId || "")}`}
              className="inline-flex items-center justify-center rounded-2xl bg-[#61CE70] px-4 py-2 text-sm font-semibold text-[#0a192f] transition hover:bg-white"
            >
              Edit Ticket
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Ticket"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default PublicCreateTicketPage;
