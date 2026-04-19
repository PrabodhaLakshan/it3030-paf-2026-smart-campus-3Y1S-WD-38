import { Link } from "react-router-dom";

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

function TicketCard({ ticket, detailsPath, editPath }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
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

          <h3 className="text-lg font-semibold text-slate-900">{ticket.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 line-clamp-2">
            {ticket.description || "No description provided."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={detailsPath}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#61CE70] hover:text-[#0a192f]"
          >
            View
          </Link>
          <Link
            to={editPath}
            className="rounded-xl bg-[#0a192f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#61CE70] hover:text-[#0a192f]"
          >
            Update
          </Link>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-slate-500">Reported by</dt>
          <dd className="mt-1 text-slate-900">{ticket.reportedByUserName || ticket.reportedByUserId || "Unknown"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Assigned to</dt>
          <dd className="mt-1 text-slate-900">{ticket.assignedTechnicianName || ticket.assignedTechnicianId || "Unassigned"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Comments</dt>
          <dd className="mt-1 text-slate-900">{ticket.comments?.length || 0}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Created</dt>
          <dd className="mt-1 text-slate-900">{formatDate(ticket.createdAt)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Location</dt>
          <dd className="mt-1 text-slate-900">{ticket.location || "N/A"}</dd>
        </div>
      </dl>
    </article>
  );
}

export default TicketCard;