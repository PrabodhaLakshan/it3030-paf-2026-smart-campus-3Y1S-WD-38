import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTicket, getAllTickets } from "../../api/ticketApi";
import { getSessionUser } from "../../utils/sessionUser";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Plus,
  Ticket,
} from "lucide-react";

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

  const dashboardSummary = useMemo(() => {
    const openCount = tickets.filter((ticket) => (ticket.status || "OPEN") === "OPEN").length;
    const rejectedCount = tickets.filter((ticket) => (ticket.status || "") === "REJECTED").length;
    const approvedCount = tickets.filter((ticket) => (ticket.status || "") === "APPROVED").length;

    return [
      {
        label: "Total tickets",
        value: tickets.length,
        icon: Ticket,
        accent: "from-sky-500/15 to-cyan-400/10 text-sky-700",
      },
      {
        label: "Open tickets",
        value: openCount,
        icon: Clock3,
        accent: "from-amber-400/20 to-orange-300/10 text-amber-700",
      },
      {
        label: "Approved",
        value: approvedCount,
        icon: CheckCircle2,
        accent: "from-emerald-500/20 to-lime-300/10 text-emerald-700",
      },
      {
        label: "Needs attention",
        value: rejectedCount,
        icon: CircleAlert,
        accent: "from-rose-500/20 to-pink-300/10 text-rose-700",
      },
    ];
  }, [tickets]);

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 pb-1">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(10,25,47,0.98)_0%,_rgba(15,23,42,0.96)_52%,_rgba(97,206,112,0.82)_140%)] p-4 text-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.65)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
              User Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.7rem]">
              Welcome back, {sessionUser.userName || "User"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Create support tickets, track your requests, and keep an eye on what needs attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/user/tickets/create"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0a192f] transition hover:bg-emerald-100"
            >
              <Plus size={18} />
              Raise Ticket
            </Link>
            <Link
              to="/my-bookings"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              View Bookings
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dashboardSummary.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.label === "Total tickets" ? ticketCountLabel : "Live status summary"}</p>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br p-3 ${item.accent}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

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

      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Support activity</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">My Tickets</h2>
          </div>
          <p className="text-sm text-slate-500">{ticketCountLabel} in your account</p>
        </div>

        {loading ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Loading your tickets...
          </div>
        ) : tickets.length ? (
          <div className="mt-3 space-y-3">
            {tickets.map((ticket) => {
              const editable = canModifyTicket(ticket.status);

              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#61CE70]/30 hover:bg-white"
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
