"use client";
import { useState, useEffect } from "react";
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
    company: client.company || "",
    address: client.address || "",
    city_state: client.city_state || "",
    zip_code: client.zip_code || "",
    country: client.country || "Bangladesh",
    notes: client.notes || "",
  });

  useEffect(() => {
    router.prefetch("/dashboard/clients");
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateClient(client.id, formData);

    if (res.success) {
      router.push("/dashboard/clients");
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-4 rounded-2xl text-black/70 dark:text-white/70 border border-black/5 bg-[#fdfaf1] dark:bg-white/20 focus:outline-none focus:ring-1 focus:ring-[#071f18] transition-all text-[#071f18] font-medium";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 dark:text-white/50 mb-2 block ml-1";

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
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
          <label className={labelClass}>Company (Optional)</label>
          <input
            className={inputClass}
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
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
        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            required
            className={inputClass}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>

      <div className="pt-6 border-t border-black/5 space-y-8">
        <div>
          <label className={labelClass}>Address (Optional)</label>
          <input
            className={inputClass}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Internal Notes (Optional)</label>
          <textarea
            className={`${inputClass} resize-none h-32`}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className={labelClass}>City / State</label>
            <input
              className={inputClass}
              value={formData.city_state}
              onChange={(e) =>
                setFormData({ ...formData, city_state: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Zip Code</label>
            <input
              className={inputClass}
              value={formData.zip_code}
              onChange={(e) =>
                setFormData({ ...formData, zip_code: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input
              required
              className={inputClass}
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
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
          className="cursor-pointer bg-[#071f18] dark:bg-white text-white dark:text-black w-full sm:w-auto px-10 py-4 rounded-full font-bold dark:hover:bg-orange-700 dark:hover:text-white hover:bg-green-900 transition-all disabled:opacity-50 shadow-lg shadow-[#071f18]/10"
        >
          {loading ? "Updating..." : "Save Changes"}
        </motion.button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-bold uppercase tracking-widest text-black/30 dark:text-white hover:text-red-800 transition-colors w-full sm:w-auto cursor-pointer "
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
