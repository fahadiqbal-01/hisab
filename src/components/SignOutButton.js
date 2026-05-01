"use client";
import { signOut } from "next-auth/react";
import { BiLogOutCircle } from "react-icons/bi";

export default function SignOutButton() {
  const handleSignOut = () => {
    // Close the mobile sidebar if it's open
    const toggle = document.getElementById("mobile-menu-toggle");
    if (toggle) toggle.checked = false;

    signOut({ callbackUrl: "/sign-up" });
  };

  return (
    <button
      onClick={handleSignOut}
      className=" select-none cursor-pointer flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-white/50 hover:bg-red-500/10 hover:text-red-400 font-medium group"
    >
      <span className="group-hover:scale-110 transition-transform">
        <BiLogOutCircle size={20} />
      </span>
      <span>SignOut</span>
    </button>
  );
}
