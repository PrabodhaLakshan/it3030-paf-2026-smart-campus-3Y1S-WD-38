import { Link, useNavigate } from "react-router-dom";
import { clearSessionUser, getSessionUser } from "../../utils/sessionUser";

function UserNavbar() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const handleLogout = () => {
    clearSessionUser();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative z-50 transform-none">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Side: Logo and Title */}
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,_#0a192f_0%,_#1e293b_55%,_#61CE70_150%)] text-base font-black text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95">
                  F
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#61CE70]">
                    FlexIT
                  </p>
                  <p className="text-sm font-semibold tracking-tight text-slate-600">
                    User workspace
                  </p>
                </div>
             </div>
          </div>

          {/* Right Side: Profile and Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Profile */}
            <div className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-[1.1rem] bg-[#0a192f] font-bold text-[#61CE70] ring-2 ring-[#61CE70]/20">
                 {(sessionUser.userName || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                 {sessionUser.userName || "User"}
              </span>
            </div>
            
            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-full bg-[#0a192f] text-white font-semibold text-sm transition-all duration-300 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 focus:ring-4 focus:ring-red-200 active:scale-95"
            >
              Logout
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;