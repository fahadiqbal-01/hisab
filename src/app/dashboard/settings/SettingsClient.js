"use client";
import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { updateProfile } from "@/app/actions/profiles";
import AppearanceSettings from "@/components/AppearanceSettings";
import { motion } from "framer-motion";

export default function SettingsClient({ initialProfile, user }) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const paymentDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        paymentDropdownRef.current &&
        !paymentDropdownRef.current.contains(event.target)
      ) {
        setIsPaymentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateProfile(profile);
      if (res.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(`Save failed: ${res.error}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl pb-20 select-none"
      >
        <header className="mb-12">
          <p className="text-[28px] uppercase tracking-[0.2em] text-black dark:text-orange-700 font-bold my-5 ">
            {user?.name || "Studio"}
          </p>
          <h2 className="text-3xl font-bold text-[#071f18] dark:text-white">
            Settings
          </h2>
          <p className="text-black/50 dark:text-white/50 mt-1">
            Configure your professional identity and defaults.
          </p>
        </header>

        <div className="mb-8 w-full md:w-[65%] ml-auto  ">
          <AppearanceSettings />
        </div>

        <div className="space-y-12">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 dark:text-white">
                Branding
              </h3>
              <p className="text-xs text-black/40 mt-2 dark:text-white/50">
                How you appear on invoices.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5">
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 dark:text-white block mb-2">
                  Studio Name
                </label>
                <input
                  className="w-full bg-[#fcfaf0] dark:bg-white/30 text-black dark:text-white/70 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none"
                  value={profile.studio_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, studio_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 dark:text-white block mb-2">
                  Title
                </label>
                <input
                  className="w-full bg-[#fcfaf0] dark:bg-white/30 text-black dark:text-white/70 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none"
                  value={profile.professional_title || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      professional_title: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </section>

          <hr className="border-black/5" />

          <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 dark:text-white">
                Payment
              </h3>
              <p className="text-xs text-black/40 dark:text-white/50 mt-2">
                Set your default account details.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5">
              <div className="relative" ref={paymentDropdownRef}>
                <label className="text-[10px] font-bold uppercase text-black/30 dark:text-white block mb-2 ml-1">
                  Method
                </label>
                <div
                  onClick={() =>
                    setIsPaymentDropdownOpen(!isPaymentDropdownOpen)
                  }
                  className="w-full flex justify-between items-center px-5 py-3 bg-[#fcfaf0] dark:bg-white/30 rounded-xl border border-black/5 cursor-pointer"
                >
                  <span className="text-black dark:text-white/70 font-medium">
                    {profile.payment_method || "Select..."}
                  </span>
                  <svg
                    className={`transition-transform duration-200 ${isPaymentDropdownOpen ? "rotate-180" : ""}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>

                {isPaymentDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-[#fcfaf0] dark:bg-white/20 dark:text-white rounded-xl shadow-xl border border-black/5 overflow-hidden">
                    {[
                      { id: "BKASH", label: "bKash" },
                      { id: "NAGAD", label: "Nagad" },
                      { id: "BANK", label: "Bank Transfer" },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => {
                          setProfile({ ...profile, payment_method: method.id });
                          setIsPaymentDropdownOpen(false);
                        }}
                        className={`px-5 py-3 cursor-pointer ${profile.payment_method === method.id ? "bg-[#061e18] dark:bg-orange-700 text-white dark:text-white" : "hover:bg-white/20 "}`}
                      >
                        {method.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 block mb-2">
                  Account Number
                </label>
                <input
                  className="w-full bg-[#fcfaf0] dark:bg-white/30 text-black dark:text-white/70 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none"
                  value={profile.payment_number || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, payment_number: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <motion.footer
            layout
            className="flex flex-col sm:flex-row justify-between items-center bg-[#071f18] dark:bg-[#0d0d0d] p-6 rounded-3xl shadow-xl mt-20 gap-4"
          >
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest sm:pl-4">
              {saving ? "Updating..." : "Ready to save"}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-[#071f18] w-full sm:w-auto px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#e2e2e2] disabled:opacity-50"
            >
              Save
            </motion.button>
          </motion.footer>
        </div>
      </motion.div>
    </>
  );
}
