import React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  XCircle,
  FolderClock,
} from "lucide-react";

function AdminBookingsPage() {
  const dummyBookings = [
    {
      id: 1,
      userId: "user001",
      resourceId: "resource001",
      startTime: "2026-04-16 10:00 AM",
      endTime: "2026-04-16 12:00 PM",
      status: "PENDING",
    },
    {
      id: 2,
      userId: "user002",
      resourceId: "resource002",
      startTime: "2026-04-17 09:00 AM",
      endTime: "2026-04-17 11:00 AM",
      status: "APPROVED",
    },
    {
      id: 3,
      userId: "user003",
      resourceId: "resource003",
      startTime: "2026-04-18 01:00 PM",
      endTime: "2026-04-18 03:00 PM",
      status: "REJECTED",
    },
  ];

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
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#61CE70]/10 px-4 py-2 text-sm font-semibold text-[#2d9d45]">
            <CalendarDays size={16} />
            Booking Administration
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Booking Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review, approve, and monitor all booking requests from one place.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-[#61CE70] px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#52ba60]">
          <FolderClock size={18} />
          Export Summary
        </button>
      </div>

      {/* Top summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Requests</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">24</h3>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Review</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">8</h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Clock3 size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Approved Today</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">5</h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Top tools */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Booking Requests</h2>
            <p className="text-sm text-slate-500">
              Track status and take action on pending requests.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by user or resource..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resource
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Start Time
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  End Time
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {dummyBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{booking.userId}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{booking.resourceId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.startTime}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.endTime}</td>
                  <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
                        <CheckCircle2 size={16} />
                        Approve
                      </button>

                      <button className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom note */}
        <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
          Showing recent booking requests for administrative review.
        </div>
      </div>
    </div>
  );
}

export default AdminBookingsPage;