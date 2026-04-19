import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { deleteTicket, getTicketById, updateTicket } from "../../api/ticketApi";
import TicketForm from "../../components/tickets/TicketForm";
import { getSessionUser } from "../../utils/sessionUser";

function TicketEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionUser = getSessionUser();

  const isUserRoute = location.pathname.startsWith("/user");
  const basePath = isUserRoute ? "/user/tickets" : "/report-ticket";
  const fallbackPath = isUserRoute ? "/user/dashboard" : "/report-ticket";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const ownerUserId = (searchParams.get("userId") || sessionUser.userId || ticket?.reportedByUserId || "").trim();

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getTicketById(id);
        setTicket(data);
      } catch (loadError) {
        setError(loadError.message || "Unable to load ticket.");
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!ownerUserId) {
        throw new Error("User ID is required to update this ticket.");
      }

      const updatedTicket = await updateTicket(id, {
        ...payload,
        userId: ownerUserId,
      });

      setTicket(updatedTicket);
      setMessage(`Ticket ${updatedTicket?.id || id} updated successfully.`);
      return updatedTicket;
    } finally {
      setSaving(false);
    }
  };

  const handleSuccess = (savedTicket) => {
    setTicket(savedTicket);
    setMessage(`Ticket ${savedTicket?.id || id} updated successfully.`);
  };

  const handleDelete = async () => {
    if (!ownerUserId) {
      setError("User ID is required to delete this ticket.");
      return;
    }

    const confirmed = window.confirm(`Delete ticket ${id}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await deleteTicket(id, ownerUserId);
      navigate(fallbackPath, { replace: true });
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete ticket.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading ticket editor...
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <p className="font-semibold">Unable to load ticket</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => navigate(fallbackPath)}
          className="mt-4 rounded-2xl bg-[#0a192f] px-4 py-2 text-sm font-semibold text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Edit</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Edit your ticket</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Update the incident details you submitted. Attachments stay as they are while the ticket is being edited.
            </p>
          </div>

          <Link
            to={isUserRoute ? `/user/tickets/${id}` : "/report-ticket"}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
          >
            {isUserRoute ? "Back to details" : "Back to report form"}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Title</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket?.title || "N/A"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Current status</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket?.status || "OPEN"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Owner</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket?.reportedByUserName || ticket?.reportedByUserId || ownerUserId || "N/A"}</p>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <TicketForm
            key={ticket?.id || id}
            initialData={ticket}
            heading="Edit ticket"
            description="Update the details you submitted earlier. The support team will keep the latest version of the request."
            submitLabel={saving ? "Saving..." : "Update Ticket"}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            currentUserId={ownerUserId}
            currentUserName={ticket?.reportedByUserName || sessionUser.userName}
            showReporterFields={false}
            allowAttachmentUpload={false}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Ticket"}
          </button>
          <Link
            to={fallbackPath}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
          >
            {isUserRoute ? "Back to dashboard" : "Back to report form"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TicketEditPage;