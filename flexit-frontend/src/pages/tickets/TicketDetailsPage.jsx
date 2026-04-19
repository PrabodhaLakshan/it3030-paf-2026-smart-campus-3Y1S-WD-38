import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getTicketById } from "../../api/ticketApi";
import CommentSection from "../../components/tickets/CommentSection";
import { getSessionUser } from "../../utils/sessionUser";

const statusStyles = {
  OPEN: "bg-amber-400/20 text-amber-800 border-amber-300 shadow-sm",
  IN_PROGRESS: "bg-sky-400/20 text-sky-800 border-sky-300 shadow-sm",
  RESOLVED: "bg-emerald-400/20 text-emerald-800 border-emerald-300 shadow-sm",
  REJECTED: "bg-rose-400/20 text-rose-800 border-rose-300 shadow-sm",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-700 border-slate-300 shadow-sm",
  MEDIUM: "bg-indigo-400/20 text-indigo-800 border-indigo-300 shadow-sm",
  HIGH: "bg-orange-400/20 text-orange-800 border-orange-300 shadow-sm",
  URGENT: "bg-red-400/20 text-red-800 border-red-300 shadow-sm",
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

function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getSessionUser();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isUserRoute = location.pathname.startsWith("/user");
  const isTechnicianRoute = location.pathname.startsWith("/technician");
  const canUse3DEffect = isTechnicianRoute || isAdminRoute;
  const basePath = isAdminRoute
    ? "/admin/tickets"
    : isUserRoute
      ? "/user/tickets"
    : isTechnicianRoute
      ? "/technician/tickets"
      : "/tickets";
  const backPath = isTechnicianRoute ? "/technician/dashboard" : isUserRoute ? "/user/dashboard" : basePath;
  const canManageStatus = isAdminRoute || isTechnicianRoute;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewOrigin, setPreviewOrigin] = useState({ x: 50, y: 50 });
  const [previewTilt, setPreviewTilt] = useState({ x: 0, y: 0 });
  const [previewLens, setPreviewLens] = useState({
    visible: false,
    x: 0,
    y: 0,
    bgX: 50,
    bgY: 50,
  });
  const canEditTicket =
    isUserRoute &&
    ticket &&
    ticket.reportedByUserId === sessionUser.userId &&
    ["OPEN", "REJECTED"].includes(ticket.status || "OPEN");

  const loadTicket = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTicketById(id);
      setTicket(data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    if (!previewImageUrl) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewImageUrl("");
        setPreviewZoom(1);
        setPreviewOrigin({ x: 50, y: 50 });
        setPreviewTilt({ x: 0, y: 0 });
        setPreviewLens({ visible: false, x: 0, y: 0, bgX: 50, bgY: 50 });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImageUrl]);

  const openImagePreview = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    setPreviewZoom(1);
    setPreviewOrigin({ x: 50, y: 50 });
    setPreviewTilt({ x: 0, y: 0 });
    setPreviewLens({ visible: false, x: 0, y: 0, bgX: 50, bgY: 50 });
  };

  const closeImagePreview = () => {
    setPreviewImageUrl("");
    setPreviewZoom(1);
    setPreviewOrigin({ x: 50, y: 50 });
    setPreviewTilt({ x: 0, y: 0 });
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
    setPreviewTilt({ x: 0, y: 0 });
    setPreviewLens((previous) => ({ ...previous, visible: false }));
  };

  const handlePreviewMouseMove = (event) => {
    if (!canUse3DEffect) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    const tiltY = (relativeX - 0.5) * 12;
    const tiltX = (0.5 - relativeY) * 12;

    setPreviewTilt({ x: tiltX, y: tiltY });
  };

  const handlePreviewMouseLeave = () => {
    if (!canUse3DEffect) {
      return;
    }

    setPreviewTilt({ x: 0, y: 0 });
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

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-cyan-300 bg-linear-to-br from-cyan-50 via-white to-emerald-50 p-10 text-center text-slate-600 shadow-lg">
        Loading ticket details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-300 bg-linear-to-br from-rose-50 via-white to-orange-50 p-6 text-rose-800 shadow-lg">
        <p className="font-semibold">Unable to load ticket</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="mt-4 rounded-2xl bg-[#0a192f] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <section className="space-y-6">
      {previewImageUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="absolute inset-0" onClick={closeImagePreview} />
          <div className="relative z-10 h-190 w-295 max-h-[92vh] max-w-[96vw] rounded-2xl border border-cyan-300/40 bg-linear-to-br from-slate-900 via-slate-950 to-[#031525] p-4 shadow-2xl">
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
              Use mouse wheel to zoom in the area under the cursor. Click on the image to show a circular zoom lens around the clicked area.
              {canUse3DEffect ? " Move the mouse to see a 3D tilt effect." : ""}
            </p>

            <div
              className="relative max-h-[75vh] overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 cursor-crosshair"
              onWheel={handlePreviewWheelZoom}
              onClick={handlePreviewImageClick}
              onMouseMove={handlePreviewMouseMove}
              onMouseLeave={handlePreviewMouseLeave}
            >
              <img
                src={previewImageUrl}
                alt="Ticket attachment preview"
                className="mx-auto h-165 w-260 max-h-[78vh] max-w-full origin-center select-none object-contain"
                style={{
                  transform: canUse3DEffect
                    ? `perspective(1200px) rotateX(${previewTilt.x}deg) rotateY(${previewTilt.y}deg) scale(${previewZoom})`
                    : `scale(${previewZoom})`,
                  transformOrigin: `${previewOrigin.x}% ${previewOrigin.y}%`,
                  transition: "transform 0.15s ease, filter 0.15s ease",
                  filter: canUse3DEffect
                    ? "drop-shadow(0 22px 30px rgba(0,0,0,0.45))"
                    : "none",
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

      <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-linear-to-br from-cyan-50 via-white to-emerald-50 p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
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

            <h1 className="mt-4 text-3xl font-semibold text-slate-900">{ticket.title}</h1>
            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {ticket.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={backPath}
              className="rounded-2xl border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-[#0a192f]"
            >
              Back
            </Link>
            {canEditTicket ? (
              <Link
                to={`/user/tickets/edit/${ticket.id}`}
                className="rounded-2xl bg-linear-to-r from-[#0a192f] to-cyan-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-[#0a192f] hover:to-emerald-500 hover:text-[#0a192f]"
              >
                Edit Ticket
              </Link>
            ) : null}
            {canManageStatus ? (
              <Link
                to={`${basePath}/edit/${ticket.id}`}
                className="rounded-2xl bg-linear-to-r from-[#0a192f] to-cyan-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-[#0a192f] hover:to-emerald-500 hover:text-[#0a192f]"
              >
                Update Status
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Reported by</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.reportedByUserName || ticket.reportedByUserId || "Unknown"}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Assigned technician</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.assignedTechnicianName || ticket.assignedTechnicianId || "Unassigned"}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Created at</p>
            <p className="mt-1 font-semibold text-slate-900">{formatDate(ticket.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Comment count</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.comments?.length || 0}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Asset / Facility</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.assetFacility || "N/A"}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Category</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.category || "N/A"}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.location || "N/A"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Attachments</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ticket.attachmentUrls?.length ? (
                ticket.attachmentUrls.map((attachmentUrl, index) => (
                  <button
                    type="button"
                    key={`${attachmentUrl}-${index}`}
                    onClick={() => openImagePreview(attachmentUrl)}
                    className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img
                      src={attachmentUrl}
                      alt={`Attachment ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />
                    <span className="block border-t border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-[#0a192f] transition">
                      Click to preview
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No attachments were added.</p>
              )}
            </div>
          </div>
        </div>

        <CommentSection ticketId={ticket.id} comments={ticket.comments || []} onRefresh={loadTicket} />

        <div className="mt-6 rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resolution</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-medium text-slate-500">Resolution notes</p>
              <p className="mt-1 whitespace-pre-wrap">{ticket.resolutionNotes || "No resolution notes yet."}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Rejection reason</p>
              <p className="mt-1 whitespace-pre-wrap">{ticket.rejectionReason || "No rejection reason yet."}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TicketDetailsPage;