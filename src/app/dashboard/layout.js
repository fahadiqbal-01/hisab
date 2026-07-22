import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCachedServerSession } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";
import SidebarLink from "@/components/SidebarLink";
import { MdOutlineAnalytics } from "react-icons/md";
import { FaFileInvoice, FaUsers } from "react-icons/fa";
import { SlSettings } from "react-icons/sl";
import DasboardLogo from "@/components/DasboardLogo";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }) {
  const session = await getCachedServerSession();

  if (!session) {
    redirect("/sign-up");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = getTranslations(lang);

  const menuItems = [
    { name: t.overview, href: "/dashboard", icon: <MdOutlineAnalytics /> },
    { name: t.invoices, href: "/dashboard/invoices", icon: <FaFileInvoice /> },
    { name: t.clients, href: "/dashboard/clients", icon: <FaUsers /> },
    { name: t.settings, href: "/dashboard/settings", icon: <SlSettings /> },
  ];

  return (
    <div className="select-none flex flex-col md:flex-row h-[100dvh] bg-[#F9F8F5] dark:bg-[#050706] overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#082019] dark:bg-[#0b0c10] text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-2">
          <DasboardLogo />
        </div>
        <label htmlFor="mobile-menu-toggle" className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors">
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
        fixed inset-y-0 left-0 z-40 w-60 bg-[#082019] dark:bg-[#070908] md:pt-0 pt-15 text-white flex flex-col border-r border-white/5
        transition-transform -translate-x-full peer-checked:translate-x-0
        md:relative md:translate-x-0
      "
      >
        <div className="flex flex-col h-full">
          <div className="p-6 mb-2">
            <DasboardLogo className="md:block hidden" />
            <p className="text-[14px] text-green-300 font-bold ml-2">{t.beta}</p>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarLink
                key={item.name}
                href={item.href}
                icon={item.icon}
                name={item.name}
              />
            ))}
          </nav>

          {/* Profile & Sign Out Widget */}
          <div className="p-4 border-t border-white/5 bg-black/10 flex flex-col gap-3">
            {session?.user && (
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs tracking-wider uppercase border border-emerald-500/30 shrink-0">
                  {session.user.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-white leading-tight">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-white/40 truncate mt-0.5 leading-none">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
            <SignOutButton text={t.signOut} />
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <label
        htmlFor="mobile-menu-toggle"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 hidden peer-checked:block md:hidden"
      />

      {/* Main Content Area */}
      <main className="bg-[#FAF9F5] dark:bg-[#070908] flex-1 overflow-y-auto p-6 md:p-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );

}
