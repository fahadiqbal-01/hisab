import React from "react";
import Link from "next/link";
import { getCachedServerSession } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";
import SidebarLink from "@/components/SidebarLink";
import { MdOutlineAnalytics } from "react-icons/md";
import { FaFileInvoice, FaUsers } from "react-icons/fa";
import { SlSettings } from "react-icons/sl";
import DasboardLogo from "@/components/DasboardLogo";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }) {
  const session = await getCachedServerSession();

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: <MdOutlineAnalytics /> },
    { name: "Invoices", href: "/dashboard/invoices", icon: <FaFileInvoice /> },
    { name: "Clients", href: "/dashboard/clients", icon: <FaUsers /> },
    { name: "Settings", href: "/dashboard/settings", icon: <SlSettings /> },
  ];

  return (
    <div className=" select-none flex flex-col md:flex-row h-screen bg-[#fdfaf1] overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#071f18] dark:bg-[#0d0d0d] text-white p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <DasboardLogo />
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

      <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />

      {/* Sidebar */}
      <aside
        className="
        fixed inset-y-0 left-0 z-40 w-45 bg-[#071f18] dark:bg-[#0d0d0d] md:pt-0 pt-15 text-white flex flex-col border-r border-white/10
        transition-transform -translate-x-full peer-checked:translate-x-0
        md:relative md:translate-x-0
      "
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <DasboardLogo className=" md:block hidden " />
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarLink
                key={item.name}
                href={item.href}
                icon={item.icon}
                name={item.name}
                className=" select-none flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white"
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
      <main className=" bg-[#fcfbf2] dark:bg-black flex-1 overflow-y-auto p-6 md:p-10">
        <div className="animate-in fade-in duration-200">{children}</div>
      </main>
    </div>
  );
}
