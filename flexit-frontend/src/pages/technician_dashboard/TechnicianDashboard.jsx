import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllTickets, updateTicketStatus } from "../../api/ticketApi";
import { getSessionUser } from "../../utils/sessionUser";

const allowedStatuses = ["IN_PROGRESS", "RESOLVED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH"];
const RESOLVED_REPORT_CACHE_KEY = "technicianResolvedReportCache";
const HIDDEN_RESOLVED_IDS_KEY = "technicianHiddenResolvedIds";

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

function getResolutionCompletedAt(ticket, technicianId) {
  return ticket?.resolvedAt || null;
}

function getElapsedMinutes(startValue, endValue) {
  const startMs = new Date(startValue || 0).getTime();
  const endMs = new Date(endValue || 0).getTime();

  if (!startMs || !endMs || Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return null;
  }

  return Math.floor((endMs - startMs) / (1000 * 60));
}

function formatDurationMinutes(totalMinutes) {
  if (typeof totalMinutes !== "number" || totalMinutes < 0) {
    return "N/A";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function getSlaTimerMeta(ticket, nowMs, technicianId) {
  const isResolved = (ticket?.status || "OPEN") === "RESOLVED";
  const startValue = ticket?.assignedAt || ticket?.createdAt;
  const endValue = isResolved ? getResolutionCompletedAt(ticket, technicianId) : nowMs;
  const elapsedMinutes = getElapsedMinutes(startValue, endValue);
  const isBreached =
    (ticket?.status || "OPEN") === "IN_PROGRESS" &&
    typeof elapsedMinutes === "number" &&
    elapsedMinutes > 4 * 60;

  return {
    isResolved,
    isBreached,
    label: isResolved
      ? `Total Resolution Time: ${formatDurationMinutes(elapsedMinutes)}`
      : `Time Since Assigned: ${formatDurationMinutes(elapsedMinutes)}`,
  };
}

function calculateAverageResolutionHours(resolvedTickets, technicianId) {
  const durations = (Array.isArray(resolvedTickets) ? resolvedTickets : [])
    .map((ticket) => {
      const start = new Date(ticket?.assignedAt || ticket?.createdAt || 0).getTime();
      const end = new Date(ticket?.resolvedAt || 0).getTime();

      if (!start || !end || Number.isNaN(start) || Number.isNaN(end) || end < start) {
        return null;
      }

      return (end - start) / (1000 * 60 * 60);
    })
    .filter((value) => typeof value === "number");

  if (!durations.length) {
    return "N/A";
  }

  const averageHours = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  return `${averageHours.toFixed(1)} hrs`;
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

function readHiddenResolvedIds(technicianId) {
  try {
    const raw = window.localStorage.getItem(HIDDEN_RESOLVED_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const key = (technicianId || "").trim();
    const hidden = key ? parsed[key] : [];
    return Array.isArray(hidden) ? hidden : [];
  } catch {
    return [];
  }
}

function writeHiddenResolvedIds(technicianId, ids) {
  try {
    const raw = window.localStorage.getItem(HIDDEN_RESOLVED_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const key = (technicianId || "").trim();

    if (!key) {
      return;
    }

    const previous = Array.isArray(parsed[key]) ? parsed[key] : [];
    const merged = Array.from(new Set([...previous, ...(Array.isArray(ids) ? ids : [])]));
    parsed[key] = merged;
    window.localStorage.setItem(HIDDEN_RESOLVED_IDS_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage issues and keep dashboard usable.
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formByTicket, setFormByTicket] = useState({});
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [resolvedHistory, setResolvedHistory] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalResolved: 0,
    pendingTasks: 0,
    averageResolutionTime: "N/A",
  });

  useEffect(() => {
    setResolvedHistory(readResolvedCache(sessionUser.userId));
  }, [sessionUser.userId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const loadAssignedTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const allTickets = await getAllTickets();
      const hiddenResolvedIds = new Set(readHiddenResolvedIds(sessionUser.userId));
      const assignedToCurrentTech = (Array.isArray(allTickets) ? allTickets : []).filter(
        (ticket) => (ticket.assignedTechnicianId || "").trim() === sessionUser.userId.trim()
      );

      const assignedTickets = (Array.isArray(allTickets) ? allTickets : []).filter(
        (ticket) => {
          const isAssignedToCurrentTech = (ticket.assignedTechnicianId || "").trim() === sessionUser.userId.trim();
          const isHiddenResolved = (ticket.status || "OPEN") === "RESOLVED" && hiddenResolvedIds.has(ticket.id);
          return isAssignedToCurrentTech && !isHiddenResolved;
        }
      );

      const resolvedTickets = assignedToCurrentTech.filter((ticket) => (ticket.status || "OPEN") === "RESOLVED");
      const pendingTasks = assignedToCurrentTech.filter(
        (ticket) => !["RESOLVED", "REJECTED"].includes(ticket.status || "OPEN")
      );

      setAnalytics({
        totalResolved: resolvedTickets.length,
        pendingTasks: pendingTasks.length,
        averageResolutionTime: calculateAverageResolutionHours(resolvedTickets, sessionUser.userId),
      });

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

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage("");
    try {
      await loadAssignedTickets();
      setMessage("✓ Dashboard refreshed successfully.");
      setError("");
    } catch (refreshError) {
      setError(refreshError.message || "Unable to refresh dashboard.");
      setMessage("");
    } finally {
      setRefreshing(false);
    }
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
          formatDate(ticket.resolvedAt || ticket.createdAt),
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
        `Completed at: ${formatDate(ticket.resolvedAt || ticket.createdAt)}`,
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
    const downloadedResolvedIds = resolvedTickets.map((ticket) => ticket.id).filter(Boolean);

    if (downloadedResolvedIds.length) {
      writeHiddenResolvedIds(sessionUser.userId, downloadedResolvedIds);
      setTickets((previous) =>
        previous.filter(
          (ticket) => !((ticket.status || "OPEN") === "RESOLVED" && downloadedResolvedIds.includes(ticket.id))
        )
      );
      setResolvedHistory([]);
      writeResolvedCache(sessionUser.userId, []);
    }

    setMessage(`PDF report downloaded and ${resolvedTickets.length} resolved ticket${resolvedTickets.length === 1 ? "" : "s"} removed from dashboard.`);
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
      <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#61CE70]/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative">
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
                className="w-full rounded-2xl border border-white/15 bg-[#61CE70] px-3 py-2 text-sm text-[#0a192f] font-semibold outline-none transition focus:ring-4 focus:ring-white/20"
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
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full bg-[#61CE70] px-3.5 py-2 text-xs font-semibold text-[#0a192f] transition hover:bg-white disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="rounded-full bg-[#61CE70] px-3.5 py-2 text-xs font-semibold text-[#0a192f] transition hover:bg-white sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Download PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg ring-1 ring-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Resolved</p>
          <p className="mt-2 text-3xl font-semibold text-[#0a192f]">{analytics.totalResolved}</p>
          <p className="mt-1 text-sm text-slate-500">Completed tasks so far</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg ring-1 ring-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending Tasks</p>
          <p className="mt-2 text-3xl font-semibold text-[#0a192f]">{analytics.pendingTasks}</p>
          <p className="mt-1 text-sm text-slate-500">Currently open or in progress</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg ring-1 ring-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Average Resolution Time</p>
          <p className="mt-2 text-3xl font-semibold text-[#0a192f]">{analytics.averageResolutionTime}</p>
          <p className="mt-1 text-sm text-slate-500">From created time to completion</p>
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
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-500 shadow-sm">
          Loading your assigned tickets...
        </div>
      ) : filteredTickets.length ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const form = formByTicket[ticket.id] || { status: "IN_PROGRESS", notes: "" };
            const slaMeta = getSlaTimerMeta(ticket, nowMs, sessionUser.userId);

            return (
              <article
                key={ticket.id}
                className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(15,23,42,0.5)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#61CE70] via-sky-400 to-[#0a192f]" />
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-xs font-medium text-slate-500">Ticket ID: {ticket.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{ticket.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{ticket.description || "No description provided."}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                        <p className="text-xs text-slate-500">Current Status</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.status || "OPEN"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                        <p className="text-xs text-slate-500">Priority</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.priority || "MEDIUM"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                        <p className="text-xs text-slate-500">Reporter</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.reportedByUserName || ticket.reportedByUserId || "Unknown"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                        <p className="text-xs text-slate-500">Asset / Facility</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.assetFacility || "N/A"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.category || "N/A"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.location || "N/A"}</p>
                      </div>
                      <div
                        className={`rounded-2xl border p-3 sm:col-span-2 xl:col-span-4 ${
                          slaMeta.isResolved
                            ? "border-emerald-200 bg-emerald-50"
                            : slaMeta.isBreached
                              ? "border-rose-200 bg-rose-50"
                              : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.15em] ${
                            slaMeta.isResolved
                              ? "text-emerald-700"
                              : slaMeta.isBreached
                                ? "text-rose-700"
                                : "text-slate-600"
                          }`}
                        >
                          SLA Timer
                        </p>
                        <p
                          className={`mt-1 text-sm font-semibold ${
                            slaMeta.isResolved
                              ? "text-emerald-900"
                              : slaMeta.isBreached
                                ? "text-rose-700"
                                : "text-slate-900"
                          }`}
                        >
                          {slaMeta.label}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 ring-1 ring-slate-100">
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
                        className="inline-flex items-center rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
                      >
                        View Ticket Details & Images
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-linear-to-b from-slate-50 to-white p-4 ring-1 ring-slate-100">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Update Status</label>
                    <select
                      value={form.status}
                      onChange={(event) => handleChange(ticket.id, "status", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/10"
                    >
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>

                    <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Resolution Notes</label>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(event) => handleChange(ticket.id, "notes", event.target.value)}
                      placeholder="Add resolution details"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/10"
                    />

                    <button
                      type="button"
                      onClick={() => handleSubmit(ticket)}
                      disabled={actionLoadingId === ticket.id}
                      className="mt-3 rounded-full bg-[#0a192f] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:opacity-60"
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
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-500 shadow-sm">
          {tickets.length
            ? "No tickets match the selected priority filter."
            : "No tickets are assigned to you right now."}
        </div>
      )}
    </section>
  );
}

export default TechnicianDashboard;
