"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { BiLogOutCircle } from "react-icons/bi";

export default function SignOutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    setIsLoggingOut(true);
    const toggle = document.getElementById("mobile-menu-toggle");
    if (toggle) toggle.checked = false;

    signOut({ callbackUrl: "/sign-up" });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoggingOut}
      className="select-none cursor-pointer flex items-center gap-3 px-4 py-2.5 w-full rounded-xl transition-all duration-150 text-white/50 hover:bg-red-500/10 hover:text-red-400 font-medium group disabled:opacity-50"
    >
      <BiLogOutCircle className="text-lg transition-colors group-hover:text-red-400" />
      <span className="text-sm">{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
    </button>
  );
}

