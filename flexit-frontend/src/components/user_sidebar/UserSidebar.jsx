import React from "react";
import { NavLink } from "react-router-dom";
import { clearSessionUser } from "../../utils/sessionUser";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList,
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Layers,
} from "lucide-react";

const navigationItems = [
    {
        to: "/user/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
     {
        to: "/user/resources",
        label: "Resources",
        icon: Layers,
    },
    {
        to: "/book-resource",
        label: "Book Resource",
        icon: PlusCircle,
    },
    {
        to: "/my-bookings",
        label: "My Bookings",
        icon: ClipboardList,
    },
    {
        to: "/user/tickets/create",
        label: "Raise Ticket",
        icon: PlusCircle,
    },
    
   
];

function UserSidebar() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        clearSessionUser();
        navigate("/login", { replace: true });
    };

    return (
        <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 shadow-xl hidden lg:flex lg:flex-col h-full z-10 transition-all duration-300">
            <div className="flex flex-col flex-1 pb-4 overflow-y-auto">
                <div className="px-4 py-6">
                    <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
                        User Menu
                    </h2>
                    <nav className="flex-1 space-y-2 relative">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink key={item.label} to={item.to} className="block">
                                    {({ isActive }) => (
                                        <div
                                            className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                                ? "text-[#61CE70] bg-[#61CE70]/10 border border-[#61CE70]/20 shadow-sm"
                                                : "text-slate-300 hover:text-white hover:bg-slate-800"
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="flex-1">{item.label}</span>
                                        </div>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-3 p-4 border-t border-slate-800 mx-4 mt-auto">
                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:border-rose-500/40 hover:bg-rose-500/20">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default UserSidebar;