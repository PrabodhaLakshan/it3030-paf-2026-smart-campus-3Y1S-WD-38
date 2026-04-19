import { useEffect, useMemo, useState } from "react";

const assetFacilityOptions = [
  "Laptop",
  "Desktop",
  "Printer",
  "Scanner",
  "Router",
  "Switch",
  "Server Room",
  "Office Facility",
  "Air Conditioner",
  "Meeting Room",
];

const categoryOptions = [
  "Hardware",
  "Software",
  "Network",
  "Facility",
  "Security",
  "Access",
  "Other",
];

function createInitialValues(initialData, reporterDefaults) {
  return {
    assetFacility: initialData?.assetFacility || "Laptop",
    location: initialData?.location || "",
    category: initialData?.category || "Hardware",
    description: initialData?.description || "",
    priority: initialData?.priority || "MEDIUM",
    reportedByUserId: initialData?.reportedByUserId || reporterDefaults?.reportedByUserId || "",
    reportedByUserName: initialData?.reportedByUserName || reporterDefaults?.reportedByUserName || "",
    attachmentUrls: Array.isArray(initialData?.attachmentUrls) ? initialData.attachmentUrls : [],
    title: initialData?.title || "",
  };
}

function TicketForm({
  initialData,
  heading = "Create Ticket",
  description = "Capture the issue details and submit it to the support queue.",
  submitLabel = "Save Ticket",
  onSubmit,
  onSuccess,
  currentUserId = "",
  currentUserName = "",
  showReporterFields = true,
  allowAttachmentUpload = true,
}) {
  const [formData, setFormData] = useState(
    createInitialValues(initialData, {
      reportedByUserId: currentUserId,
      reportedByUserName: currentUserName,
    })
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAttachmentPreviews, setSelectedAttachmentPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const shouldShowReporterFields = showReporterFields || !currentUserId;

  const generatedTitle = useMemo(() => {
    const parts = [formData.assetFacility, formData.category].filter((value) => value && value.trim());
    return parts.length ? parts.join(" - ") : "Incident Ticket";
  }, [formData.assetFacility, formData.category]);

  useEffect(() => {
    setFormData(
      createInitialValues(initialData, {
        reportedByUserId: currentUserId,
        reportedByUserName: currentUserName,
      })
    );
    setSelectedFiles([]);
    setSelectedAttachmentPreviews([]);
  }, [initialData, currentUserId, currentUserName]);

  useEffect(() => {
    return () => {
      selectedAttachmentPreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [selectedAttachmentPreviews]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAttachmentChange = async (event) => {
    if (!allowAttachmentUpload) {
      return;
    }

    const files = Array.from(event.target.files || []);

    if (files.length > 3) {
      setError("You can attach a maximum of 3 images.");
      event.target.value = "";
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    setError("");

    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedAttachmentPreviews((previous) => {
      previous.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      return previewUrls;
    });

    setSelectedFiles(files);

    setFormData((previous) => ({
      ...previous,
      attachmentUrls: previewUrls,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: generatedTitle,
        assetFacility: formData.assetFacility,
        location: formData.location.trim(),
        category: formData.category,
        description: formData.description.trim(),
        priority: formData.priority,
        reportedByUserId: formData.reportedByUserId.trim(),
        reportedByUserName: formData.reportedByUserName.trim(),
        attachmentUrls: allowAttachmentUpload ? [] : formData.attachmentUrls.slice(0, 3),
      };

      const savedTicket = await onSubmit(payload, selectedFiles.slice(0, 3));
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
    <div className="mx-auto w-full max-w-[1120px]">
      <div className="overflow-hidden rounded-[2.25rem] border border-cyan-200/35 bg-white shadow-[0_34px_90px_-60px_rgba(15,23,42,0.5)]">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 via-slate-900 to-[#0a192f] px-5 py-5 text-white sm:px-7 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">Ticket Desk</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-[2rem]">{heading}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5 p-5 sm:p-6 lg:p-8">
            {success ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
                {success}
              </div>
            ) : null}

            {error ? (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Asset / Facility</label>
                <input
                  list="asset-facility-options"
                  name="assetFacility"
                  value={formData.assetFacility}
                  onChange={handleChange}
                  required
                  placeholder="Select or type asset/facility"
                  className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                />
                <datalist id="asset-facility-options">
                  {assetFacilityOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <input
                  list="category-options"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="Select or type category"
                  className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                />
                <datalist id="category-options">
                  {categoryOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Building A, Floor 2, Room 203"
                  className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe what is happening, when it started, and any context that helps"
                  className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                />
              </div>

              {shouldShowReporterFields ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Reported by user ID</label>
                    <input
                      name="reportedByUserId"
                      value={formData.reportedByUserId}
                      onChange={handleChange}
                      placeholder="User identifier"
                      className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Reported by name</label>
                    <input
                      name="reportedByUserName"
                      value={formData.reportedByUserName}
                      onChange={handleChange}
                      placeholder="Display name"
                      className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/40"
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Submitting as</p>
                  <p className="mt-1">{currentUserName || "Unknown user"}</p>
                  <p className="text-xs text-slate-600">{currentUserId || "No user ID"}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700">Attachments</label>
                  <span className="text-xs text-slate-500">Up to 3 images</span>
                </div>

                {allowAttachmentUpload ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAttachmentChange}
                      className="mt-2 w-full rounded-2xl border border-cyan-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[#0a192f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40"
                    />
                    <p className="mt-2 text-xs text-slate-600">Attach up to 3 images only. Selected images are sent with the ticket as multipart data.</p>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-slate-600">Attachments are not editable in this view.</p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(formData.attachmentUrls || []).map((imageUrl, index) => (
                    <div key={`${imageUrl.slice(0, 24)}-${index}`} className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
                      <img src={imageUrl} alt={`Attachment ${index + 1}`} className="h-28 w-full object-cover" />
                      <div className="px-3 py-2 text-xs font-medium text-slate-700">Image {index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-100 bg-slate-50/70 p-4 xl:border-l xl:border-t-0 xl:p-5">
            <div className="space-y-3 xl:sticky xl:top-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#61CE70]">Ticket preview</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{generatedTitle}</h3>
                <p className="mt-2 text-sm text-slate-600">This title updates automatically from the selected asset and category.</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Submitting as</p>
                {shouldShowReporterFields ? (
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Manual reporter fields enabled</p>
                    <p>ID: {formData.reportedByUserId || "—"}</p>
                    <p>Name: {formData.reportedByUserName || "—"}</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{currentUserName || "Unknown user"}</p>
                    <p className="text-xs text-slate-500">{currentUserId || "No user ID"}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Tips</p>
                <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
                  <li>Use a clear location so the support team can find the issue faster.</li>
                  <li>Add 1-3 images if the issue is visual or hardware-related.</li>
                  <li>Scroll down after filling the top fields to review attachments and submit.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#0a192f]/10 bg-linear-to-r from-[#0a192f] via-[#10233c] to-[#61CE70] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(10,25,47,0.7)] transition duration-300 hover:-translate-y-0.5 hover:from-[#0a192f] hover:via-[#17304d] hover:to-[#61CE70] hover:shadow-[0_22px_48px_-20px_rgba(97,206,112,0.55)] focus:ring-4 focus:ring-[#61CE70]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Saving..." : submitLabel}
                </button>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default TicketForm;