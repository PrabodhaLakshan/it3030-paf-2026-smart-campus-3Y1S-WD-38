import React, { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  FileText,
  CheckSquare,
} from "lucide-react";
import { createBooking } from "../../api/bookingApi";

function BookingsFormPage() {
  const [formData, setFormData] = useState({
    userId: "",
    resourceId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      userId: "",
      resourceId: "",
      startTime: "",
      endTime: "",
      purpose: "",
      expectedAttendees: "",
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        userId: formData.userId,
        resourceId: formData.resourceId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: Number(formData.expectedAttendees),
      };

      const response = await createBooking(payload);
      setMessage(`Booking created successfully. Status: ${response.data.status}`);
      handleClear();
    } catch (error) {
      console.error("Booking creation failed:", error);
      setMessage(
        error?.response?.data?.message || "Failed to create booking request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#61CE70]/10 px-4 py-2 text-sm font-semibold text-[#2d9d45]">
          <CheckSquare size={16} />
          User Booking Portal
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Book a Resource
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Submit a booking request for a room, lab, or equipment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter your user ID"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Resource ID
            </label>
            <input
              type="text"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              placeholder="Enter resource ID"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={16} />
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock3 size={16} />
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText size={16} />
              Booking Purpose
            </label>
            <textarea
              rows="4"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Enter the purpose of this booking request"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
            ></textarea>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users size={16} />
              Expected Attendees
            </label>
            <input
              type="number"
              min="1"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              placeholder="Enter attendee count"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#61CE70]/20 bg-[#61CE70]/10 p-4">
          <p className="text-sm text-slate-700">
            Your booking request will be submitted with a{" "}
            <span className="font-semibold text-amber-600">PENDING</span> status
            and must be reviewed by an admin.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#61CE70] px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#52ba60] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Submit Booking Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingsFormPage;