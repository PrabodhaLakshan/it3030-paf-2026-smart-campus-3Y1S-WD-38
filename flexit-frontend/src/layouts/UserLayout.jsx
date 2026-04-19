import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user_navbar/UserNavbar";
import UserSidebar from "../components/user_sidebar/UserSidebar";

function UserLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(97,206,112,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_25%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f2_100%)]">
      <UserNavbar />
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6">
        <UserSidebar />

        <main className="min-w-0 flex-1 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.65)] backdrop-blur xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;