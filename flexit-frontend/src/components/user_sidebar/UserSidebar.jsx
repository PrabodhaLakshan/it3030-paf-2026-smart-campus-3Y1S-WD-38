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
        to: "/user/tickets/create",
        label: "Raise Ticket",
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
        <aside className="hidden h-full w-[252px] shrink-0 overflow-hidden rounded-[2rem] border border-white/75 bg-white/88 shadow-[0_32px_85px_-58px_rgba(15,23,42,0.74)] backdrop-blur lg:flex lg:flex-col">
            <div className="border-b border-slate-200/80 px-3 py-3.5">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#61CE70_140%)] p-4 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.65)]">
                    <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                        FlexIT Workspace
                    </div>
                    <h2 className="mt-3 text-lg font-semibold tracking-tight xl:text-xl">
                        User Dashboard
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-slate-300 xl:text-sm">
                        Keep track of your tickets, requests, and resources in one place.
                    </p>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-3 py-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Navigation
                </p>

                <nav className="mt-3 space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink key={item.label} to={item.to} className="block">
                                {({ isActive }) => (
                                    <div
                                        className={`group flex items-center gap-3 rounded-[1.35rem] border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                                ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.9)]"
                                                : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                                            }`}
                                    >
                                        <span
                                            className={`rounded-xl p-2 transition ${isActive
                                                    ? "bg-white/10 text-white"
                                                    : "bg-slate-100 text-slate-500 group-hover:bg-white"
                                                }`}
                                        >
                                            <Icon size={18} />
                                        </span>
                                        <span className="flex-1">{item.label}</span>
                                        {isActive ? (
                                            <span className="h-2 w-2 rounded-full bg-[#61CE70]" />
                                        ) : null}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-200/80 pt-4">
                    <button className="flex w-full items-center justify-center gap-3 rounded-[1.35rem] border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default UserSidebar;