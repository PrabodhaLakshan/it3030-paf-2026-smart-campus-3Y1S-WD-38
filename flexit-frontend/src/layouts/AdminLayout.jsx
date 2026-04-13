import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/Admin_navbar/admin_navbar';
import AdminSidebar from '../components/admin_sidebar/admin_sidebar';

function AdminLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Navigation */}
      <AdminNavbar />

      {/* Main Layout Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Workspace (Outlet renders matched child route) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
