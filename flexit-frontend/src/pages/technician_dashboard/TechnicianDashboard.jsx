import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTickets, updateTicketStatus } from "../../api/ticketApi";
import { getSessionUser } from "../../utils/sessionUser";

const allowedStatuses = ["IN_PROGRESS", "RESOLVED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH"];

function TechnicianDashboard() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formByTicket, setFormByTicket] = useState({});
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loadAssignedTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const allTickets = await getAllTickets();
      const assignedTickets = (Array.isArray(allTickets) ? allTickets : []).filter(
        (ticket) =>
          (ticket.assignedTechnicianId || "").trim() === sessionUser.userId.trim()
      );

      setTickets(assignedTickets);

      setFormByTicket((previous) => {
        const next = { ...previous };

        assignedTickets.forEach((ticket) => {
          if (!next[ticket.id]) {
            next[ticket.id] = {
              status: ticket.status === "RESOLVED" ? "RESOLVED" : "IN_PROGRESS",
              notes: ticket.resolutionNotes || "",
            };
          }
        });

        return next;
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load your assigned tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTickets();
  }, []);

  const handleChange = (ticketId, field, value) => {
    setFormByTicket((previous) => ({
      ...previous,
      [ticketId]: {
        ...(previous[ticketId] || { status: "IN_PROGRESS", notes: "" }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (ticket) => {
    const form = formByTicket[ticket.id] || { status: "IN_PROGRESS", notes: "" };

    if (!allowedStatuses.includes(form.status)) {
      setError("Technician can only set IN_PROGRESS or RESOLVED status.");
      return;
    }

    if (form.status === "RESOLVED" && !form.notes.trim()) {
      setError("Resolution notes are required when setting RESOLVED.");
      return;
    }

    setActionLoadingId(ticket.id);
    setError("");
    setMessage("");

    try {
      await updateTicketStatus(ticket.id, {
        status: form.status,
        notes: form.notes,
        techId: sessionUser.userId,
      });

      setMessage(`Ticket ${ticket.id} updated to ${form.status}.`);
      await loadAssignedTickets();
    } catch (submitError) {
      setError(submitError.message || "Unable to update ticket status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const filteredTickets = useMemo(() => {
    if (priorityFilter === "ALL") {
      return tickets;
    }

    return tickets.filter((ticket) => (ticket.priority || "MEDIUM") === priorityFilter);
  }, [tickets, priorityFilter]);

  if (sessionUser.role !== "TECHNICIAN") {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Technician Dashboard</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <p className="font-semibold">TECHNICIAN role required</p>
          <p className="mt-1 text-sm">
            Current role is {sessionUser.role}. Login as technician or set role=TECHNICIAN in session.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Technician Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">My Assigned Tickets</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          You can update only your assigned tickets to IN_PROGRESS or RESOLVED and add resolution notes.
        </p>
        <p className="mt-3 text-xs text-slate-300">
          Logged in as: {sessionUser.userName || "Technician"} ({sessionUser.userId || "No user ID"})
        </p>

        <div className="mt-5 max-w-xs">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Priority Filter</label>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-[#61CE70]"
          >
            {priorityFilters.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "ALL" ? "All priorities" : priority}
              </option>
            ))}
          </select>
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

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Loading your assigned tickets...
        </div>
      ) : filteredTickets.length ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const form = formByTicket[ticket.id] || { status: "IN_PROGRESS", notes: "" };

            return (
              <article key={ticket.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-xs font-medium text-slate-500">Ticket ID: {ticket.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{ticket.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{ticket.description || "No description provided."}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Current Status</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.status || "OPEN"}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Priority</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.priority || "MEDIUM"}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Reporter</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.reportedByUserName || ticket.reportedByUserId || "Unknown"}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Asset / Facility</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.assetFacility || "N/A"}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.category || "N/A"}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Attachments</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {ticket.attachmentUrls?.length ? (
                          ticket.attachmentUrls.slice(0, 3).map((attachmentUrl, index) => (
                            <Link
                              key={`${ticket.id}-attachment-${index}`}
                              to={`/technician/tickets/${ticket.id}`}
                              className="block h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-white"
                              title="Open ticket details to preview images"
                            >
                              <img
                                src={attachmentUrl}
                                alt={`Ticket ${ticket.id} attachment ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No images were added.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/technician/tickets/${ticket.id}`}
                        className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
                      >
                        View Ticket Details & Images
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Update Status</label>
                    <select
                      value={form.status}
                      onChange={(event) => handleChange(ticket.id, "status", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#61CE70]"
                    >
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>

                    <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">Resolution Notes</label>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(event) => handleChange(ticket.id, "notes", event.target.value)}
                      placeholder="Add resolution details"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#61CE70]"
                    />

                    <button
                      type="button"
                      onClick={() => handleSubmit(ticket)}
                      disabled={actionLoadingId === ticket.id}
                      className="mt-4 w-full rounded-xl bg-[#0a192f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:opacity-60"
                    >
                      {actionLoadingId === ticket.id ? "Updating..." : "Save Update"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
          {tickets.length
            ? "No tickets match the selected priority filter."
            : "No tickets are assigned to you right now."}
        </div>
      )}
    </section>
  );
}

export default TechnicianDashboard;
