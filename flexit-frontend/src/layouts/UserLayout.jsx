import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user_navbar/UserNavbar";
import UserSidebar from "../components/user_sidebar/UserSidebar";

function UserLayout() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navigation */}
      <UserNavbar />

      {/* Main Layout Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <UserSidebar />

        {/* Main Workspace (Outlet renders matched child route) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;