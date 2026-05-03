"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SidebarLink({ href, icon, name, className }) {
  const handleClick = () => {
    // Find the hidden checkbox that controls the mobile sidebar
    const toggle = document.getElementById("mobile-menu-toggle");

    // If the menu is open (checkbox checked), uncheck it to trigger the closing transition
    if (toggle && toggle.checked) {
      toggle.checked = false;
    }
  };

  return (
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link href={href} onClick={handleClick} className={className}>
        <span>{icon}</span>
        <span className="font-medium">{name}</span>
      </Link>
    </motion.div>
  );
}
