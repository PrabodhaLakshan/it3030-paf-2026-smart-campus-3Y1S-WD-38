import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user_navbar/UserNavbar";
import UserSidebar from "../components/user_sidebar/UserSidebar";

function UserLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(97,206,112,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)]">
      <UserNavbar />

      <div className="mx-auto flex w-full max-w-[1480px] items-start gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <UserSidebar />

        <main className="min-w-0 flex-1 rounded-[2.25rem] border border-white/80 bg-white/90 p-4 shadow-[0_34px_90px_-58px_rgba(15,23,42,0.42)] backdrop-blur sm:p-5 xl:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;