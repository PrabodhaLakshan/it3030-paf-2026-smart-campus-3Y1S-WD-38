import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  LoaderCircle,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";
import UserSidebar from "../../components/user_sidebar/UserSidebar";
import { getMyBookings } from "../../api/bookingApi";

const STATUS_STYLES = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

function formatBookingDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function UserDashboardPage() {
  const [userId, setUserId] = useState("user001");
  const [draftUserId, setDraftUserId] = useState("user001");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (targetUserId = userId) => {
    try {
      setLoading(true);
      const response = await getMyBookings(targetUserId);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(userId);
  }, [userId]);

  const summary = useMemo(() => {
    const approved = bookings.filter((booking) => booking.status === "APPROVED");
    const pending = bookings.filter((booking) => booking.status === "PENDING");
    const rejected = bookings.filter((booking) => booking.status === "REJECTED");

    return {
      total: bookings.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      nextBooking:
        [...bookings]
          .filter((booking) => booking.startTime)
          .sort(
            (first, second) =>
              new Date(first.startTime).getTime() -
              new Date(second.startTime).getTime()
          )[0] || null,
    };
  }, [bookings]);

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort(
          (first, second) =>
            new Date(second.startTime).getTime() -
            new Date(first.startTime).getTime()
        )
        .slice(0, 4),
    [bookings]
  );

  const statCards = [
    {
      title: "Total bookings",
      value: summary.total,
      subtitle: "All requests tied to your account",
      icon: ClipboardList,
      accent: "from-sky-500/15 to-cyan-400/10 text-sky-700",
    },
    {
      title: "Pending review",
      value: summary.pending,
      subtitle: "Requests awaiting a decision",
      icon: Clock3,
      accent: "from-amber-400/20 to-orange-300/10 text-amber-700",
    },
    {
      title: "Approved",
      value: summary.approved,
      subtitle: "Bookings ready to use",
      icon: CheckCircle2,
      accent: "from-emerald-500/20 to-lime-300/10 text-emerald-700",
    },
    {
      title: "Rejected",
      value: summary.rejected,
      subtitle: "Requests that need adjustment",
      icon: XCircle,
      accent: "from-rose-500/20 to-pink-300/10 text-rose-700",
    },
  ];

  const handleLoadDashboard = () => {
    const nextUserId = draftUserId.trim() || "user001";
    setDraftUserId(nextUserId);
    setUserId(nextUserId);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(97,206,112,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_25%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6">
        <UserSidebar />

        <main className="flex-1 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.65)] backdrop-blur xl:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-[0_30px_60px_-40px_rgba(15,23,42,0.9)] sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                  <Sparkles size={16} />
                  User workspace
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <UserRound size={16} />
                  Viewing: {userId}
                </div>
              </div>

              <div className="mt-8 max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  A cleaner way to track every booking in one place.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  See what is pending, what is approved, and what needs your
                  attention without bouncing between pages.
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <CalendarClock size={16} />
                    Next scheduled booking
                  </div>
                  <div className="mt-4">
                    {summary.nextBooking ? (
                      <>
                        <p className="text-2xl font-semibold text-white">
                          {summary.nextBooking.resourceId}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          {formatBookingDate(summary.nextBooking.startTime)}
                        </p>
                        <span
                          className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            STATUS_STYLES[summary.nextBooking.status] ||
                            "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {summary.nextBooking.status}
                        </span>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-4 text-sm text-slate-400">
                        No booking data yet. Load a user ID to see upcoming
                        reservations.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-white/10 to-sky-400/10 p-5">
                  <p className="text-sm font-medium text-emerald-100">
                    Quick start
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Need something new? Jump straight into a booking request or
                    open your full booking list for status updates.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/book-resource"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
                    >
                      Book now
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      View bookings
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <CalendarDays size={16} />
                Dashboard source
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Load your booking snapshot
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The project currently uses a manual user ID lookup, so this
                panel lets you swap the dashboard context quickly.
              </p>

              <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
                <label
                  htmlFor="dashboard-user-id"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  User ID
                </label>
                <input
                  id="dashboard-user-id"
                  type="text"
                  value={draftUserId}
                  onChange={(event) => setDraftUserId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter user ID"
                />
                <button
                  onClick={handleLoadDashboard}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Refresh dashboard
                </button>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">Current profile</p>
                  <p className="mt-1">Showing data for {userId}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">Records loaded</p>
                  <p className="mt-1">{summary.total} bookings in this view</p>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                        {loading ? "--" : card.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {card.subtitle}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl bg-gradient-to-br p-3 ${card.accent}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Recent bookings
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Latest activity
                  </h2>
                </div>
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Open all bookings
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="flex items-center gap-3 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    <LoaderCircle size={18} className="animate-spin" />
                    Loading your dashboard activity...
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No bookings are available for this user yet.
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {booking.resourceId}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatBookingDate(booking.startTime)} to{" "}
                          {formatBookingDate(booking.endTime)}
                        </p>
                        {booking.purpose ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {booking.purpose}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[booking.status] ||
                          "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Focus
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                What to do next
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-300">Approval progress</p>
                  <p className="mt-3 text-4xl font-semibold">
                    {summary.total === 0
                      ? "0%"
                      : `${Math.round(
                          (summary.approved / summary.total) * 100
                        )}%`}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    of your visible requests are already approved.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Suggested action
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {summary.pending > 0
                      ? "Keep an eye on pending requests and check status updates."
                      : "You are caught up. Create a new booking whenever you are ready."}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Shortcuts
                  </p>
                  <div className="mt-4 grid gap-3">
                    <Link
                      to="/book-resource"
                      className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Start a new request
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                    >
                      Review booking history
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default UserDashboardPage;
