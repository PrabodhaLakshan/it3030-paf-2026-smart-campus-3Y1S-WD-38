import { Link, useLocation } from "react-router-dom";
import { getSessionUser } from "../../utils/sessionUser";

function UserSidebar() {
  const location = useLocation();
  const sessionUser = getSessionUser();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const getLinkClasses = (path) => {
    if (isActive(path)) {
      return "flex items-center gap-3 rounded-xl border border-[#61CE70]/20 bg-[#61CE70]/10 px-4 py-3 text-sm font-medium text-[#61CE70] shadow-sm transition-all";
    }

    return "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white";
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900 shadow-xl transition-all duration-300">
      <div className="flex flex-1 flex-col overflow-y-auto pb-4">
        <div className="px-4 py-6">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">User Panel</h2>
          <nav className="relative flex-1 space-y-2">
            <Link to="/dashboard" className={getLinkClasses("/dashboard")}> 
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              My Tickets
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-4 flex shrink-0 items-center gap-3 border-t border-slate-800 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#61CE70]/20 font-bold text-[#61CE70] ring-2 ring-[#61CE70] ring-offset-2 ring-offset-slate-900">
          {(sessionUser.userName || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{sessionUser.userName || "User"}</p>
          <p className="text-xs font-medium text-slate-400">{sessionUser.userId || "No user ID"}</p>
        </div>
      </div>
    </aside>
  );
}

export default UserSidebar;