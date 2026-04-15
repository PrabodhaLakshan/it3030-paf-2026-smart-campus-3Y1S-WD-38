import { Outlet } from "react-router-dom";
import UserNavbar from "../components/user_navbar/UserNavbar";
import UserSidebar from "../components/user_sidebar/UserSidebar";

function UserLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <UserNavbar />

      <div className="flex flex-1 overflow-hidden">
        <UserSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;