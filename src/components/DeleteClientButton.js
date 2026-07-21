"use client";
import { useState } from "react";
import { deleteClient } from "@/app/actions/clients";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function DeleteClientButton({ id }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteClient(id);
      if (res.error) alert(res.error);
      setIsConfirming(false);
    } finally {

      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirming(true)}
        className="p-2 bg-[#fcfaf0] dark:bg-white/5 text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-500 rounded-xl transition-all cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5"
      >
        <Trash2 className="w-4 h-4" />
      </button>


      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirming(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
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
