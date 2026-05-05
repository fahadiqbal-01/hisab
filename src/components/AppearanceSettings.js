"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="select-none bg-white dark:bg-[#0d0d0d] p-6 rounded-3xl border border-black/5 dark:border-white/5 transition-colors "
    >
      <header className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 dark:text-white/30">
          Appearance
        </h3>
        <p className="text-sm text-black/60 dark:text-white/60 mt-1">
          Customize how Hisab looks on your device.
        </p>
      </header>

      <div className="space-y-3">
        {[
          { id: "light", label: "Light Mode" },
          { id: "dark", label: "Dark Mode" },
          { id: "system", label: "System Default" },
        ].map((option) => (
          <motion.button
            key={option.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(option.id)}
            className={`select-none cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              theme === option.id
                ? "bg-[#071f18] dark:bg-blue-800 text-white"
                : "bg-[#fdfaf1] dark:bg-white/5 text-[#071f18] dark:text-white hover:bg-black/5"
            }`}
          >
            <span className="text-sm font-semibold">{option.label}</span>
            {theme === option.id && (
              <div className="w-2 h-2 rounded-full bg-green-400 dark:bg-blue-100 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
