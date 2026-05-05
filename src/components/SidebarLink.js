"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SidebarLink({ href, icon, name, className }) {
  const handleClick = () => {
    const toggle = document.getElementById("mobile-menu-toggle");

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
      <Link
        href={href}
        onClick={handleClick}
        className={className}
        prefetch={true}
      >
        <span>{icon}</span>
        <span className="font-medium">{name}</span>
      </Link>
    </motion.div>
  );
}
