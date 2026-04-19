import { Link, useLocation } from "react-router-dom";
import { getSessionUser } from "../../utils/sessionUser";

function TechnicianSidebar() {
  const location = useLocation();
  const sessionUser = getSessionUser();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const getLinkClasses = (path) => {
    if (isActive(path)) {
      return "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[#61CE70] bg-[#61CE70]/10 border border-[#61CE70]/20 shadow-sm transition-all";
    }
    return "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors";
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shadow-xl flex flex-col h-full z-10 transition-all duration-300">
      <div className="flex flex-col flex-1 pb-4 overflow-y-auto">
        <div className="px-4 py-6">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">Technician Panel</h2>
          <nav className="flex-1 space-y-2 relative">
            <Link to="/technician/dashboard" className={getLinkClasses("/technician/dashboard")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
              My Assigned Tickets
            </Link>
          </nav>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3 p-4 border-t border-slate-800 mx-4">
        <div className="h-10 w-10 rounded-full bg-[#61CE70]/20 flex justify-center items-center text-[#61CE70] font-bold ring-2 ring-[#61CE70] ring-offset-2 ring-offset-slate-900">
          {(sessionUser.userName || "T").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{sessionUser.userName || "Technician"}</p>
          <p className="text-xs font-medium text-slate-400">{sessionUser.userId || "No user ID"}</p>
        </div>
      </div>
    </aside>
  );
}

export default TechnicianSidebar;
