import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { assignTechnician, getAllTickets, getTechnicians, updateTicketStatus } from "../../api/ticketApi";

const statusFilters = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];
const TICKET_ACTION_HISTORY_KEY = "flexit_admin_ticket_action_history_v1";

function formatReportDate(value) {
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

function getLatestTechnicianComment(ticket) {
  const assignedTechnicianId = (ticket.assignedTechnicianId || "").trim();
  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];

  const technicianComments = comments
    .filter((comment) => {
      const commentUserId = (comment?.userId || "").trim();
      if (!assignedTechnicianId) {
        return Boolean(commentUserId);
      }

      return commentUserId && commentUserId === assignedTechnicianId;
    })
    .slice()
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

  return technicianComments[0] || null;
}

function formatTechnicianLabel(ticket) {
  if (ticket.assignedTechnicianName) {
    return ticket.assignedTechnicianId
      ? `${ticket.assignedTechnicianName} (${ticket.assignedTechnicianId})`
      : ticket.assignedTechnicianName;
  }

  return ticket.assignedTechnicianId || "Unassigned";
}

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

function loadTicketActionHistory() {
  try {
    const raw = localStorage.getItem(TICKET_ACTION_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  const [rejectedCount, setRejectedCount] = useState(0);
  const [popup, setPopup] = useState(null);
  const [selectedTicketForReview, setSelectedTicketForReview] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewOrigin, setPreviewOrigin] = useState({ x: 50, y: 50 });
  const [previewLens, setPreviewLens] = useState({
    visible: false,
    x: 0,
    y: 0,
    bgX: 50,
    bgY: 50,
  });
  const [ticketActionHistory, setTicketActionHistory] = useState(loadTicketActionHistory);

  const countWords = (value) => {
    const text = (value || "").trim();
    if (!text) {
      return 0;
    }

    return text.split(/\s+/).length;
  };

  const showPopup = (type, message) => {
    setPopup({ type, message });
    window.setTimeout(() => {
      setPopup(null);
    }, 2800);
  };

  const handleGenerateResolvedReport = () => {
    const activeResolvedEntries = tickets
      .filter((ticket) => (ticket.status || "OPEN") === "RESOLVED")
      .map((ticket) => {
        const latestTechnicianComment = getLatestTechnicianComment(ticket);
        const resolvedAt = ticket.resolvedAt || latestTechnicianComment?.createdAt || ticket.createdAt;
        const reason = ticket.resolutionNotes || "No resolution reason provided.";
        const workDone = latestTechnicianComment?.text || reason;

        return {
          id: ticket.id || "N/A",
          title: ticket.title || "Untitled ticket",
          reporter: ticket.reportedByUserName || ticket.reportedByUserId || "Unknown",
          technician: formatTechnicianLabel(ticket),
          action: "RESOLVED",
          closedAt: resolvedAt,
          reason,
          workDone,
        };
      });

    const archivedResolvedEntries = ticketActionHistory
      .filter((entry) => ["CLOSED", "RESOLVED"].includes((entry.action || "").toUpperCase()))
      .map((entry) => ({
        id: entry.id || "N/A",
        title: entry.title || "Untitled ticket",
        reporter: entry.reporter || "Unknown",
        technician: entry.technician || "Unassigned",
        action: (entry.action || "CLOSED").toUpperCase(),
        closedAt: entry.closedAt,
        reason: entry.reason || "No resolution reason provided.",
        workDone: entry.workDone || entry.reason || "No work summary provided.",
      }));

    const mergedByTicketId = new Map();
    [...archivedResolvedEntries, ...activeResolvedEntries].forEach((entry) => {
      const key = entry.id || `${entry.title}-${entry.closedAt}`;
      const existing = mergedByTicketId.get(key);

      if (!existing) {
        mergedByTicketId.set(key, entry);
        return;
      }

      const existingTime = new Date(existing.closedAt || 0).getTime();
      const nextTime = new Date(entry.closedAt || 0).getTime();
      if (nextTime >= existingTime) {
        mergedByTicketId.set(key, entry);
      }
    });

    const reportEntries = Array.from(mergedByTicketId.values())
      .slice()
      .sort((left, right) => new Date(right.closedAt || 0) - new Date(left.closedAt || 0));

    if (!reportEntries.length) {
      const message = "No resolved or closed tickets are available to include in the report.";
      setActionError(message);
      showPopup("error", message);
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const fileName = `resolved_closed_summary_${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Resolved & Closed Tickets Summary", 14, 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${formatReportDate(new Date())}`, 14, 23);
    doc.text(`Total summary items: ${reportEntries.length}`, 14, 29);

    const rows = reportEntries.map((entry) => [
      entry.id || "N/A",
      entry.title || "N/A",
      entry.reporter || "Unknown",
      entry.technician || "Unassigned",
      entry.action || "N/A",
      formatReportDate(entry.closedAt),
      entry.reason || "",
      entry.workDone || "",
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Ticket ID", "Title", "Reporter", "Assigned Technician", "Action", "Resolved/Closed At", "Reason", "Work Done"]],
      body: rows,
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
        0: { cellWidth: 20 },
        1: { cellWidth: 34 },
        2: { cellWidth: 30 },
        3: { cellWidth: 34 },
        4: { cellWidth: 20 },
        5: { cellWidth: 28 },
        6: { cellWidth: 38 },
        7: { cellWidth: "auto" },
      },
    });

    doc.save(fileName);

    const message = `Resolved/closed summary PDF downloaded (${reportEntries.length} item${reportEntries.length === 1 ? "" : "s"}).`;
    setActionError("");
    setActionMessage(message);
    showPopup("success", message);
  };

  const archiveTicketAction = (ticket, action, reason) => {
    const closedAt = new Date().toISOString();
    const latestTechnicianComment = getLatestTechnicianComment(ticket);
    const archived = {
      id: ticket.id || "N/A",
      title: ticket.title || "Untitled ticket",
      reporter: ticket.reportedByUserName || ticket.reportedByUserId || "Unknown",
      technician: formatTechnicianLabel(ticket),
      action,
      closedAt,
      reason,
      workDone: latestTechnicianComment?.text || ticket.resolutionNotes || reason,
    };

    setTicketActionHistory((previous) => [archived, ...previous].slice(0, 300));
  };

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

  useEffect(() => {
    try {
      localStorage.setItem(TICKET_ACTION_HISTORY_KEY, JSON.stringify(ticketActionHistory));
    } catch {
      // Ignore storage write failures so ticket actions continue to work.
    }
  }, [ticketActionHistory]);

  useEffect(() => {
    if (!previewImageUrl) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewImageUrl("");
        setPreviewZoom(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImageUrl]);

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
          ticket.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.reportedByUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.reportedByUserId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const counts = useMemo(() => {
    const baseCounts = tickets.reduce(
      (accumulator, ticket) => {
        const status = ticket.status || "OPEN";
        accumulator[status] = (accumulator[status] || 0) + 1;
        return accumulator;
      },
      { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 }
    );

    return {
      ...baseCounts,
      REJECTED: rejectedCount,
    };
  }, [tickets, rejectedCount]);

  const runAction = async (ticketId, fn, successText, options = {}) => {
    const { reload = true } = options;

    setActionMessage("");
    setActionError("");
    setActionLoadingId(ticketId);

    try {
      await fn();
      setActionMessage(successText);
      if (reload) {
        await loadTickets();
      }
      return true;
    } catch (submitError) {
      const message = submitError.message || "Action failed.";
      setActionError(message);
      showPopup("error", message);
      return false;
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
      const message = "Reject action needs a technician selection.";
      setActionError(message);
      showPopup("error", message);
      return;
    }

    if (countWords(notes) < 5) {
      const message = "Reject reason is required with at least 5 words.";
      setActionError(message);
      showPopup("error", message);
      return;
    }

    const success = await runAction(
      ticket.id,
      () => updateTicketStatus(ticket.id, { status: "REJECTED", notes, techId }),
      `Ticket ${ticket.id} rejected and removed.`,
      { reload: false }
    );

    if (success) {
      archiveTicketAction(ticket, "REJECTED", notes);
      setRejectedCount((previous) => previous + 1);
      setTickets((previous) => previous.filter((item) => item.id !== ticket.id));
      setRejectReasonByTicket((previous) => {
        const next = { ...previous };
        delete next[ticket.id];
        return next;
      });
      showPopup("success", `Ticket ${ticket.id} rejected and deleted.`);
    }
  };

  const handleClose = async (ticket) => {
    const notes = (closeNoteByTicket[ticket.id] || "").trim();
    const userId = (ticket.reportedByUserId || "").trim();

    if (countWords(notes) < 5) {
      const message = "Close reason is required with at least 5 words.";
      setActionError(message);
      showPopup("error", message);
      return;
    }

    if (!userId) {
      const message = "Close action failed: reporter user ID is missing on this ticket.";
      setActionError(message);
      showPopup("error", message);
      return;
    }

    const success = await runAction(
      ticket.id,
      () =>
        updateTicketStatus(ticket.id, {
          status: "RESOLVED",
          notes,
          techId: (resolveTechnicianId(ticket.id) || ticket.assignedTechnicianId || "").trim(),
          userId,
        }),
      `Ticket ${ticket.id} closed and removed from the table.`,
      { reload: false }
    );

    if (success) {
      archiveTicketAction(ticket, "CLOSED", notes);
      setTickets((previous) => previous.filter((item) => item.id !== ticket.id));
      setCloseNoteByTicket((previous) => {
        const next = { ...previous };
        delete next[ticket.id];
        return next;
      });
      showPopup("success", `Ticket ${ticket.id} closed and removed.`);
    }
  };

  const isActionLoading = (ticketId) => actionLoadingId === ticketId;

  const openReviewModal = (ticket) => {
    setSelectedTicketForReview(ticket);
  };

  const closeReviewModal = () => {
    setSelectedTicketForReview(null);
  };

  const openImagePreview = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    setPreviewZoom(1);
    setPreviewOrigin({ x: 50, y: 50 });
    setPreviewLens({ visible: false, x: 0, y: 0, bgX: 50, bgY: 50 });
  };

  const closeImagePreview = () => {
    setPreviewImageUrl("");
    setPreviewZoom(1);
    setPreviewOrigin({ x: 50, y: 50 });
    setPreviewLens({ visible: false, x: 0, y: 0, bgX: 50, bgY: 50 });
  };

  const zoomInPreview = () => {
    setPreviewZoom((previous) => Math.min(previous + 0.25, 4));
  };

  const zoomOutPreview = () => {
    setPreviewZoom((previous) => Math.max(previous - 0.25, 0.5));
  };

  const resetPreviewZoom = () => {
    setPreviewZoom(1);
    setPreviewOrigin({ x: 50, y: 50 });
    setPreviewLens((previous) => ({ ...previous, visible: false }));
  };

  const handlePreviewImageClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;

    const relativeX = (clickX / bounds.width) * 100;
    const relativeY = (clickY / bounds.height) * 100;

    setPreviewLens({
      visible: true,
      x: clickX,
      y: clickY,
      bgX: Math.min(100, Math.max(0, relativeX)),
      bgY: Math.min(100, Math.max(0, relativeY)),
    });
  };

  const handlePreviewWheelZoom = (event) => {
    event.preventDefault();

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const relativeY = ((event.clientY - bounds.top) / bounds.height) * 100;
    const nextOrigin = {
      x: Math.min(100, Math.max(0, relativeX)),
      y: Math.min(100, Math.max(0, relativeY)),
    };

    setPreviewOrigin(nextOrigin);
    setPreviewZoom((previous) => {
      const direction = event.deltaY < 0 ? 1 : -1;
      const nextZoom = previous + direction * 0.2;
      return Math.min(4, Math.max(0.5, nextZoom));
    });
  };

  return (
    <section className="space-y-6">
      {popup ? (
        <div
          className={`fixed right-6 top-6 z-60 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur transition-opacity ${
            popup.type === "success"
              ? "border border-emerald-300 bg-emerald-50/95 text-emerald-800"
              : "border border-rose-300 bg-rose-50/95 text-rose-800"
          }`}
        >
          {popup.message}
        </div>
      ) : null}

      {previewImageUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="absolute inset-0" onClick={closeImagePreview} />
          <div className="relative z-10 h-190 w-295 max-h-[92vh] max-w-[96vw] rounded-2xl border border-cyan-300/30 bg-linear-to-br from-slate-900 via-slate-950 to-[#041727] p-4 shadow-2xl">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-200">Image Preview</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOutPreview}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#61CE70]"
                >
                  Zoom -
                </button>
                <button
                  type="button"
                  onClick={zoomInPreview}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#61CE70]"
                >
                  Zoom +
                </button>
                <button
                  type="button"
                  onClick={resetPreviewZoom}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#61CE70]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeImagePreview}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Close
                </button>
              </div>
            </div>

            <p className="mb-3 text-xs text-slate-400">
            </p>

            <div
              className="relative max-h-[75vh] overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 cursor-crosshair"
              onWheel={handlePreviewWheelZoom}
              onClick={handlePreviewImageClick}
            >
              <img
                src={previewImageUrl}
                alt="Ticket attachment preview"
                className="mx-auto h-165 w-260 max-h-[78vh] max-w-full origin-center select-none object-contain"
                style={{
                  transform: `scale(${previewZoom})`,
                  transformOrigin: `${previewOrigin.x}% ${previewOrigin.y}%`,
                  transition: "transform 0.15s ease",
                }}
              />

              {previewLens.visible ? (
                <div
                  className="pointer-events-none absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white/90 shadow-2xl ring-2 ring-slate-900/60"
                  style={{
                    left: `${previewLens.x}px`,
                    top: `${previewLens.y}px`,
                    backgroundImage: `url(${previewImageUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#020617",
                    backgroundSize: `${Math.max(220, previewZoom * 260)}%`,
                    backgroundPosition: `${previewLens.bgX}% ${previewLens.bgY}%`,
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {selectedTicketForReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="absolute inset-0" onClick={closeReviewModal} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-rose-300/30 bg-linear-to-br from-white via-slate-50 to-slate-100 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Review Ticket Details</h2>
              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Ticket ID</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedTicketForReview.id}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Priority</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedTicketForReview.priority || "MEDIUM"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedTicketForReview.status || "OPEN"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Reporter</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedTicketForReview.reportedByUserName || selectedTicketForReview.reportedByUserId || "Unknown"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Title</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{selectedTicketForReview.title}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Description</p>
                <p className="mt-1 text-sm text-slate-700">{selectedTicketForReview.description || "No description provided."}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Asset / Facility</p>
                  <p className="mt-1 text-sm text-slate-700">{selectedTicketForReview.assetFacility || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Location</p>
                  <p className="mt-1 text-sm text-slate-700">{selectedTicketForReview.location || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Category</p>
                  <p className="mt-1 text-sm text-slate-700">{selectedTicketForReview.category || "N/A"}</p>
                </div>
              </div>

              {selectedTicketForReview.attachmentUrls?.length ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Attachments</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selectedTicketForReview.attachmentUrls.map((attachmentUrl, index) => (
                      <button
                        key={`${attachmentUrl}-${index}`}
                        type="button"
                        onClick={() => {
                          openImagePreview(attachmentUrl);
                          closeReviewModal();
                        }}
                        className="overflow-hidden rounded-lg border border-slate-300 bg-white transition hover:border-rose-400"
                      >
                        <img
                          src={attachmentUrl}
                          alt={`Attachment ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                        <p className="border-t border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Click to expand</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReject(selectedTicketForReview);
                    closeReviewModal();
                  }}
                  disabled={isActionLoading(selectedTicketForReview.id)}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {isActionLoading(selectedTicketForReview.id) ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-3xl border border-cyan-200/40 bg-linear-to-r from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Management</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">All Tickets Table</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Filter all tickets by status and priority, assign technicians, and apply reject or close actions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateResolvedReport}
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#61CE70] to-cyan-300 px-4 py-2 text-xs font-semibold text-[#0a192f] shadow-lg transition hover:-translate-y-0.5 hover:from-white hover:to-[#c6ffd4]"
          >
            Generate PDF Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-4 shadow-sm">
          <p className="text-sm text-amber-700">Open</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.OPEN}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-linear-to-br from-sky-50 to-white p-4 shadow-sm">
          <p className="text-sm text-sky-700">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.IN_PROGRESS}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-4 shadow-sm">
          <p className="text-sm text-emerald-700">Resolved</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.RESOLVED}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50 to-white p-4 shadow-sm">
          <p className="text-sm text-rose-700">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{counts.REJECTED}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-cyan-200 bg-linear-to-br from-cyan-50 via-white to-emerald-50 p-5 shadow-lg">
        <div className="grid gap-4 lg:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, description, or reporter"
            className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40 lg:col-span-1"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
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
            className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
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
            className="rounded-full border border-cyan-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-500 hover:text-[#0a192f]"
          >
            Refresh
          </button>
          <span className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            {filteredTickets.length} ticket{filteredTickets.length === 1 ? "" : "s"} shown
          </span>
          <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
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
        <div className="rounded-3xl border border-dashed border-cyan-300 bg-linear-to-br from-cyan-50 to-emerald-50 p-10 text-center text-slate-600 shadow-sm">
          Loading tickets...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-300 bg-linear-to-br from-rose-50 to-orange-50 p-6 text-rose-800 shadow-sm">
          <p className="font-semibold">Unable to load tickets</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : filteredTickets.length ? (
        <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-linear-to-r from-cyan-50 to-emerald-50">
                <tr className="text-left text-slate-600">
                  <th className="w-[15%] px-4 py-3 font-semibold">Ticket</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Reporter</th>
                  <th className="w-[9%] px-4 py-3 font-semibold">Asset / Facility</th>
                  <th className="w-[8%] px-4 py-3 font-semibold">Category</th>
                  <th className="w-[7%] px-4 py-3 font-semibold">Priority</th>
                  <th className="w-[8%] px-4 py-3 font-semibold">Status</th>
                  <th className="w-[10%] px-4 py-3 font-semibold">Assigned</th>
                  <th className="w-[11%] px-4 py-3 font-semibold">Assign</th>
                  <th className="w-[11%] px-4 py-3 font-semibold">Reject</th>
                  <th className="w-[11%] px-4 py-3 font-semibold">Close</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100 align-top transition hover:bg-cyan-50/50">
                    <td className="px-4 py-4 break-words">
                      <p className="font-semibold text-slate-900">{ticket.title}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {ticket.id}</p>
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
                        className="mt-3 inline-flex rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500 hover:text-[#0a192f]"
                      >
                        View Image and Details
                      </Link>
                    </td>
                    <td className="px-4 py-4 break-words">
                      <p className="text-slate-900">{ticket.reportedByUserName || "N/A"}</p>
                      <p className="text-xs text-slate-500 mt-1">{ticket.reportedByUserId || "No user ID"}</p>
                    </td>
                    <td className="px-4 py-4 break-words text-slate-800">
                      {ticket.assetFacility || "N/A"}
                    </td>
                    <td className="px-4 py-4 break-words text-slate-800">
                      {ticket.category || "N/A"}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.priority || "MEDIUM"}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.status || "OPEN"}</td>
                    <td className="px-4 py-4 break-words">
                      <p className="text-slate-900">
                        {ticket.assignedTechnicianId
                          ? ticket.assignedTechnicianName
                            ? `${ticket.assignedTechnicianName} (${ticket.assignedTechnicianId})`
                            : `Assigned (${ticket.assignedTechnicianId})`
                          : "Unassigned"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {ticket.assignedTechnicianId || "Unassigned"}
                      </p>
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
                        className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200/40"
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
                        className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleAssign(ticket)}
                        disabled={isActionLoading(ticket.id)}
                        className="block w-full rounded-xl bg-linear-to-r from-[#0a192f] to-cyan-700 px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:from-[#0a192f] hover:to-[#61CE70] hover:text-[#0a192f] disabled:opacity-60"
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
                        placeholder="Reject reason (at least 5 words)"
                        className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/40"
                      />
                      <button
                        type="button"
                        onClick={() => openReviewModal(ticket)}
                        disabled={isActionLoading(ticket.id)}
                        className="block w-full rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        {isActionLoading(ticket.id) ? "Working..." : "View & Reject"}
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
                        placeholder="Close reason (at least 5 words)"
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleClose(ticket)}
                        disabled={isActionLoading(ticket.id)}
                        className="block w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
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
        <div className="rounded-3xl border border-dashed border-cyan-300 bg-linear-to-br from-cyan-50 to-emerald-50 p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No tickets match the current filters.</p>
          <p className="mt-2 text-sm">Try clearing the search fields or create a new ticket.</p>
        </div>
      )}
    </section>
  );
}

export default TicketsPage;