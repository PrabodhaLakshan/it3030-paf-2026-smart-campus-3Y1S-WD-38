import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTicket, getAllTickets } from "../../api/ticketApi";
import { getSessionUser } from "../../utils/sessionUser";

function UserDashboard() {
  const sessionUser = getSessionUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const allTickets = await getAllTickets();
      const ownTickets = (Array.isArray(allTickets) ? allTickets : [])
        .filter((ticket) => (ticket?.reportedByUserId || "").trim() === (sessionUser.userId || "").trim())
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
      setTickets(ownTickets);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const canModifyTicket = (status) => {
    const nextStatus = status || "OPEN";
    return nextStatus === "OPEN" || nextStatus === "REJECTED";
  };

  const handleDelete = async (ticket) => {
    if (!ticket?.id || !sessionUser.userId) {
      return;
    }

    const confirmed = window.confirm(`Delete ticket ${ticket.id}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingId(ticket.id);
    setError("");
    setMessage("");

    try {
      await deleteTicket(ticket.id, sessionUser.userId);
      setMessage(`Ticket ${ticket.id} deleted successfully.`);
      setTickets((previous) => previous.filter((item) => item.id !== ticket.id));
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete ticket.");
    } finally {
      setDeletingId("");
    }
  };

  const ticketCountLabel = useMemo(() => {
    if (tickets.length === 1) {
      return "1 ticket";
    }

    return `${tickets.length} tickets`;
  }, [tickets.length]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">User Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome, {sessionUser.userName || "User"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Need help with an issue? Create a support ticket and our team will follow up.
        </p>
        <p className="mt-2 text-sm font-medium text-slate-500">{ticketCountLabel} in your account</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/user/tickets/create"
            className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#0a192f] to-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-[#0a192f] hover:to-emerald-500 hover:text-[#0a192f]"
          >
            Raise Ticket
          </Link>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>

        {loading ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Loading your tickets...
          </div>
        ) : tickets.length ? (
          <div className="mt-4 space-y-3">
            {tickets.map((ticket) => {
              const editable = canModifyTicket(ticket.status);

              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{ticket.title || "Untitled ticket"}</p>
                      <p className="mt-1 text-xs text-slate-500">Ticket ID: {ticket.id || "N/A"}</p>
                      <p className="mt-2 text-sm text-slate-600">{ticket.description || "No description provided."}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">Status: {ticket.status || "OPEN"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/user/tickets/${ticket.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
                      >
                        View
                      </Link>
                      <Link
                        to={`/user/tickets/edit/${ticket.id}?userId=${encodeURIComponent(sessionUser.userId || ticket.reportedByUserId || "")}`}
                        className="rounded-xl bg-[#0a192f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f]"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(ticket)}
                        disabled={!editable || deletingId === ticket.id}
                        className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        {deletingId === ticket.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No tickets yet. Click Raise Ticket to create your first incident.
          </div>
        )}
      </div>
    </section>
  );
}

export default UserDashboard;
