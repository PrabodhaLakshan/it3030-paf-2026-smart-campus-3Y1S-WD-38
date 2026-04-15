import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getTicketById } from "../../api/ticketApi";
import CommentSection from "../../components/tickets/CommentSection";

const statusStyles = {
  OPEN: "bg-amber-500/15 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-sky-500/15 text-sky-700 border-sky-200",
  RESOLVED: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-500/15 text-rose-700 border-rose-200",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-indigo-500/15 text-indigo-700 border-indigo-200",
  HIGH: "bg-orange-500/15 text-orange-700 border-orange-200",
  URGENT: "bg-red-500/15 text-red-700 border-red-200",
};

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin") ? "/admin/tickets" : "/tickets";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTicket = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTicketById(id);
      setTicket(data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading ticket details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <p className="font-semibold">Unable to load ticket</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="mt-4 rounded-2xl bg-[#0a192f] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status] || statusStyles.OPEN}`}
              >
                {ticket.status || "OPEN"}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority] || priorityStyles.MEDIUM}`}
              >
                {ticket.priority || "MEDIUM"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold text-slate-900">{ticket.title}</h1>
            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {ticket.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={basePath}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
            >
              Back
            </Link>
            <Link
              to={`${basePath}/edit/${ticket.id}`}
              className="rounded-2xl bg-[#0a192f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f]"
            >
              Update Status
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Reported by</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.reportedByUserName || ticket.reportedByUserId || "Unknown"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Assigned technician</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.assignedTechnicianName || ticket.assignedTechnicianId || "Unassigned"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Created at</p>
            <p className="mt-1 font-semibold text-slate-900">{formatDate(ticket.createdAt)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Comment count</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.comments?.length || 0}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Attachments</h2>
            <div className="mt-4 space-y-3">
              {ticket.attachmentUrls?.length ? (
                ticket.attachmentUrls.map((attachmentUrl, index) => (
                  <a
                    key={`${attachmentUrl}-${index}`}
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#0a192f] transition hover:border-[#61CE70] hover:text-[#61CE70]"
                  >
                    {attachmentUrl}
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-500">No attachments were added.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resolution</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-500">Resolution notes</p>
                <p className="mt-1 whitespace-pre-wrap">{ticket.resolutionNotes || "No resolution notes yet."}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">Rejection reason</p>
                <p className="mt-1 whitespace-pre-wrap">{ticket.rejectionReason || "No rejection reason yet."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommentSection ticketId={ticket.id} comments={ticket.comments || []} onRefresh={loadTicket} />
    </section>
  );
}

export default TicketDetailsPage;