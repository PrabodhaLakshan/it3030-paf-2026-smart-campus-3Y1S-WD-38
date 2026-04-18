import { useNavigate } from "react-router-dom";
import { clearSessionUser, getSessionUser } from "../../utils/sessionUser";

function UserNavbar() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const handleLogout = () => {
    clearSessionUser();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0a192f_0%,_#1e293b_55%,_#61CE70_150%)] text-lg font-black text-white shadow-lg shadow-slate-900/10 transition-transform duration-300 hover:scale-105 active:scale-95">
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

            <a
              href="/user/dashboard"
              className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#61CE70]/40 hover:bg-white hover:text-[#0a192f] md:inline-flex"
            >
              My Dashboard
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a192f] font-bold text-[#61CE70] ring-2 ring-[#61CE70]/20">
                {(sessionUser.userName || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                {sessionUser.userName || "User"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#0a192f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] hover:shadow-lg hover:shadow-[#61CE70]/20 focus:ring-4 focus:ring-[#61CE70]/20 active:scale-95"
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