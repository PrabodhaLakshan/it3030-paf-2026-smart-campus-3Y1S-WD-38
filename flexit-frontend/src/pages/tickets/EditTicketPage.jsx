import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { assignTechnician, getTicketById, updateTicketStatus } from "../../api/ticketApi";

function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin") ? "/admin/tickets" : "/tickets";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [formData, setFormData] = useState({
    status: "OPEN",
    notes: "",
    techId: "",
    userId: "",
  });

  const loadTicket = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTicketById(id);
      setTicket(data);
      setFormData({
        status: data?.status || "OPEN",
        notes: data?.resolutionNotes || data?.rejectionReason || "",
        techId: data?.assignedTechnicianId || "",
        userId: data?.reportedByUserId || "",
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateTicketStatus(id, {
        status: formData.status,
        notes: formData.notes,
        techId: formData.techId,
        userId: formData.userId,
      });

      setSuccess("Ticket status updated successfully.");
      await loadTicket();
    } catch (submitError) {
      setError(submitError.message || "Unable to update ticket status.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!formData.techId.trim()) {
      setError("Enter a technician ID before assigning.");
      return;
    }

    setAssigning(true);
    setError("");
    setAssignSuccess("");

    try {
      await assignTechnician(id, formData.techId.trim());
      setAssignSuccess("Technician assigned successfully.");
      await loadTicket();
    } catch (submitError) {
      setError(submitError.message || "Unable to assign technician.");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading ticket editor...
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
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

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Update</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Edit ticket</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Update status, add technician assignment, and keep the latest handling notes in sync.
            </p>
          </div>

          <Link
            to={`${basePath}/${id}`}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f]"
          >
            View details
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Title</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket?.title}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Current status</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket?.status || "OPEN"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Assigned technician</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket?.assignedTechnicianName || ticket?.assignedTechnicianId || "Unassigned"}</p>
          </div>
        </div>

        {success ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {success}
          </div>
        ) : null}

        {assignSuccess ? (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
            {assignSuccess}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleStatusSubmit} className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={5}
                placeholder="Resolution notes, rejection reason, or progress details"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Technician ID</label>
              <input
                name="techId"
                value={formData.techId}
                onChange={handleChange}
                placeholder="Technician identifier"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">User ID</label>
              <input
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Reporting user identifier"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[#0a192f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update Status"}
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={assigning}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assigning ? "Assigning..." : "Assign Technician"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditTicketPage;