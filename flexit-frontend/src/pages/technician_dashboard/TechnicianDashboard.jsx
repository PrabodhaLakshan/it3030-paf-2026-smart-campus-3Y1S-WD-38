import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllTickets, updateTicketStatus } from "../../api/ticketApi";
import { getSessionUser } from "../../utils/sessionUser";

const allowedStatuses = ["IN_PROGRESS", "RESOLVED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH"];
const RESOLVED_REPORT_CACHE_KEY = "technicianResolvedReportCache";

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

function getLatestTechnicianComment(ticket, technicianId) {
  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];
  const normalizedTechnicianId = (technicianId || "").trim();

  return comments
    .filter((comment) => {
      const commentUserId = (comment?.userId || "").trim();
      return normalizedTechnicianId && commentUserId === normalizedTechnicianId;
    })
    .slice()
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))[0] || null;
}

function readResolvedCache(technicianId) {
  try {
    const raw = window.localStorage.getItem(RESOLVED_REPORT_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const key = (technicianId || "").trim();
    const cached = key ? parsed[key] : [];
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function writeResolvedCache(technicianId, tickets) {
  try {
    const raw = window.localStorage.getItem(RESOLVED_REPORT_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const key = (technicianId || "").trim();

    if (!key) {
      return;
    }

    parsed[key] = (Array.isArray(tickets) ? tickets : []).slice(0, 100);
    window.localStorage.setItem(RESOLVED_REPORT_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore cache write issues and keep dashboard functional.
  }
}

function mergeResolvedTickets(activeTickets, cachedTickets) {
  const byId = new Map();

  (Array.isArray(activeTickets) ? activeTickets : [])
    .filter((ticket) => (ticket.status || "OPEN") === "RESOLVED")
    .forEach((ticket) => {
      byId.set(ticket.id, ticket);
    });

  (Array.isArray(cachedTickets) ? cachedTickets : []).forEach((ticket) => {
    if (!ticket?.id || byId.has(ticket.id)) {
      return;
    }

    byId.set(ticket.id, ticket);
  });

  return Array.from(byId.values()).sort(
    (left, right) => new Date(right.resolvedAt || right.createdAt || 0) - new Date(left.resolvedAt || left.createdAt || 0)
  );
}

function TechnicianDashboard() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formByTicket, setFormByTicket] = useState({});
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [resolvedHistory, setResolvedHistory] = useState([]);

  useEffect(() => {
    setResolvedHistory(readResolvedCache(sessionUser.userId));
  }, [sessionUser.userId]);

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

      // If RESOLVED, remove immediately from display and show completion message
      if (form.status === "RESOLVED") {
        const resolvedSnapshot = {
          ...ticket,
          status: "RESOLVED",
          resolutionNotes: form.notes,
          resolvedAt: new Date().toISOString(),
        };

        setResolvedHistory((previous) => {
          const merged = mergeResolvedTickets([resolvedSnapshot], previous);
          writeResolvedCache(sessionUser.userId, merged);
          return merged;
        });

        setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
        setMessage(`✓ Ticket ${ticket.id} marked as DONE and removed from your dashboard.`);
      } else {
        setMessage(`Ticket ${ticket.id} updated to ${form.status}.`);
        await loadAssignedTickets();
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to update ticket status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDownloadReport = () => {
    const resolvedTickets = mergeResolvedTickets(tickets, resolvedHistory);

    if (!resolvedTickets.length) {
      setError("No resolved tickets are available to generate a report.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const fileName = `technician_report_${(sessionUser.userId || "technician").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Technician Work Report", 14, 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Technician: ${sessionUser.userName || "Technician"} (${sessionUser.userId || "N/A"})`, 14, 23);
    doc.text(`Generated on: ${formatDate(new Date())}`, 14, 29);
    doc.text(`Resolved tickets: ${resolvedTickets.length}`, 14, 35);

    autoTable(doc, {
      startY: 41,
      head: [["Ticket ID", "Title", "Priority", "Resolved At", "Notes"]],
      body: resolvedTickets.map((ticket) => {
        const latestComment = getLatestTechnicianComment(ticket, sessionUser.userId);
        return [
          ticket.id || "N/A",
          ticket.title || "N/A",
          ticket.priority || "MEDIUM",
          formatDate(latestComment?.createdAt || ticket.resolvedAt || ticket.createdAt),
          latestComment?.text || ticket.resolutionNotes || "No completion note provided.",
        ];
      }),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "top",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [10, 25, 47],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 22 },
        3: { cellWidth: 32 },
        4: { cellWidth: "auto" },
      },
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    resolvedTickets.forEach((ticket, index) => {
      const latestComment = getLatestTechnicianComment(ticket, sessionUser.userId);
      const completionNote = latestComment?.text || ticket.resolutionNotes || "No completion note provided.";
      const attachmentUrl = latestComment?.imageUrl || "";

      if (currentY > 180) {
        doc.addPage();
        currentY = 16;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Ticket ${ticket.id}`, 14, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const sectionLines = [
        `Completed at: ${formatDate(latestComment?.createdAt || ticket.resolvedAt || ticket.createdAt)}`,
        `Assigned technician: ${ticket.assignedTechnicianName || ticket.assignedTechnicianId || "Unassigned"}`,
        `Work done: ${completionNote}`,
      ];

      sectionLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 260);
        doc.text(wrapped, 14, currentY);
        currentY += wrapped.length * 5 + 1;
      });

      if (attachmentUrl) {
        try {
          doc.addImage(attachmentUrl, 14, currentY, 70, 48);
          currentY += 52;
        } catch {
          doc.text("Attachment image could not be embedded.", 14, currentY);
          currentY += 6;
        }
      }

      if (index < resolvedTickets.length - 1) {
        currentY += 2;
        doc.setDrawColor(225, 229, 235);
        doc.line(14, currentY, 283, currentY);
        currentY += 6;
      }
    });

    doc.save(fileName);
    setMessage(`PDF report downloaded for ${resolvedTickets.length} resolved ticket${resolvedTickets.length === 1 ? "" : "s"}.`);
    setError("");
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

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="max-w-xs">
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
          <button
            type="button"
            onClick={handleDownloadReport}
            className="rounded-xl bg-[#61CE70] px-4 py-2.5 text-sm font-semibold text-[#0a192f] transition hover:bg-white"
          >
            Download PDF Report
          </button>
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
