import { Bell, CalendarClock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/sessionUser";
import {
  formatNotificationTime,
  getNotificationsForUser,
  markNotificationAsRead,
} from "../../utils/notifications";

function NotificationsPage() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const [notifications, setNotifications] = useState(() =>
    getNotificationsForUser(sessionUser.userId)
  );

  const refreshNotifications = () => {
    setNotifications(getNotificationsForUser(sessionUser.userId));
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id, sessionUser.userId);
    refreshNotifications();
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#61CE70]">
            User alerts
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            All Notifications
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          <Bell size={16} />
          {notifications.length} total
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full rounded-2xl border p-4 text-left shadow-[0_10px_24px_-20px_rgba(15,23,42,0.9)] ${
                notification.isRead ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[11px] font-semibold ${notification.isRead ? "text-slate-400" : "text-emerald-600"}`}>
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <CalendarClock size={13} />
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default NotificationsPage;
