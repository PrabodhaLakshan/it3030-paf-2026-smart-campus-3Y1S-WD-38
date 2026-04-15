import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAllTickets } from "../../api/ticketApi";
import TicketCard from "../../components/tickets/TicketCard";

const statusFilters = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

function TicketsPage() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const basePath = isAdminRoute ? "/admin/tickets" : "/tickets";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets
      .slice()
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .filter((ticket) => {
        const matchesSearch =
          !searchTerm ||
          ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.reportedByUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.reportedByUserId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const counts = tickets.reduce(
    (accumulator, ticket) => {
      const status = ticket.status || "OPEN";
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    },
    { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0 }
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Desk</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Support tickets</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Monitor incident reports, track progress, and keep every update in one place.
            </p>
          </div>

          <Link
            to={`${basePath}/create`}
            className="inline-flex items-center justify-center rounded-2xl bg-[#61CE70] px-5 py-3 text-sm font-semibold text-[#0a192f] transition hover:bg-white"
          >
            New Ticket
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Open</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.OPEN}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.IN_PROGRESS}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.RESOLVED}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.REJECTED}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, description, or reporter"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15 lg:col-span-1"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
          >
            {priorityFilters.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "ALL" ? "All priorities" : priority}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadTickets}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
          >
            Refresh
          </button>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            {filteredTickets.length} ticket{filteredTickets.length === 1 ? "" : "s"} shown
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Loading tickets...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          <p className="font-semibold">Unable to load tickets</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : filteredTickets.length ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              detailsPath={`${basePath}/${ticket.id}`}
              editPath={`${basePath}/edit/${ticket.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No tickets match the current filters.</p>
          <p className="mt-2 text-sm">Try clearing the search fields or create a new ticket.</p>
        </div>
      )}
    </section>
  );
}

export default TicketsPage;