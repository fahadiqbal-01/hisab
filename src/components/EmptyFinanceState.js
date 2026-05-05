"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmptyFinanceState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full min-h-125 flex flex-col items-center justify-center rounded-[40px] bg-[#fcfaf0] dark:bg-white/5 p-10 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 bg-[#071f18] dark:bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-black/10 "
      >
        <Plus className="text-white dark:text-[#071f18] w-12 h-12" />
      </motion.div>

      <h2 className="text-4xl font-serif italic text-[#071f18] dark:text-white mb-4 tracking-tight">
        A new chapter in finance
      </h2>

      <p className="max-w-md text-sm text-black/40 dark:text-white/40 leading-relaxed mb-12">
        Your real-time performance metrics for
        <span className="italic">Sebastin Garden</span> will illuminate this
        space once your first client is added.
      </p>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href="/dashboard/clients"
          className="bg-[#071f18] dark:bg-white text-white dark:text-[#071f18] px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-90 transition-all shadow-xl active:scale-95"
        >
          Add your first client
        </Link>
      </motion.div>
    </motion.div>
  );
}
