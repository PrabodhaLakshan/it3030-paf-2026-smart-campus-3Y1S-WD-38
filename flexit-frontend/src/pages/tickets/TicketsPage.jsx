import { useEffect, useMemo, useState } from "react";
import { assignTechnician, getAllTickets, getTechnicians, updateTicketStatus } from "../../api/ticketApi";

const statusFilters = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

function extractTechniciansFromTickets(tickets) {
  const seen = new Set();
  const derived = [];

  (Array.isArray(tickets) ? tickets : []).forEach((ticket) => {
    const techId = (ticket.assignedTechnicianId || "").trim();
    if (!techId || seen.has(techId)) {
      return;
    }

    seen.add(techId);
    const techName = (ticket.assignedTechnicianName || "").trim();
    derived.push({ id: techId, name: techName || techId });
  });

  return derived;
}

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedTechnicianByTicket, setSelectedTechnicianByTicket] = useState({});
  const [customTechnicianByTicket, setCustomTechnicianByTicket] = useState({});
  const [rejectReasonByTicket, setRejectReasonByTicket] = useState({});
  const [closeNoteByTicket, setCloseNoteByTicket] = useState({});

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const [ticketResult, technicianResult] = await Promise.allSettled([
        getAllTickets(),
        getTechnicians(),
      ]);

      const nextTickets =
        ticketResult.status === "fulfilled" && Array.isArray(ticketResult.value)
          ? ticketResult.value
          : [];

      setTickets(nextTickets);

      if (technicianResult.status === "fulfilled" && Array.isArray(technicianResult.value)) {
        setTechnicians(technicianResult.value);
      } else {
        setTechnicians(extractTechniciansFromTickets(nextTickets));
      }

      if (ticketResult.status === "rejected") {
        throw ticketResult.reason;
      }

      // Keep selection sticky, while defaulting empty rows to currently assigned technician.
      setSelectedTechnicianByTicket((previous) => {
        const next = { ...previous };
        nextTickets.forEach((ticket) => {
          if (!next[ticket.id] && ticket.assignedTechnicianId) {
            next[ticket.id] = ticket.assignedTechnicianId;
          }
        });
        return next;
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const technicianOptions = useMemo(() => {
    const seen = new Set();
    const options = [];

    technicians.forEach((tech) => {
      const techId = (tech.id || "").trim();
      if (!techId || seen.has(techId)) {
        return;
      }

      seen.add(techId);
      const techName = (tech.name || "").trim();
      options.push({
        id: techId,
        label: techName ? `${techName} (${techId})` : techId,
      });
    });

    tickets.forEach((ticket) => {
      const techId = (ticket.assignedTechnicianId || "").trim();
      if (!techId || seen.has(techId)) {
        return;
      }

      seen.add(techId);
      options.push({
        id: techId,
        label: ticket.assignedTechnicianName
          ? `${ticket.assignedTechnicianName} (${techId})`
          : techId,
      });
    });

    return options;
  }, [tickets, technicians]);

  const resolveTechnicianId = (ticketId) => {
    const selected = (selectedTechnicianByTicket[ticketId] || "").trim();
    if (selected) {
      return selected;
    }

    return (customTechnicianByTicket[ticketId] || "").trim();
  };

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

  const runAction = async (ticketId, fn, successText) => {
    setActionMessage("");
    setActionError("");
    setActionLoadingId(ticketId);

    try {
      await fn();
      setActionMessage(successText);
      await loadTickets();
    } catch (submitError) {
      setActionError(submitError.message || "Action failed.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleAssign = async (ticket) => {
    const techId = resolveTechnicianId(ticket.id);
    if (!techId) {
      setActionError("Please select a technician or enter a technician ID before assigning.");
      return;
    }

    await runAction(
      ticket.id,
      () => assignTechnician(ticket.id, techId),
      `Ticket ${ticket.id} assigned to ${techId}.`
    );
  };

  const handleReject = async (ticket) => {
    const techId = (resolveTechnicianId(ticket.id) || ticket.assignedTechnicianId || "").trim();
    const notes = (rejectReasonByTicket[ticket.id] || "").trim();

    if (!techId) {
      setActionError("Reject action needs a technician selection.");
      return;
    }

    if (!notes) {
      setActionError("Reject action needs a reason.");
      return;
    }

    await runAction(
      ticket.id,
      () => updateTicketStatus(ticket.id, { status: "REJECTED", notes, techId }),
      `Ticket ${ticket.id} rejected.`
    );
  };

  const handleClose = async (ticket) => {
    const notes = (closeNoteByTicket[ticket.id] || "").trim();
    const userId = (ticket.reportedByUserId || "").trim();

    if (!userId) {
      setActionError("Close action failed: reporter user ID is missing on this ticket.");
      return;
    }

    await runAction(
      ticket.id,
      () =>
        updateTicketStatus(ticket.id, {
          status: "RESOLVED",
          notes,
          techId: (resolveTechnicianId(ticket.id) || ticket.assignedTechnicianId || "").trim(),
          userId,
        }),
      `Ticket ${ticket.id} closed.`
    );
  };

  const isActionLoading = (ticketId) => actionLoadingId === ticketId;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Management</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">All Tickets Table</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Filter all tickets by status and priority, assign technicians, and apply reject or close actions.
            </p>
          </div>
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
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            {technicianOptions.length} technician option{technicianOptions.length === 1 ? "" : "s"}
          </span>
        </div>

        {actionMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {actionMessage}
          </div>
        ) : null}

        {actionError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {actionError}
          </div>
        ) : null}
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
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-325 w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">Ticket</th>
                  <th className="px-4 py-3 font-semibold">Reporter</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Assigned</th>
                  <th className="px-4 py-3 font-semibold">Assign</th>
                  <th className="px-4 py-3 font-semibold">Reject</th>
                  <th className="px-4 py-3 font-semibold">Close</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{ticket.title}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {ticket.id}</p>
                      <p className="text-xs text-slate-500 mt-1">{ticket.description || "No description"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-900">{ticket.reportedByUserName || "N/A"}</p>
                      <p className="text-xs text-slate-500 mt-1">{ticket.reportedByUserId || "No user ID"}</p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.priority || "MEDIUM"}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.status || "OPEN"}</td>
                    <td className="px-4 py-4">
                      <p className="text-slate-900">{ticket.assignedTechnicianName || "Unassigned"}</p>
                      <p className="text-xs text-slate-500 mt-1">{ticket.assignedTechnicianId || "No technician"}</p>
                    </td>
                    <td className="px-4 py-4 space-y-2">
                      <select
                        value={selectedTechnicianByTicket[ticket.id] || ""}
                        onChange={(event) =>
                          setSelectedTechnicianByTicket((previous) => ({
                            ...previous,
                            [ticket.id]: event.target.value,
                          }))
                        }
                        className="w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-[#61CE70]"
                      >
                        <option value="">Select Technician</option>
                        {technicianOptions.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={customTechnicianByTicket[ticket.id] || ""}
                        onChange={(event) =>
                          setCustomTechnicianByTicket((previous) => ({
                            ...previous,
                            [ticket.id]: event.target.value,
                          }))
                        }
                        placeholder="or type tech ID"
                        className="w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#61CE70]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAssign(ticket)}
                        disabled={isActionLoading(ticket.id)}
                        className="block rounded-xl bg-[#0a192f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:opacity-60"
                      >
                        {isActionLoading(ticket.id) ? "Working..." : "Assign"}
                      </button>
                    </td>
                    <td className="px-4 py-4 space-y-2">
                      <textarea
                        rows={2}
                        value={rejectReasonByTicket[ticket.id] || ""}
                        onChange={(event) =>
                          setRejectReasonByTicket((previous) => ({
                            ...previous,
                            [ticket.id]: event.target.value,
                          }))
                        }
                        placeholder="Reject reason"
                        className="w-52 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-[#61CE70]"
                      />
                      <button
                        type="button"
                        onClick={() => handleReject(ticket)}
                        disabled={isActionLoading(ticket.id)}
                        className="block rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        {isActionLoading(ticket.id) ? "Working..." : "Reject"}
                      </button>
                    </td>
                    <td className="px-4 py-4 space-y-2">
                      <textarea
                        rows={2}
                        value={closeNoteByTicket[ticket.id] || ""}
                        onChange={(event) =>
                          setCloseNoteByTicket((previous) => ({
                            ...previous,
                            [ticket.id]: event.target.value,
                          }))
                        }
                        placeholder="Close note (optional)"
                        className="w-52 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-[#61CE70]"
                      />
                      <button
                        type="button"
                        onClick={() => handleClose(ticket)}
                        disabled={isActionLoading(ticket.id)}
                        className="block rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {isActionLoading(ticket.id) ? "Working..." : "Close"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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