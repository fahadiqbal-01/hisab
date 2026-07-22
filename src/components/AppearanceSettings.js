"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

export default function AppearanceSettings({ t }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="select-none bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300"
    >
      <header className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          {t.appearance}
        </h3>
        <p className="text-sm text-black/50 dark:text-white/40 mt-1">
          {t.appearanceDesc}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {[
          { id: "light", label: t.light, icon: <Sun className="w-5 h-5" /> },
          { id: "dark", label: t.dark, icon: <Moon className="w-5 h-5" /> },
          { id: "system", label: t.system, icon: <Monitor className="w-5 h-5" /> },
        ].map((option) => {
          const isActive = theme === option.id;
          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(option.id)}
              className={`select-none cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2.5 ${
                isActive
                  ? "bg-[#082019] dark:bg-[#10b981]/10 border-[#082019] dark:border-[#10b981] text-white dark:text-[#10b981] shadow-md shadow-black/5"
                  : "bg-[#fcfaf0] dark:bg-white/5 border-black/5 dark:border-white/5 text-black/50 dark:text-white/40 hover:bg-black/5 hover:text-black dark:hover:text-white"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "bg-white/10 text-emerald-400 dark:text-[#10b981]"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40"
                }`}
              >
                {option.icon}
              </div>
              <span className="text-xs font-bold tracking-wide uppercase">
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
