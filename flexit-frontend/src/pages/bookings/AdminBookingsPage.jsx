import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  X,
  AlertCircle,
  MessageSquareText,
} from "lucide-react";

import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../api/bookingApi";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [toast, setToast] = useState({
    show: false,
    type: "", // success | error
    text: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast({ show: false, type: "", text: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.show]);

  const showToast = (type, text) => {
    setToast({
      show: true,
      type,
      text,
    });
  };

  const fetchBookings = async () => {
    try {
      const response = await getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      showToast("error", "Failed to fetch bookings");
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoadingAction(true);
      await approveBooking(id);
      showToast("success", "Booking approved successfully");
      fetchBookings();
    } catch (error) {
      console.error("Failed to approve booking:", error);
      showToast("error", "Failed to approve booking");
    } finally {
      setLoadingAction(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedBookingId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedBookingId(null);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showToast("error", "Rejection reason is required");
      return;
    }

    try {
      setLoadingAction(true);
      await rejectBooking(selectedBookingId, rejectReason.trim());
      showToast("success", "Booking rejected successfully");
      closeRejectModal();
      fetchBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to reject booking"
      );
    } finally {
      setLoadingAction(false);
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

  const filteredBookings = bookings.filter((booking) => {
    if (selectedStatus === "ALL") {
      return true;
    }

    return booking.status === selectedStatus;
  });

  return (
    <div className="mx-auto max-w-7xl">
      {/* Toast */}
      {toast.show && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-sm animate-[slideIn_.25s_ease-out]">
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-700"
                : "border-red-200 bg-white text-red-700"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="mt-1 text-sm leading-5">{toast.text}</p>
            </div>

            <button
              type="button"
              onClick={() => setToast({ show: false, type: "", text: "" })}
              className="rounded-full p-1 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-[fadeUp_.2s_ease-out]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  <MessageSquareText size={14} />
                  Reject Booking
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Add rejection reason
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Please enter a clear reason before rejecting this booking
                  request.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rejection Reason
              </label>
              <textarea
                rows="5"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejecting this booking..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-400 focus:bg-white"
                maxLength={250}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  This reason can be shown to the user.
                </p>
                <p className="text-xs text-slate-400">
                  {rejectReason.length}/250
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectModal}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={loadingAction}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingAction ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#61CE70]/10 px-4 py-2 text-sm font-semibold text-[#2d9d45]">
          <CalendarDays size={16} />
          Booking Administration
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Booking Management
        </h1>

        
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                All Booking Requests
              </h2>
               
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedStatus === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Resource
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Start Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  End Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No bookings found for the selected status.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {booking.userId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {booking.resourceId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {booking.startTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {booking.endTime}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          disabled={loadingAction}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => openRejectModal(booking.id)}
                          disabled={loadingAction}
                          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No actions</span>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) translateX(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0) translateX(0);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

export default AdminBookingsPage;
