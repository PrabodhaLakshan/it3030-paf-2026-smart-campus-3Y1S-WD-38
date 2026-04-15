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
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center transition-transform duration-300 hover:scale-105 active:scale-95">
              <img className="h-12 w-auto rounded-xl object-cover shadow-sm ring-1 ring-black/5" src="/flexit.jpeg" alt="FlexIT Logo" />
              <span className="ml-3 text-2xl font-extrabold tracking-tight text-[#0a192f]">
                Flex<span className="text-[#61CE70]">IT</span>
              </span>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <a
                href="/dashboard"
                className="group relative rounded-full border border-transparent bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-200 hover:bg-white hover:text-[#61CE70] hover:shadow-md"
              >
                My Dashboard
                <span className="absolute bottom-0 left-1/2 h-0.5 w-0 rounded-full bg-[#61CE70] transition-all duration-300 ease-out group-hover:w-1/2 group-hover:-translate-x-1/2" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50 p-1.5 pr-4 transition-all duration-300 hover:bg-white hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#61CE70]/20 bg-[#0a192f] font-bold text-[#61CE70] shadow-inner">
                {(sessionUser.userName || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold text-gray-700 transition-colors group-hover:text-[#61CE70] sm:block">
                {sessionUser.userName || "User"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#0a192f] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 focus:ring-4 focus:ring-red-200 active:scale-95"
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