import React from "react";
import { NavLink } from "react-router-dom";
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
        to: "/user/resources",
        label: "Resources",
        icon: Layers,
    },
];

function UserSidebar() {
    return (
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-80 shrink-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.75)] backdrop-blur lg:flex lg:flex-col">
            <div className="border-b border-slate-200 px-6 py-6">
                <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#61CE70_140%)] p-5 text-white">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">
                        Flexit
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                        User Dashboard
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Booking management with a clearer view of your activity.
                    </p>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-4 py-5">
                <nav className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink key={item.label} to={item.to}>
                                {({ isActive }) => (
                                    <div
                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                                ? "bg-slate-950 text-white shadow-[0_16px_30px_-20px_rgba(15,23,42,0.95)]"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                            }`}
                                    >
                                        <span
                                            className={`rounded-xl p-2 transition ${isActive
                                                    ? "bg-white/10 text-white"
                                                    : "bg-slate-100 text-slate-500"
                                                }`}
                                        >
                                            <Icon size={18} />
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-200 pt-5">
                    <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-500 transition hover:bg-rose-50">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default UserSidebar;