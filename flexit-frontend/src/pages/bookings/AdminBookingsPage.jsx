import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../api/bookingApi";

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      fetchBookings();
    } catch (error) {
      console.error("Failed to approve booking:", error);
      alert("Failed to approve booking");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;

    try {
      await rejectBooking(id, reason);
      fetchBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
      alert("Failed to reject booking");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock3 size={14} />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#61CE70]/10 px-4 py-2 text-sm font-semibold text-[#2d9d45]">
          <CalendarDays size={16} />
          Booking Administration
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Booking Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review, approve, and monitor all booking requests.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            All Booking Requests
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Resource</th>
                <th className="px-6 py-4 text-left">Start Time</th>
                <th className="px-6 py-4 text-left">End Time</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">{booking.userId}</td>
                  <td className="px-6 py-4">{booking.resourceId}</td>
                  <td className="px-6 py-4">{booking.startTime}</td>
                  <td className="px-6 py-4">{booking.endTime}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(booking.id)}
                          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminBookingsPage;