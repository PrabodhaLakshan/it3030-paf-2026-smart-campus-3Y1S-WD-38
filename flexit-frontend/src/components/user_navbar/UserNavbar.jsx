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
    <nav className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1480px] rounded-[1.8rem] border border-slate-200/75 bg-white/88 px-4 shadow-[0_16px_42px_-30px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:px-5 lg:px-6">
        <div className="flex h-15 items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,_#0a192f_0%,_#1e293b_55%,_#61CE70_150%)] text-base font-black text-white shadow-lg shadow-slate-900/10 transition-transform duration-300 hover:scale-105 active:scale-95">
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

            <Link
              to="/user/dashboard"
              className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#61CE70]/40 hover:bg-white hover:text-[#0a192f] hover:shadow-[0_14px_30px_-18px_rgba(97,206,112,0.35)] focus:ring-4 focus:ring-emerald-200/50 active:translate-y-0 md:inline-flex"
            >
              My Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-[1.1rem] bg-[#0a192f] font-bold text-[#61CE70] ring-2 ring-[#61CE70]/20">
                {(sessionUser.userName || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                {sessionUser.userName || "User"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-[1.35rem] border border-[#0a192f]/10 bg-linear-to-r from-[#0a192f] via-[#1a2740] to-[#61CE70] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-20px_rgba(10,25,47,0.75)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-22px_rgba(97,206,112,0.55)] focus:ring-4 focus:ring-[#61CE70]/30 active:translate-y-0"
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