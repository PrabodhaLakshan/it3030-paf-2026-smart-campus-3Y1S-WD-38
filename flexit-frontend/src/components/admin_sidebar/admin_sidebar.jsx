import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AdminSidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getLinkClasses = (path) => {
    if (isActive(path)) {
      return "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[#61CE70] bg-[#61CE70]/10 border border-[#61CE70]/20 shadow-sm transition-all";
    }
    return "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors";
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shadow-xl flex flex-col h-full z-10 transition-all duration-300">
      <div className="flex flex-col flex-1 pb-4 overflow-y-auto">
        <div className="px-4 py-6">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
            Admin Controls
          </h2>
          <nav className="flex-1 space-y-2 relative">
            <Link 
              to="/admin/dashboard" 
              className={getLinkClasses('/admin/dashboard')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </Link>
            
            <Link 
              to="/admin/resources" 
              className={getLinkClasses('/admin/resources')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Resource Management
            </Link>

            <Link
              to="/admin/bookings"
              className={getLinkClasses('/admin/bookings')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>
              Booking Management
            </Link>

            <Link 
              to="/admin/tickets" 
              className={getLinkClasses('/admin/tickets')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
              Ticket Management
            </Link>
            
            <Link 
              to="/admin/users" 
              className={getLinkClasses('/admin/users')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              User Management
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="shrink-0 flex items-center gap-3 p-4 border-t border-slate-800 mx-4">
        <div className="h-10 w-10 rounded-full bg-[#61CE70]/20 flex justify-center items-center text-[#61CE70] font-bold ring-2 ring-[#61CE70] ring-offset-2 ring-offset-slate-900">
          A
        </div>
        <div>
          <p className="text-sm font-medium text-white">Admin Profile</p>
          <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">View settings</p>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;