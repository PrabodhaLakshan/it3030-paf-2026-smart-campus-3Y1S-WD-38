import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPasswordStatus } from "../../api/authApi";
import { clearSessionUser, getSessionUser } from "../../utils/sessionUser";
import {
  formatNotificationTime,
  getNotificationCount,
  getNotificationsForUser,
  markNotificationAsRead,
} from "../../utils/notifications";

function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getSessionUser();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasPassword, setHasPassword] = useState(() => sessionUser.hasPassword ?? true);
  const [notifications, setNotifications] = useState(() =>
    getNotificationsForUser(sessionUser.userId)
  );
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const latestNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);
  const notificationCount = getNotificationCount(sessionUser.userId);

  const refreshNotifications = () => {
    setNotifications(getNotificationsForUser(sessionUser.userId));
  };

  useEffect(() => {
    refreshNotifications();
  }, [sessionUser.userId]);

  useEffect(() => {
    const fetchPasswordStatus = async () => {
      if (!sessionUser.userId) return;
      if (typeof sessionUser.hasPassword === "boolean") {
        setHasPassword(sessionUser.hasPassword);
        return;
      }

      try {
        const status = await getPasswordStatus(sessionUser.userId);
        setHasPassword(Boolean(status.hasPassword));
      } catch {
        setHasPassword(true);
      }
    };

    fetchPasswordStatus();
  }, [sessionUser.userId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }

      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === "flexitNotifications") {
        refreshNotifications();
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshNotifications);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, [sessionUser.userId]);

  const handleLogout = () => {
    clearSessionUser();
    navigate("/login", { replace: true });
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/user/notifications");
  };

  const handleUpdateDetails = () => {
    setIsProfileOpen(false);
    navigate("/user/profile/update");
  };

  const handleChangePassword = () => {
    setIsProfileOpen(false);
    navigate("/user/profile/change-password");
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id, sessionUser.userId);
    refreshNotifications();
    setIsNotificationOpen(false);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      return;
    }

    navigate("/user/notifications");
  };

  const navItems = [
    { label: "About Us", path: "/user/dashboard" },
    { label: "Services", path: "/user/resources" },
    { label: "Contact Us", path: "/user/tickets/create" },
    { label: "Updates", path: "/user/notifications" },
  ];

  return (
    <nav className="w-full bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative z-50 transform-none">
      <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex justify-between items-center h-20">

          {/* Left Side: Logo */}
          <button
            onClick={() => navigate("/user/dashboard")}
            className="inline-flex items-center rounded-xl p-1 transition hover:bg-white/60"
            aria-label="Go to dashboard"
          >
            <img
              src="/images/flexit_logo_lightbg1.png"
              alt="FlexIT Logo"
              className="h-12 w-auto sm:h-14"
            />
          </button>

          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.8)] lg:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-300 ${
                    isActive
                      ? "bg-[#0a192f] text-white shadow-md"
                      : "text-slate-600 hover:bg-[#61CE70]/15 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side: Profile and Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsNotificationOpen((previous) => !previous);
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                ) : null}
              </button>

              {isNotificationOpen ? (
                <div className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <span className="text-xs font-medium text-slate-500">{notificationCount} unread</span>
                  </div>

                  <div className="space-y-2">
                    {latestNotifications.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      latestNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                            notification.isRead
                              ? "border-slate-200 bg-slate-50"
                              : "border-emerald-200 bg-emerald-50/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                            <span className={`text-[10px] font-semibold ${notification.isRead ? "text-slate-400" : "text-emerald-600"}`}>
                              {notification.isRead ? "Read" : "Unread"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{notification.message}</p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={handleViewAllNotifications}
                    className="mt-3 w-full rounded-xl bg-[#0a192f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10274a]"
                  >
                    View all notifications
                  </button>
                </div>
              ) : null}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => {
                  setIsNotificationOpen(false);
                  setIsProfileOpen((previous) => !previous);
                }}
                className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50"
                aria-label="Open user profile menu"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[1.1rem] bg-[#0a192f] font-bold text-[#61CE70] ring-2 ring-[#61CE70]/20">
                  {(sessionUser.userName || "U").charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700">
                    {sessionUser.userName || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {sessionUser.userEmail || "No email available"}
                  </p>
                </div>
              </button>

              {isProfileOpen ? (
                <div className="absolute right-0 mt-3 w-[330px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">{sessionUser.userName || "User"}</p>
                    <p className="mt-1 text-xs text-slate-600">{sessionUser.userEmail || "No email available"}</p>
                    <p className="mt-1 text-xs text-slate-500">User ID: {sessionUser.userId || "N/A"}</p>
                    <p className="text-xs text-slate-500">Role: {sessionUser.role || "USER"}</p>
                  </div>

                  <div className="mt-3 space-y-2">
                    <button
                      onClick={handleUpdateDetails}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Update Details
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      {hasPassword ? "Change Password" : "Set a Password"}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;