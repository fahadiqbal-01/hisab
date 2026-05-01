import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import SidebarLink from "@/components/SidebarLink";

export default async function DashboardLayout({ children }) {
  // 1. Fetch the session on the server
  const session = await getServerSession(authOptions);

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: "📊" },
    { name: "Invoices", href: "/dashboard/invoices", icon: "📄" },
    { name: "Clients", href: "/dashboard/clients", icon: "👥" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fdfaf1] overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#071f18] text-white p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-widest uppercase">
            Hisab
          </span>
        </div>
        <label htmlFor="mobile-menu-toggle" className="cursor-pointer p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </label>
      </header>

      {/* Hidden checkbox for mobile menu toggle logic */}
      <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />

      {/* Sidebar */}
      <aside
        className="
        fixed inset-y-0 left-0 z-40 w-64 bg-[#071f18] text-white flex flex-col border-r border-white/10
        transition-transform -translate-x-full peer-checked:translate-x-0
        md:relative md:translate-x-0
      "
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <span className="font-bold text-4xl tracking-widest uppercase ml-2 ">
              Hisab
            </span>
            <p className="text-[18px] uppercase tracking-[0.2em] text-white/30 font-bold px-2 mt-5 ">
              {session?.user?.name || "Studio"}
            </p>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarLink
                key={item.name}
                href={item.href}
                icon={item.icon}
                name={item.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white"
              />
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <label
        htmlFor="mobile-menu-toggle"
        className="fixed inset-0 bg-black/50 z-30 hidden peer-checked:block md:hidden"
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* We pass the session to children if needed, but Page.js usually handles its own session */}
        {children}
      </main>
    </div>
  );
}
