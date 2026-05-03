"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { getProfile, updateProfile } from "@/app/actions/profiles";
import AppearanceSettings from "@/components/AppearanceSettings";
import { motion } from "framer-motion";

export default function SettingsPageClient() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    studio_name: "",
    professional_title: "",
    contact_email: "",
    payment_method: "BKASH",
    payment_number: "",
    currency: "৳",
  });

  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const paymentDropdownRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (userId) {
        await fetchProfile();
      } else if (status !== "loading") {
        setLoading(false);
      }
    };
    init();
  }, [userId, status]);

  // Close payment dropdown when clicking outside
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

  async function fetchProfile() {
    const { data, error } = await getProfile();
    if (error) {
      console.error("Fetch error:", error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    if (!userId) {
      toast.error("Session missing. Please refresh the page.");
      setSaving(false);
      return;
    }

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

  if (loading)
    return (
      <div className="p-10 text-[#071f18]/20 uppercase font-bold tracking-[0.3em] text-xs animate-pulse">
        Initializing Settings...
      </div>
    );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl pb-20 select-none "
      >
        <header className="mb-12">
          <h2 className="text-3xl font-bold text-[#071f18] dark:text-white ">
            Settings
          </h2>
          <p className="text-black/50 dark:text-white/50 mt-1">
            Configure your professional identity and defaults.
          </p>
        </header>

        <div className=" mb-8 w-full md:w-[65%] ml-0 md:ml-auto md:mx-0 mx-auto ">
          <AppearanceSettings />
        </div>

        <div className="space-y-12">
          {/* Section 1: Business Branding */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 dark:text-white">
                Branding
              </h3>
              <p className="text-xs text-black/40 mt-2 dark:text-white/50">
                How you appear on generated invoices.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5">
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 dark:text-white block mb-2 ">
                  Studio / Agency Name
                </label>
                <input
                  className="w-full bg-[#fcfaf0] dark:bg-white/30 text-black dark:text-white/70 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none transition-all"
                  value={profile.studio_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, studio_name: e.target.value })
                  }
                  placeholder="e.g. Lazy Studio"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 dark:text-white block mb-2">
                  Professional Title
                </label>
                <input
                  className="w-full bg-[#fcfaf0] dark:bg-white/30 text-black dark:text-white/70 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none transition-all"
                  value={profile.professional_title || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      professional_title: e.target.value,
                    })
                  }
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
            </div>
          </motion.section>

          <hr className="border-black/5" />

          {/* Section 2: Payment Defaults */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 dark:text-white ">
                Payment
              </h3>
              <p className="text-xs text-black/40 dark:text-white/50 mt-2">
                Select your default gateway and account details.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5">
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-black/30 dark:text-white block mb-2 ml-1">
                  Preferred Method
                </label>
                <div className="relative" ref={paymentDropdownRef}>
                  <div
                    onClick={() =>
                      setIsPaymentDropdownOpen(!isPaymentDropdownOpen)
                    }
                    className="w-full flex justify-between items-center px-5 py-3 bg-[#fcfaf0] dark:bg-white/30 rounded-xl border border-black/5 cursor-pointer outline-none focus:ring-2 ring-[#071f18]/10 transition-all"
                  >
                    <span
                      className={
                        profile.payment_method
                          ? "text-black dark:text-white/70 font-medium"
                          : "text-black/33 dark:text-white/50"
                      }
                    >
                      {profile.payment_method || "Choose a method..."}
                    </span>
                    <svg
                      className={`transition-transform duration-200 text-black dark:text-white opacity-40 ${isPaymentDropdownOpen ? "rotate-180" : ""}`}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>

                  {isPaymentDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 w-full mt-2 bg-[#fcfaf0] dark:bg-[#0d0d0d] rounded-xl shadow-xl border border-black/5 overflow-hidden"
                    >
                      {[
                        { id: "BKASH", label: "bKash" },
                        { id: "NAGAD", label: "Nagad" },
                        { id: "PAYPAL", label: "PayPal" },
                        { id: "CARD", label: "Credit/Debit Card" },
                        { id: "BANK", label: "Bank Transfer" },
                      ].map((method) => (
                        <motion.div
                          key={method.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setProfile({
                              ...profile,
                              payment_method: method.id,
                            });
                            setIsPaymentDropdownOpen(false);
                          }}
                          className={`px-5 py-3 cursor-pointer transition-colors ${
                            profile.payment_method === method.id
                              ? "bg-[#061e18] dark:bg-orange-700 text-white"
                              : "text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          {method.label}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-black/30 block mb-2">
                  Account / Phone Number
                </label>
                <input
                  className="w-full bg-[#fcfaf0] dark:bg-white/30 text-black dark:text-white/70 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none"
                  value={profile.payment_number || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, payment_number: e.target.value })
                  }
                  placeholder={
                    profile.payment_method === "BANK"
                      ? "Account details..."
                      : "Wallet number..."
                  }
                />
              </div>
            </div>
          </motion.section>

          {/* Footer Save Bar */}
          <motion.footer
            layout
            className="flex flex-col sm:flex-row justify-between items-center bg-[#071f18] dark:bg-[#0d0d0d] p-6 rounded-3xl shadow-xl mt-20 gap-4"
          >
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest sm:pl-4">
              {saving ? "Updating system..." : "Unsaved changes"}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="select-none cursor-pointer bg-white text-[#071f18] w-full sm:w-auto px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#e2e2e2] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </motion.button>
          </motion.footer>
        </div>
      </motion.div>
    </>
  );
}
