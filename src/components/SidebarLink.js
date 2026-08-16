"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarLink({ href, icon, name }) {
  const pathname = usePathname();

  // Exact match for dashboard overview, prefix match for others
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  const handleClick = () => {
    const toggle = document.getElementById("mobile-menu-toggle");
    if (toggle && toggle.checked) {
      toggle.checked = false;
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`select-none flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 ${
        isActive
          ? "bg-white/10 text-white font-medium"
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
      prefetch={false}
    >
      <span
        className={`text-lg transition-colors duration-150 ${
          isActive ? "text-white" : "text-white/40"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-medium">{name}</span>
    </Link>
  );
}


