import { useEffect, useMemo, useState } from "react";
import { createTicketWithFiles, deleteTicket, getAllTickets, updateTicket } from "../../api/ticketApi";
import TicketForm from "../../components/tickets/TicketForm";
import { getSessionUser } from "../../utils/sessionUser";

const statusStyles = {
  OPEN: "bg-amber-500/15 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-sky-500/15 text-sky-700 border-sky-200",
  RESOLVED: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-500/15 text-rose-700 border-rose-200",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-indigo-500/15 text-indigo-700 border-indigo-200",
  HIGH: "bg-orange-500/15 text-orange-700 border-orange-200",
  URGENT: "bg-red-500/15 text-red-700 border-red-200",
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

function UserDashboard() {
  const sessionUser = getSessionUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);

  const [draftDefaults, setDraftDefaults] = useState({
    assetFacility: "Laptop",
    category: "Hardware",
    description: "",
    priority: "MEDIUM",
    reportedByUserId: sessionUser.userId,
    reportedByUserName: sessionUser.userName,
    attachmentUrls: [],
  });

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const allTickets = await getAllTickets();
      const ownedTickets = Array.isArray(allTickets)
        ? allTickets.filter((ticket) => (ticket.reportedByUserId || "").trim() === sessionUser.userId)
        : [];

      setTickets(ownedTickets);

      if (editingTicket) {
        const refreshedTicket = ownedTickets.find((ticket) => ticket.id === editingTicket.id);
        if (refreshedTicket) {
          setEditingTicket(refreshedTicket);
        }
      }
    } catch (loadError) {
      setError(loadError.message || "Unable to load your tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [sessionUser.userId]);

  useEffect(() => {
    if (!editingTicket) {
      setDraftDefaults({
        assetFacility: "Laptop",
        category: "Hardware",
        description: "",
        priority: "MEDIUM",
        reportedByUserId: sessionUser.userId,
        reportedByUserName: sessionUser.userName,
        attachmentUrls: [],
      });
      return;
    }

    setDraftDefaults({
      assetFacility: editingTicket.assetFacility || "Laptop",
      category: editingTicket.category || "Hardware",
      description: editingTicket.description || "",
      priority: editingTicket.priority || "MEDIUM",
      reportedByUserId: editingTicket.reportedByUserId || sessionUser.userId,
      reportedByUserName: editingTicket.reportedByUserName || sessionUser.userName,
      attachmentUrls: Array.isArray(editingTicket.attachmentUrls) ? editingTicket.attachmentUrls : [],
    });
  }, [editingTicket, sessionUser.userId, sessionUser.userName]);

  const counts = useMemo(
    () =>
      tickets.reduce(
        (accumulator, ticket) => {
          const status = ticket.status || "OPEN";
          accumulator[status] = (accumulator[status] || 0) + 1;
          return accumulator;
        },
        { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0 }
      ),
    [tickets]
  );

  const handleSubmit = async (payload, files) => {
    const normalizedPayload = {
      ...payload,
      reportedByUserId: sessionUser.userId,
      reportedByUserName: sessionUser.userName,
    };

    if (editingTicket?.id) {
      const updatedTicket = await updateTicket(editingTicket.id, {
        ...normalizedPayload,
        userId: sessionUser.userId,
      });
      setMessage(`Ticket ${updatedTicket?.id || editingTicket.id} updated successfully.`);
      return updatedTicket;
    }

    const createdTicket = await createTicketWithFiles(normalizedPayload, files);
    setMessage(`Ticket ${createdTicket?.id || ""} created successfully.`.trim());
    return createdTicket;
  };

  const handleFormSuccess = async () => {
    setEditingTicket(null);
    await loadTickets();
  };

  const handleEdit = (ticket) => {
    setMessage("");
    setEditingTicket(ticket);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (ticket) => {
    const confirmed = window.confirm(`Delete ticket ${ticket.id}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActionId(ticket.id);
    setError("");
    setMessage("");

    try {
      await deleteTicket(ticket.id, sessionUser.userId);
      setMessage("Ticket deleted successfully.");
      if (editingTicket?.id === ticket.id) {
        setEditingTicket(null);
      }
      await loadTickets();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete ticket.");
    } finally {
      setActionId("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-[#0a192f] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">User Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Raise and manage your tickets</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Create new incidents, update your own open requests, and remove tickets before they enter active handling.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            Signed in as <span className="font-semibold text-white">{sessionUser.userName || "User"}</span>
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

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <TicketForm
          key={editingTicket?.id || "create-ticket"}
          initialData={draftDefaults}
          heading={editingTicket ? "Edit ticket" : "Create ticket"}
          description={editingTicket ? "Update your ticket details and save the latest version." : "Open a new ticket for your issue or request."}
          submitLabel={editingTicket ? "Update Ticket" : "Create Ticket"}
          onSubmit={handleSubmit}
          onSuccess={handleFormSuccess}
          currentUserId={sessionUser.userId}
          currentUserName={sessionUser.userName}
          showReporterFields={false}
          allowAttachmentUpload={!editingTicket}
        />

        {editingTicket ? (
          <div className="px-6 pb-6 sm:px-10">
            <button
              type="button"
              onClick={() => setEditingTicket(null)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
            >
              Cancel edit
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>
            <p className="mt-1 text-sm text-slate-600">Manage the tickets you created. Editing and deleting is limited to open or rejected items.</p>
          </div>

          <button
            type="button"
            onClick={loadTickets}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Loading your tickets...
            </div>
          ) : tickets.length ? (
            tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status] || statusStyles.OPEN}`}>
                        {ticket.status || "OPEN"}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority] || priorityStyles.MEDIUM}`}>
                        {ticket.priority || "MEDIUM"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{ticket.title}</h3>
                      <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm text-slate-600">
                        {ticket.description || "No description provided."}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="font-medium text-slate-500">Assigned to</p>
                        <p className="mt-1 text-slate-900">{ticket.assignedTechnicianName || ticket.assignedTechnicianId || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500">Created</p>
                        <p className="mt-1 text-slate-900">{formatDate(ticket.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500">Attachments</p>
                        <p className="mt-1 text-slate-900">{ticket.attachmentUrls?.length || 0}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500">Ticket ID</p>
                        <p className="mt-1 break-all text-slate-900">{ticket.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(ticket)}
                      disabled={actionId === ticket.id || ticket.status === "IN_PROGRESS" || ticket.status === "RESOLVED"}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ticket)}
                      disabled={actionId === ticket.id || ticket.status === "IN_PROGRESS" || ticket.status === "RESOLVED"}
                      className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionId === ticket.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              You have not raised any tickets yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default UserDashboard;