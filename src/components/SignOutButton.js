"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { BiLogOutCircle } from "react-icons/bi";
import { motion } from "framer-motion";

export default function SignOutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    setIsLoggingOut(true);
    const toggle = document.getElementById("mobile-menu-toggle");
    if (toggle) toggle.checked = false;

    signOut({ callbackUrl: "/sign-up" });
  };

  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleSignOut}
      disabled={isLoggingOut}
      className=" select-none cursor-pointer flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-white/50 hover:bg-red-500/10 hover:text-red-400 font-medium group disabled:opacity-50"
    >
      {isLoggingOut ? "Signing Out" : "Sign Out"}
    </motion.button>
  );
}
