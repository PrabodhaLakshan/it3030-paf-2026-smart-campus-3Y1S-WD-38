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
    <section className="relative min-h-screen bg-linear-to-br from-slate-950 via-[#0a192f] to-slate-900 px-4 py-12 sm:px-6 space-y-8">
      <div className="pointer-events-none absolute top-0 left-0 h-96 w-96 rounded-full bg-cyan-300/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300/5 blur-3xl" />
      <div className="relative">
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

      </div>
      {deleteSuccess ? (
        <div className="relative mx-auto w-full max-w-4xl rounded-2xl border border-emerald-300/50 bg-linear-to-br from-emerald-500/15 to-emerald-500/5 px-4 py-3 text-sm font-medium text-emerald-100 shadow-lg">
          {deleteSuccess}
        </div>
      ) : null}

      {createdTicket ? (
        <div className="relative mx-auto w-full max-w-4xl rounded-3xl border border-cyan-200/30 bg-linear-to-br from-slate-900/80 via-slate-950/80 to-[#0a192f]/80 p-6 text-slate-100 shadow-2xl backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Created Ticket Summary</p>
          <h3 className="mt-3 text-xl font-semibold">Ticket #{createdTicket.id}</h3>
          <p className="mt-2 text-sm text-slate-300">{createdTicket.title || "No title"}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-200/20 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">User ID</p>
              <p className="mt-2 text-sm font-semibold text-slate-100">{createdTicket.reportedByUserId || "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/20 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-2 text-sm font-semibold text-emerald-300">{createdTicket.status || "OPEN"}</p>
            </div>
            <div className="rounded-2xl border border-cyan-200/20 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
              <p className="mt-2 text-sm font-semibold text-slate-100">{createdTicket.location || "N/A"}</p>
            </div>
          </div>

          {deleteError ? (
            <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
              {deleteError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/report-ticket/manage/${createdTicket.id}?userId=${encodeURIComponent(createdTicket.reportedByUserId || "")}`}
              className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#61CE70] to-cyan-400 px-4 py-2 text-sm font-semibold text-[#0a192f] shadow-lg transition hover:-translate-y-0.5 hover:from-white hover:to-[#c6ffd4]"
            >
              Edit Ticket
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-500 disabled:opacity-60"
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
