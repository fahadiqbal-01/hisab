"use client";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DasboardLogo({ className }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logosrc =
    mounted && resolvedTheme === "dark"
      ? "/images/logo.png"
      : "/images/logosec.png";

  return (
    <Link href="/dashboard">
      <motion.img
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        src={logosrc}
        className={` w-15 md:w-30 ml-1 md:ml-2 cursor-pointer ${className} `}
      />
    </Link>
  );
}
