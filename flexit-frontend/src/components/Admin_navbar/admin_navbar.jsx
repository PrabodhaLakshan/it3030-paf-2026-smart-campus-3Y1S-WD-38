import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser } from '../../utils/sessionUser';
import {
  formatNotificationTime,
  getMyNotifications,
  getMyUnreadNotificationCount,
  markMyNotificationAsRead,
} from '../../api/notificationApi';

function AdminNavbar() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const [adminName, setAdminName] = useState('Admin');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);

  const latestNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);

  const refreshNotifications = async () => {
    if (!sessionUser.userId) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    try {
      const [items, unread] = await Promise.all([
        getMyNotifications(sessionUser.userId, sessionUser.role, 30),
        getMyUnreadNotificationCount(sessionUser.userId, sessionUser.role),
      ]);

      setNotifications(Array.isArray(items) ? items : []);
      setNotificationCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    if (sessionUser.userName) {
      setAdminName(sessionUser.userName);
    }
  }, [sessionUser.userName]);

  useEffect(() => {
    refreshNotifications();
  }, [sessionUser.userId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('focus', refreshNotifications);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('focus', refreshNotifications);
    };
  }, [sessionUser.userId, sessionUser.role]);

  const handleNotificationClick = async (notification) => {
    try {
      await markMyNotificationAsRead(notification.id, sessionUser.userId, sessionUser.role);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    refreshNotifications();
    setIsNotificationOpen(false);

    if (notification.actionUrl) {
      const target = String(notification.actionUrl || '').trim();
      if (target.startsWith('http://') || target.startsWith('https://')) {
        window.open(target, '_blank', 'noopener,noreferrer');
      } else {
        const safePath = target.startsWith('/') ? target : `/${target}`;
        window.open(safePath, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    navigate('/admin/notifications');
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    navigate('/admin/notifications');
  };

  const handleLogout = () => {
    localStorage.removeItem('flexitUser');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Left Side: Logo and Dashboard */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
              <img
                className="h-12 w-auto object-cover rounded-xl shadow-sm ring-1 ring-black/5"
                src="/flexit.jpeg"
                alt="FlexIT Logo"
              />
              <span className="ml-3 font-extrabold text-2xl tracking-tight text-[#0a192f]">
                Flex<span className="text-[#61CE70]">IT</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center ml-4 gap-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="relative px-5 py-2.5 rounded-full bg-gray-50 text-gray-700 font-semibold text-sm transition-all hover:bg-white hover:text-[#61CE70] hover:shadow-md border border-transparent hover:border-gray-200 group"
              >
                Dashboard
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#61CE70] group-hover:w-1/2 group-hover:-translate-x-1/2 transition-all duration-300 ease-out rounded-full"></span>
              </button>

              <button
                onClick={() => navigate('/admin/resources')}
                className="relative px-5 py-2.5 rounded-full text-gray-600 font-semibold text-sm transition-all hover:bg-white hover:text-[#61CE70] hover:shadow-md border border-transparent hover:border-gray-200 group"
              >
                Resources
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#61CE70] group-hover:w-1/2 group-hover:-translate-x-1/2 transition-all duration-300 ease-out rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Right Side: Profile and Logout */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotificationOpen((previous) => !previous)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
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
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${notification.isRead
                              ? 'border-slate-200 bg-slate-50'
                              : 'border-emerald-200 bg-emerald-50/60'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                            <span className={`text-[10px] font-semibold ${notification.isRead ? 'text-slate-400' : 'text-emerald-600'}`}>
                              {notification.isRead ? 'Read' : 'Unread'}
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
            <button className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
              <div className="h-10 w-10 rounded-full bg-[#0a192f] flex justify-center items-center text-[#61CE70] font-bold shadow-inner border-2 border-[#61CE70]/20">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block font-semibold text-sm text-gray-700 group-hover:text-[#61CE70] transition-colors">
                {adminName}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-full bg-[#0a192f] text-white font-semibold text-sm transition-all duration-300 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 focus:ring-4 focus:ring-red-200 active:scale-95"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;