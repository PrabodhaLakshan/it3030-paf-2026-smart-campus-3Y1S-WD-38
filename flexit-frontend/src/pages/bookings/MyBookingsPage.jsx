import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardList,
  MessageSquareText,
  Users,
  X,
} from "lucide-react";
import { getMyBookings, cancelBooking } from "../../api/bookingApi";

const getStoredUserCode = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("flexitUser") || "null");
    if (storedUser?.userCode) {
      return storedUser.userCode;
    }

    if (
      typeof storedUser?.userId === "string" &&
      /^user\d+$/i.test(storedUser.userId)
    ) {
      return storedUser.userId;
    }

    return "";
  } catch {
    return "";
  }
};

function MyBookingsPage() {
  const [userId] = useState(getStoredUserCode);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    text: "",
  });

  const [cancelModal, setCancelModal] = useState({
    open: false,
    bookingId: null,
    resourceId: "",
  });

  const showToast = (type, text) => {
    setToast({
      show: true,
      type,
      text,
    });
  };

  const closeToast = () => {
    setToast({
      show: false,
      type: "",
      text: "",
    });
  };

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      closeToast();
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.show]);

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchMyBookings = async () => {
    if (!userId.trim()) {
      showToast("error", "Logged-in user's user code was not found.");
      return;
    }

    try {
      setLoading(true);
      const response = await getMyBookings(userId.trim());
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch user bookings:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to fetch bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [userId]);

  const openCancelModal = (booking) => {
    setCancelModal({
      open: true,
      bookingId: booking.id,
      resourceId: booking.resourceId,
    });
  };

  const closeCancelModal = () => {
    setCancelModal({
      open: false,
      bookingId: null,
      resourceId: "",
    });
  };

  const handleCancelConfirm = async () => {
    try {
      setActionLoading(true);
      await cancelBooking(cancelModal.bookingId);
      showToast("success", "Booking cancelled successfully");
      closeCancelModal();
      fetchMyBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to cancel booking"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <AlertCircle size={14} />
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <XCircle size={14} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Toast */}
      {toast.show && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-sm animate-[slideIn_.25s_ease-out]">
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${
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
              onClick={closeToast}
              className="rounded-full p-1 transition hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-[fadeUp_.2s_ease-out]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  <MessageSquareText size={14} />
                  Cancel Booking
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Are you sure?
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  This will cancel your booking for{" "}
                  <span className="font-semibold text-slate-700">
                    {cancelModal.resourceId}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Once cancelled, this booking status will be updated and may need
                a new request if you want to book again.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={actionLoading}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {actionLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          to="/user/dashboard"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#61CE70]/10 px-4 py-2 text-sm font-semibold text-[#2d9d45]">
          <CalendarDays size={16} />
          User Booking Portal
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Bookings
        </h1>
        
      </div>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Showing your booking history
            </h2>
             
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            <Users size={16} />
            {userId || "User code unavailable"}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200"></div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Loading bookings...
              </p>
              <p className="text-sm text-slate-500">
                Please wait while we fetch your requests.
              </p>
            </div>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ClipboardList size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No bookings found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            We could not find any bookings for your account yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {booking.resourceId}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Start Time
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <CalendarDays size={16} />
                        {formatDateTime(booking.startTime)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        End Time
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock3 size={16} />
                        {formatDateTime(booking.endTime)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        User ID
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Users size={16} />
                        {booking.userId}
                      </p>
                    </div>

                  </div>

                  {booking.purpose && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Purpose
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {booking.purpose}
                      </p>
                    </div>
                  )}

                  {booking.expectedAttendees && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                      <Users size={16} />
                      Expected Attendees: {booking.expectedAttendees}
                    </div>
                  )}
                </div>

                <div className="flex min-w-[170px] flex-col gap-3">
                  {booking.status === "APPROVED" && (
                    <button
                      onClick={() => openCancelModal(booking)}
                      className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status !== "APPROVED" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No actions available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default MyBookingsPage;
