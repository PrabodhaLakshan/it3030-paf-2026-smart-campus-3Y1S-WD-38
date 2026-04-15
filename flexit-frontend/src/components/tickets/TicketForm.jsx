import { useEffect, useState } from "react";

function createInitialValues(initialData) {
  return {
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "MEDIUM",
    reportedByUserId: initialData?.reportedByUserId || "",
    reportedByUserName: initialData?.reportedByUserName || "",
    attachmentUrlsText: Array.isArray(initialData?.attachmentUrls)
      ? initialData.attachmentUrls.join("\n")
      : initialData?.attachmentUrlsText || "",
  };
}

function TicketForm({
  initialData,
  heading = "Create Ticket",
  description = "Capture the issue details and submit it to the support queue.",
  submitLabel = "Save Ticket",
  onSubmit,
  onSuccess,
}) {
  const [formData, setFormData] = useState(createInitialValues(initialData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setFormData(createInitialValues(initialData));
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        reportedByUserId: formData.reportedByUserId.trim(),
        reportedByUserName: formData.reportedByUserName.trim(),
        attachmentUrls: formData.attachmentUrlsText
          .split(/[\n,]/)
          .map((url) => url.trim())
          .filter(Boolean),
      };

      const savedTicket = await onSubmit(payload);
      setSuccess("Ticket saved successfully.");

      if (onSuccess) {
        onSuccess(savedTicket, payload);
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to save the ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0a192f] px-6 py-8 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Desk</p>
          <h2 className="mt-3 text-3xl font-semibold">{heading}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-10">
          {success ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Short summary of the issue"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Reported by user ID</label>
              <input
                name="reportedByUserId"
                value={formData.reportedByUserId}
                onChange={handleChange}
                placeholder="User identifier"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Reported by name</label>
              <input
                name="reportedByUserName"
                value={formData.reportedByUserName}
                onChange={handleChange}
                placeholder="Display name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe what is happening, when it started, and any context that helps"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Attachment URLs</label>
              <textarea
                name="attachmentUrlsText"
                value={formData.attachmentUrlsText}
                onChange={handleChange}
                rows={4}
                placeholder="One URL per line or separated by commas"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
              />
              <p className="mt-2 text-xs text-slate-500">Optional. The backend accepts up to three image URLs.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-[#0a192f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketForm;