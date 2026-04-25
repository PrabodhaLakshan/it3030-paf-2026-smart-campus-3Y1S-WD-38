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
  Boxes,
} from "lucide-react";
import UserSidebar from "../../components/user_sidebar/UserSidebar";
import { getMyBookings } from "../../api/bookingApi";
import { getAllResources } from "../../api/resourceApi";

const STATUS_STYLES = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

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

function formatBookingDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function UserDashboardPage() {
  const [userId] = useState(getStoredUserCode);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  const fetchBookings = async () => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getMyBookings(userId);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      const response = await getAllResources();
      setResources(response.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard resources:", error);
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, [userId]);

  const summary = useMemo(() => {
    const approved = bookings.filter((booking) => booking.status === "APPROVED");
    const pending = bookings.filter((booking) => booking.status === "PENDING");
    const rejected = bookings.filter((booking) => booking.status === "REJECTED");
    const cancelled = bookings.filter((booking) => booking.status === "CANCELLED");

    const upcomingBookings = [...bookings]
      .filter((booking) => booking.startTime && new Date(booking.startTime) >= new Date())
      .sort(
        (first, second) =>
          new Date(first.startTime).getTime() -
          new Date(second.startTime).getTime()
      );

    return {
      total: bookings.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      cancelled: cancelled.length,
      nextBooking: upcomingBookings[0] || null,
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
      title: "Total Resources",
      value: resources.length,
      subtitle: "Resources available in catalogue",
      icon: Boxes,
      accent: "from-[#61CE70] to-emerald-500 text-white",
      loading: resourcesLoading,
    },
    {
      title: "Total Bookings",
      value: summary.total,
      subtitle: "All bookings linked to your account",
      icon: ClipboardList,
      accent: "from-slate-900 to-slate-700 text-white",
      loading,
    },
    {
      title: "Pending",
      value: summary.pending,
      subtitle: "Waiting for admin approval",
      icon: Clock3,
      accent: "from-amber-400 to-orange-400 text-white",
      loading,
    },
    {
      title: "Approved",
      value: summary.approved,
      subtitle: "Confirmed bookings ready to use",
      icon: CheckCircle2,
      accent: "from-[#61CE70] to-emerald-500 text-white",
      loading,
    },
    {
      title: "Rejected / Cancelled",
      value: summary.rejected + summary.cancelled,
      subtitle: "Bookings not currently active",
      icon: XCircle,
      accent: "from-red-500 to-rose-500 text-white",
      loading,
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef6f2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6">
        <UserSidebar />

        <main className="flex-1 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.65)] backdrop-blur xl:p-8">
          <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-[0_30px_60px_-40px_rgba(15,23,42,0.9)] sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                <Sparkles size={16} />
                User Dashboard
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <UserRound size={16} />
                {userId || "User code unavailable"}
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Welcome back to your booking workspace.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  View your booking counts, upcoming reservations, and recent
                  booking activity from one place.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/book-resource"
                    className="inline-flex items-center gap-2 rounded-full bg-[#61CE70] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#52ba60]"
                  >
                    Book a Resource
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View My Bookings
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-white/10 to-slate-900 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
                  <CalendarClock size={16} />
                  Next Scheduled Booking
                </div>

                <div className="mt-4">
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <LoaderCircle size={16} className="animate-spin" />
                      Loading booking data...
                    </div>
                  ) : summary.nextBooking ? (
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
                      No upcoming bookings found for your account.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                        {card.loading ? "--" : card.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {card.subtitle}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl bg-gradient-to-br p-3 shadow-sm ${card.accent}`}
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
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2d9d45]">
                    Recent Bookings
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Latest Activity
                  </h2>
                </div>

                <Link
                  to="/my-bookings"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Open All Bookings
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
                    No bookings are available for your account yet.
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
                        {booking.purpose && (
                          <p className="mt-2 text-sm text-slate-600">
                            {booking.purpose}
                          </p>
                        )}
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2d9d45]">
                Booking Progress
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Your Summary
              </h2>

              <div className="mt-6 rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">Approval Rate</p>
                <p className="mt-3 text-4xl font-semibold">
                  {summary.total === 0
                    ? "0%"
                    : `${Math.round((summary.approved / summary.total) * 100)}%`}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  of your booking requests are approved.
                </p>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-slate-200 p-5">
                <p className="text-sm font-medium text-slate-500">
                  Suggested Action
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {summary.pending > 0
                    ? "You have pending bookings. Check back later for admin updates."
                    : "No pending bookings right now. You can create a new request anytime."}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                <Link
                  to="/book-resource"
                  className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Start a New Booking
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/my-bookings"
                  className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                >
                  Review Booking History
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default UserDashboardPage;