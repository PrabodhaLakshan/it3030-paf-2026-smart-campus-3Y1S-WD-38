import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { assignTechnician, getAllTickets, getTechnicians, updateTicketStatus } from "../../api/ticketApi";

const statusFilters = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

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
  const [popup, setPopup] = useState(null);
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

  const addTechnicianReportSection = (doc, ticket, startY) => {
    const latestTechnicianComment = getLatestTechnicianComment(ticket);
    const completionDate = latestTechnicianComment?.createdAt || ticket.createdAt;
    const technicianNote = latestTechnicianComment?.text || ticket.resolutionNotes || "No technician note provided.";
    const technicianImage = latestTechnicianComment?.imageUrl || "";
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = startY;

    if (currentY > 185) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Ticket ${ticket.id} - Technician Completion`, 14, currentY);

    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const details = [
      ["Technician", formatTechnicianLabel(ticket)],
      ["Work Finished At", formatReportDate(completionDate)],
      ["Status", ticket.status || "RESOLVED"],
      ["Resolution Notes", ticket.resolutionNotes || "No resolution notes provided."],
      ["Technician Work Done", technicianNote],
    ];

    details.forEach(([label, value]) => {
      const lines = doc.splitTextToSize(`${label}: ${value}`, pageWidth - 28);
      doc.text(lines, 14, currentY);
      currentY += lines.length * 5 + 1;
    });

    if (technicianImage && currentY < 160) {
      currentY += 2;
      doc.setFont("helvetica", "bold");
      doc.text("Technician Attachment", 14, currentY);
      currentY += 4;

      const imageHeight = 48;
      const imageWidth = 70;

      try {
        doc.addImage(technicianImage, 14, currentY, imageWidth, imageHeight);
        currentY += imageHeight + 4;
      } catch {
        doc.setFont("helvetica", "normal");
        doc.text("Attachment could not be embedded in the PDF.", 14, currentY);
        currentY += 6;
      }
    }

    return currentY + 4;
  };

  const handleGenerateResolvedReport = () => {
    const resolvedTickets = tickets.filter((ticket) => (ticket.status || "OPEN") === "RESOLVED");

    if (!resolvedTickets.length) {
      const message = "No resolved tickets are available to include in the report.";
      setActionError(message);
      showPopup("error", message);
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const fileName = `resolved_tickets_report_${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Resolved Tickets Report", 14, 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${formatReportDate(new Date())}`, 14, 23);
    doc.text(`Total resolved tickets: ${resolvedTickets.length}`, 14, 29);

    const rows = resolvedTickets.map((ticket) => [
      ticket.id || "N/A",
      ticket.title || "N/A",
      ticket.reportedByUserName || ticket.reportedByUserId || "Unknown",
      formatTechnicianLabel(ticket),
      ticket.assetFacility || "N/A",
      ticket.category || "N/A",
      ticket.priority || "MEDIUM",
      formatReportDate(ticket.createdAt),
      ticket.resolutionNotes || "",
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Ticket ID", "Title", "Reporter", "Assigned Technician", "Asset / Facility", "Category", "Priority", "Created At", "Resolution Notes"]],
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
        0: { cellWidth: 22 },
        1: { cellWidth: 30 },
        2: { cellWidth: 34 },
        3: { cellWidth: 34 },
        4: { cellWidth: 28 },
        5: { cellWidth: 22 },
        6: { cellWidth: 18 },
        7: { cellWidth: 28 },
        8: { cellWidth: "auto" },
      },
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    resolvedTickets.forEach((ticket, index) => {
      if (currentY > 180) {
        doc.addPage();
        currentY = 16;
      }

      currentY = addTechnicianReportSection(doc, ticket, currentY);

      if (index < resolvedTickets.length - 1) {
        doc.setDrawColor(225, 229, 235);
        doc.line(14, currentY, 283, currentY);
        currentY += 6;
      }
    });

    doc.save(fileName);

    const message = `Resolved tickets report downloaded (${resolvedTickets.length} ticket${resolvedTickets.length === 1 ? "" : "s"}).`;
    setActionError("");
    setActionMessage(message);
    showPopup("success", message);
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
      `Ticket ${ticket.id} rejected and removed.`
    );

    if (success) {
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
      `Ticket ${ticket.id} updated to RESOLVED.`
    );

    if (success) {
      showPopup("success", `Ticket ${ticket.id} is now RESOLVED and remains in the list.`);
    }
  };

  const isActionLoading = (ticketId) => actionLoadingId === ticketId;

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
          className={`fixed right-6 top-6 z-60 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl transition-opacity ${
            popup.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {popup.message}
        </div>
      ) : null}

      {previewImageUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="absolute inset-0" onClick={closeImagePreview} />
          <div className="relative z-10 h-190 w-295 max-h-[92vh] max-w-[96vw] rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
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

      <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
            className="inline-flex items-center justify-center rounded-2xl bg-[#61CE70] px-5 py-3 text-sm font-semibold text-[#0a192f] transition hover:bg-white"
          >
            Generate PDF Report
          </button>
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
                  <th className="px-4 py-3 font-semibold">Asset / Facility</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
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
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
                        className="mt-3 inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
                      >
                        View Image and Details
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-900">{ticket.reportedByUserName || "N/A"}</p>
                      <p className="text-xs text-slate-500 mt-1">{ticket.reportedByUserId || "No user ID"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {ticket.assetFacility || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {ticket.category || "N/A"}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.priority || "MEDIUM"}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.status || "OPEN"}</td>
                    <td className="px-4 py-4">
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
                        placeholder="Reject reason (at least 5 words)"
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
                        placeholder="Close reason (at least 5 words)"
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