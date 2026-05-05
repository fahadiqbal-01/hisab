"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClient } from "@/app/actions/clients";
import { motion } from "framer-motion";

export default function EditClientForm({ client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name || "",
    email: client.email || "",
    phone: client.phone || "",
    preferred_payment_method: client.preferred_payment_method || "bKash",
    payment_number: client.payment_number || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateClient(client.id, formData);

    if (res.success) {
      router.push("/dashboard/clients");
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const inputClass =
    "w-full p-4 rounded-2xl text-black/70 dark:text-white/70 border border-black/5 bg-[#fdfaf1] dark:bg-white/20 focus:outline-none focus:ring-1 focus:ring-[#071f18] transition-all text-[#071f18] font-medium";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 dark:text-white/50 mb-2 block ml-1";

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8 bg-white dark:bg-[#0d0d0d] p-6 sm:p-10 rounded-4xl sm:rounded-[2.5rem] border border-black/5 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>Client Name</label>
          <input
            required
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            required
            className={inputClass}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Phone Number (for WhatsApp)</label>
        <input
          required
          className={inputClass}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="pt-6 border-t border-black/5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#071f18] dark:text-white mb-6">
          Payment Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Preferred Method</label>
            <select
              className={inputClass}
              value={formData.preferred_payment_method}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferred_payment_method: e.target.value,
                })
              }
            >
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Account / Wallet Number</label>
            <input
              className={inputClass}
              value={formData.payment_number}
              onChange={(e) =>
                setFormData({ ...formData, payment_number: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="cursor-pointer bg-[#071f18] dark:bg-black text-white w-full sm:w-auto px-10 py-4 rounded-full font-bold dark:hover:bg-blue-800 hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-[#071f18]/10"
        >
          {loading ? "Updating..." : "Save Changes"}
        </motion.button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-bold uppercase tracking-widest text-black/30 dark:text-white dark:hover:text-red-800 hover:text-black transition-colors w-full sm:w-auto cursor-pointer "
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
