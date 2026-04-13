import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getMyBookings, cancelBooking } from "../../api/bookingApi";

function MyBookingsPage() {
  const [userId, setUserId] = useState("user001");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings(userId);
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch user bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      fetchMyBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex w-fit items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={14} />
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="flex w-fit items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            <AlertCircle size={14} />
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex w-fit items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            <XCircle size={14} />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
          <CalendarDays size={16} />
          User Dashboard
        </div>

        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Track and manage your submitted booking requests.
        </p>
      </div>

      {/* Temporary user selector */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          User ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
            placeholder="Enter user ID"
          />
          <button
            onClick={fetchMyBookings}
            className="rounded-2xl bg-[#61CE70] px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#52ba60]"
          >
            Load Bookings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No bookings found for this user.
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Resource: {booking.resourceId}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {booking.startTime}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {booking.endTime}
                    </span>
                  </div>

                  {booking.purpose && (
                    <p className="mt-3 text-sm text-slate-600">
                      Purpose: {booking.purpose}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  {getStatusBadge(booking.status)}

                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;