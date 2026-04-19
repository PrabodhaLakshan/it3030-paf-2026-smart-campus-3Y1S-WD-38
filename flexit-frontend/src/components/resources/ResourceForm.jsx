import { useState } from "react";

const EMPTY_FORM = {
  name: "",
  type: "LAB",
  capacity: 1,
  location: "",
  availabilityStart: "",
  availabilityEnd: "",
  status: "ACTIVE",
  description: "",
};

// ────────────────────────────────────────────────
// Custom Time Picker — a clean hour + minute dropdown
// ────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = ["00", "15", "30", "45"];

function TimePicker({ value, onChange, hasError }) {
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const handleHour = (e) => {
    const h = e.target.value;
    onChange(h && minute ? `${h}:${minute || "00"}` : "");
  };

  const handleMinute = (e) => {
    const m = e.target.value;
    onChange(hour && m ? `${hour}:${m}` : "");
  };

  const base =
    "px-3 py-2 border rounded-xl text-sm outline-none transition-all focus:ring-2 bg-white cursor-pointer";
  const errorCls = hasError
    ? "border-red-400 bg-red-50 focus:ring-red-300"
    : "border-gray-300 focus:ring-[#61CE70] focus:border-[#61CE70]";

  return (
    <div className="flex items-center gap-2">
      {/* Clock icon */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Hour */}
      <select
        value={hour || ""}
        onChange={handleHour}
        className={`${base} ${errorCls} w-24`}
      >
        <option value="" disabled>Hour</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {Number(h) === 0
              ? "12 AM"
              : Number(h) < 12
              ? `${Number(h)} AM`
              : Number(h) === 12
              ? "12 PM"
              : `${Number(h) - 12} PM`}
          </option>
        ))}
      </select>

      <span className="text-gray-400 font-bold text-lg select-none">:</span>

      {/* Minute */}
      <select
        value={minute || ""}
        onChange={handleMinute}
        className={`${base} ${errorCls} w-24`}
      >
        <option value="" disabled>Min</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* Live preview */}
      {hour && minute && (
        <span className="ml-1 text-sm font-semibold text-[#0a192f] bg-gray-100 px-2 py-1 rounded-lg">
          {Number(hour) === 0
            ? `12:${minute} AM`
            : Number(hour) < 12
            ? `${Number(hour)}:${minute} AM`
            : Number(hour) === 12
            ? `12:${minute} PM`
            : `${Number(hour) - 12}:${minute} PM`}
        </span>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────
function validate(data) {
  const errors = {};

  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required.";
  }

  if (!data.capacity || Number(data.capacity) < 1) {
    errors.capacity = "Capacity must be at least 1.";
  }

  if (!data.location || data.location.trim() === "") {
    errors.location = "Location is required.";
  }

  if (!data.availabilityStart || data.availabilityStart.trim() === "") {
    errors.availabilityStart = "Start time is required.";
  }

  if (!data.availabilityEnd || data.availabilityEnd.trim() === "") {
    errors.availabilityEnd = "End time is required.";
  }

  if (
    data.availabilityStart &&
    data.availabilityEnd &&
    data.availabilityEnd <= data.availabilityStart
  ) {
    errors.availabilityEnd = "End time must be after start time.";
  }

  return errors;
}

// ────────────────────────────────────────────────
// Field error label
// ────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd"
          d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-3a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

// ────────────────────────────────────────────────
// Main Form
// ────────────────────────────────────────────────
function ResourceForm({ initialData, onSubmit, submitLabel = "Save Resource" }) {
  const [formData, setFormData] = useState(initialData || EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all ${
      fieldErrors[field]
        ? "border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400"
        : "border-gray-300"
    }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccess(false);

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await onSubmit(formData);
      setSuccess(true);
      if (!initialData) setFormData(EMPTY_FORM);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">

        {/* Success Banner */}
        {success && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium">
            <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Resource saved successfully!
          </div>
        )}

        {/* Server Error Banner */}
        {serverError && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {serverError}
          </div>
        )}

        {/* Validation Summary */}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
            <p className="flex items-center gap-2 font-semibold mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd" />
              </svg>
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              {Object.values(fieldErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass("name")}
                name="name"
                placeholder="Resource Name"
                value={formData.name}
                onChange={handleChange}
              />
              <FieldError message={fieldErrors.name} />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className={inputClass("type")}
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="PROJECTOR">Projector</option>
                <option value="CAMERA">Camera</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass("capacity")}
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
              />
              <FieldError message={fieldErrors.capacity} />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass("location")}
                name="location"
                placeholder="e.g. Building A, Room 101"
                value={formData.location}
                onChange={handleChange}
              />
              <FieldError message={fieldErrors.location} />
            </div>

            {/* Availability Start — Custom Time Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Start <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={formData.availabilityStart}
                onChange={(val) => handleTimeChange("availabilityStart", val)}
                hasError={!!fieldErrors.availabilityStart}
              />
              <FieldError message={fieldErrors.availabilityStart} />
            </div>

            {/* Availability End — Custom Time Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability End <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={formData.availabilityEnd}
                onChange={(val) => handleTimeChange("availabilityEnd", val)}
                hasError={!!fieldErrors.availabilityEnd}
              />
              <FieldError message={fieldErrors.availabilityEnd} />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className={inputClass("status")}
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className={inputClass("description") + " min-h-[100px]"}
                name="description"
                placeholder="Any additional details..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              className="flex items-center gap-2 px-8 py-2.5 bg-[#0a192f] text-white font-semibold rounded-xl shadow-md hover:bg-[#61CE70] hover:text-[#0a192f] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceForm;