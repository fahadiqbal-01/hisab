"use client";
import { useState } from "react";
import { deleteClient } from "@/app/actions/clients";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteClientButton({ id }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteClient(id);
    if (res.error) alert(res.error);
    setIsConfirming(false);
    setIsDeleting(false);
  };

  return (
    <>
      <button
        onClick={() => setIsConfirming(true)}
        className="text-black/20 dark:text-white/70 hover:text-red-500 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>

      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirming(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Popup Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-[#0d0d0d] p-8 rounded-[2.5rem] shadow-2xl border border-black/5 w-full max-w-[320px] text-center"
            >
              <h3 className="text-lg font-bold text-[#071f18] dark:text-white mb-2">
                Delete Client?
              </h3>
              <p className="text-sm text-black/40 dark:text-white/50 mb-8 leading-relaxed">
                This action will permanently remove the client and their
                details.
              </p>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Client"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsConfirming(false)}
                  className="bg-black/5 dark:bg-white/5 text-black/40 dark:text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
