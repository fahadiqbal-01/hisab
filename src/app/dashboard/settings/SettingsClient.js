"use client";
import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { updateProfile } from "@/app/actions/profiles";
import { deleteAccount } from "@/app/actions/account";
import AppearanceSettings from "@/components/AppearanceSettings";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTranslations } from "@/lib/translations";

export default function SettingsClient({ initialProfile, user, lang = "en" }) {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(lang);
  const t = getTranslations(currentLang);

  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const paymentDropdownRef = useRef(null);

  useEffect(() => {
    if (initialProfile && Object.keys(initialProfile).length > 0) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

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

  function handleLanguageChange(newLang) {
    setCurrentLang(newLang);
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateProfile(profile);
      if (res.success) {
        if (res.data) {
          setProfile(res.data);
        }
        toast.success(t.toastSuccess);
        router.refresh();
      } else {
        toast.error(`${t.toastError}${res.error}`);
      }
    } catch (err) {
      toast.error(t.toastUnexpectedError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      const res = await deleteAccount();
      if (res?.success) {
        await signOut({ callbackUrl: "/sign-up" });
        return;
      }
      toast.error(res?.error || "Failed to delete account.");
    } catch (err) {
      toast.error("An unexpected error occurred while deleting your account.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-3xl mx-auto min-h-[100dvh] pb-20 select-none animate-in fade-in duration-500">
        
        {/* Header */}
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-[#082019] dark:text-white">
            {t.settingsTitle}
          </h2>
          <p className="text-black/50 dark:text-white/40 mt-1 text-sm">
            {t.settingsSubtitle}
          </p>
        </header>

        <div className="space-y-6">
          
          {/* Section 1: Theme Settings */}
          <AppearanceSettings t={t} />

          {/* Section 2: Language Preference Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="select-none bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300"
          >
            <header className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                {t.languagePreference}
              </h3>
              <p className="text-sm text-black/50 dark:text-white/40 mt-1">
                {t.languageDesc}
              </p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "en", label: t.english },
                { id: "bn", label: t.bengali },
              ].map((option) => {
                const isActive = currentLang === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageChange(option.id)}
                    className={`select-none cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2.5 ${
                      isActive
                        ? "bg-[#082019] dark:bg-[#10b981]/10 border-[#082019] dark:border-[#10b981] text-white dark:text-[#10b981] shadow-md shadow-black/5"
                        : "bg-[#fcfaf0] dark:bg-white/5 border-black/5 dark:border-white/5 text-black/50 dark:text-white/40 hover:bg-black/5 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold tracking-wide uppercase">
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Section 3: Branding Settings */}
          <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-6">
              {t.brandingProfile}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Studio Name Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2 ml-1">
                  {t.studioName}
                </label>
                <input
                  type="text"
                  className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                  value={profile.studio_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, studio_name: e.target.value })
                  }
                />
              </div>
              
              {/* Professional Title Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2 ml-1">
                  {t.professionalTitle}
                </label>
                <input
                  type="text"
                  className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
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
          </div>

          {/* Section 4: Payment Settings */}
          <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-6">
              {t.paymentDefaults}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Payment Method Selector Dropdown */}
              <div className="relative" ref={paymentDropdownRef}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2 ml-1">
                  {t.preferredMethod}
                </label>
                <div
                  onClick={() =>
                    setIsPaymentDropdownOpen(!isPaymentDropdownOpen)
                  }
                  className="w-full flex justify-between items-center px-4 py-3 bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="font-semibold capitalize text-sm">
                    {profile.payment_method || t.chooseClient}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-black/40 dark:text-white/40 transition-transform duration-200 ${
                      isPaymentDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {isPaymentDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111614] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden"
                    >
                      {[
                        { id: "bkash", label: "bKash" },
                        { id: "nagad", label: "Nagad" },
                        { id: "bank", label: "Bank Transfer" },
                        { id: "paypal", label: "PayPal" },
                        { id: "wise", label: "Wise" },
                        { id: "rocket", label: "Rocket" },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() => {
                            setProfile({ ...profile, payment_method: method.id });
                            setIsPaymentDropdownOpen(false);
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                            profile.payment_method === method.id
                              ? "bg-[#082019] text-white dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold"
                              : "hover:bg-black/5 dark:hover:bg-white/5 text-black/80 dark:text-white/80"
                          }`}
                        >
                          {method.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Account Number Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2 ml-1">
                  {t.accountNumber}
                </label>
                <input
                  type="text"
                  className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                  value={profile.payment_number || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, payment_number: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 5: Danger Zone */}
          <div className="bg-red-500/5 dark:bg-red-500/2 p-6 md:p-8 rounded-[2rem] border border-red-500/10 dark:border-red-950/20 shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5" /> {t.dangerZone}
                </h3>
                <p className="text-sm text-black/50 dark:text-white/40 mt-1">
                  {t.dangerZoneDesc}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deletingAccount}
                className="w-full sm:w-auto bg-red-800 hover:bg-red-700 active:scale-95 duration-150 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs disabled:opacity-50 cursor-pointer shadow-md shrink-0"
              >
                {deletingAccount ? t.deletingBtn : t.deleteAccountBtn}
              </button>
            </div>
          </div>

          {/* Save Bar Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#082019]/90 dark:bg-white/5 backdrop-blur p-5 rounded-3xl border border-white/5 shadow-lg mt-8 gap-4 transition-colors duration-300">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest sm:pl-2">
              {saving ? t.savingChanges : t.settingsConfigured}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-white text-[#082019] hover:bg-neutral-100 active:scale-95 duration-150 px-10 py-3 rounded-full font-bold uppercase tracking-wider text-xs disabled:opacity-50 cursor-pointer shadow-md"
            >
              {t.saveDefaultsBtn}
            </button>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#111614] border border-black/5 dark:border-white/10 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-[#082019] dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-red-500 w-5 h-5" /> {t.deleteConfirmTitle}
              </h3>
              <p className="mt-2 text-sm text-black/50 dark:text-white/40 leading-relaxed">
                {t.deleteConfirmDesc}
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingAccount}
                  className="px-5 py-2 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="px-5 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 active:scale-95 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  {deletingAccount ? t.deletingBtn : t.yesDelete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
