"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClient } from "@/app/actions/clients";
import { motion } from "framer-motion";
import { getTranslations } from "@/lib/translations";

export default function EditClientForm({ client, lang = "en" }) {
  const router = useRouter();
  const t = getTranslations(lang);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateClient(client.id, formData);

    if (res.success) {
      router.push("/dashboard/clients");
    } else {
      alert(res.error || (lang === "bn" ? "গ্রাহক তথ্য আপডেট করতে ব্যর্থ হয়েছে" : "Failed to update client"));
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2 ml-1";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-white/5 p-6 sm:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300 animate-none"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>{t.clientName}</label>
          <input
            required
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>{t.companyOptional}</label>
          <input
            className={inputClass}
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
          />
        </div>
        <div>
          <label className={labelClass}>{t.emailAddress}</label>
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
          <label className={labelClass}>{t.phoneNumber}</label>
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

      <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
        <div>
          <label className={labelClass}>{t.addressOptional}</label>
          <input
            className={inputClass}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div>
          <label className={labelClass}>{t.notesOptional}</label>
          <textarea
            className={`${inputClass} resize-none h-28`}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>{t.cityStateOptional}</label>
            <input
              className={inputClass}
              value={formData.city_state}
              onChange={(e) =>
                setFormData({ ...formData, city_state: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>{t.zipCodeOptional}</label>
            <input
              className={inputClass}
              value={formData.zip_code}
              onChange={(e) =>
                setFormData({ ...formData, zip_code: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>{t.countryOptional}</label>
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

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="cursor-pointer bg-[#082019] hover:bg-[#0c3127] dark:bg-white dark:text-[#082019] dark:hover:bg-neutral-100 text-white px-10 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all w-full sm:w-auto disabled:opacity-50 shadow-md active:scale-95 duration-150 text-center"
        >
          {loading ? t.updatingClientBtn : t.saveChanges}
        </motion.button>
        <button
          type="button"
          onClick={() => router.back()}
          className="select-none cursor-pointer text-[#082019] dark:text-white px-10 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center w-full sm:w-auto"
        >
          {t.cancel}
        </button>
      </div>
    </motion.form>
  );
}
