import { Outlet } from "react-router-dom";
import TechnicianNavbar from "../components/technician_navbar/TechnicianNavbar";
import TechnicianSidebar from "../components/technician_sidebar/TechnicianSidebar";

function TechnicianLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <TechnicianNavbar />

      <div className="flex flex-1 overflow-hidden">
        <TechnicianSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TechnicianLayout;
