import { useNavigate } from "react-router-dom";
import { clearSessionUser, getSessionUser } from "../../utils/sessionUser";

function TechnicianNavbar() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const handleLogout = () => {
    clearSessionUser();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-6">
            <div className="shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
              <img
                className="h-12 w-auto object-cover rounded-xl shadow-sm ring-1 ring-black/5"
                src="/flexit.jpeg"
                alt="FlexIT Logo"
              />
              <span className="ml-3 font-extrabold text-2xl tracking-tight text-[#0a192f]">
                Flex<span className="text-[#61CE70]">IT</span>
              </span>
            </div>

            <div className="hidden md:flex items-center ml-4 gap-2">
              <a
                href="/technician/dashboard"
                className="relative px-5 py-2.5 rounded-full bg-gray-50 text-gray-700 font-semibold text-sm transition-all hover:bg-white hover:text-[#61CE70] hover:shadow-md border border-transparent hover:border-gray-200 group"
              >
                My Tickets
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#61CE70] group-hover:w-1/2 group-hover:-translate-x-1/2 transition-all duration-300 ease-out rounded-full"></span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
              <div className="h-10 w-10 rounded-full bg-[#0a192f] flex justify-center items-center text-[#61CE70] font-bold shadow-inner border-2 border-[#61CE70]/20">
                {(sessionUser.userName || "T").charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block font-semibold text-sm text-gray-700 group-hover:text-[#61CE70] transition-colors">
                {sessionUser.userName || "Technician"}
              </span>
            </button>

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

export default TechnicianNavbar;
