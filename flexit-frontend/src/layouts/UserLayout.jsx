import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user_navbar/UserNavbar";
import UserSidebar from "../components/user_sidebar/UserSidebar";

function UserLayout() {
  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(97,206,112,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)]">
      <UserNavbar />

      <div className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-[1600px] items-start gap-5 overflow-hidden px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <UserSidebar />

        <main className="min-w-0 flex-1 overflow-y-auto rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.45)] backdrop-blur sm:p-5 xl:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;