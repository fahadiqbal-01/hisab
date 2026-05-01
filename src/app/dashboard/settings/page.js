"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { getProfile, updateProfile } from "@/app/actions/profiles";

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
        Initializing Lynx Settings...
      </div>
    );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-4xl pb-20">
        <header className="mb-12">
          <h2 className="text-3xl font-bold text-[#071f18]">Settings</h2>
          <p className="text-black/50 mt-1">
            Configure your professional identity and defaults.
          </p>
        </header>

        <div className="space-y-12">
          {/* Section 1: Business Branding */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30">
                Branding
              </h3>
              <p className="text-xs text-black/40 mt-2">
                How you appear on generated invoices.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-white p-8 rounded-3xl border border-black/5">
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 block mb-2">
                  Studio / Agency Name
                </label>
                <input
                  className="w-full bg-[#f9fafb] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none transition-all"
                  value={profile.studio_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, studio_name: e.target.value })
                  }
                  placeholder="e.g. Lazy Studio"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-black/30 block mb-2">
                  Professional Title
                </label>
                <input
                  className="w-full bg-[#f9fafb] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none transition-all"
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
          </section>

          <hr className="border-black/5" />

          {/* Section 2: Payment Defaults */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30">
                Payment
              </h3>
              <p className="text-xs text-black/40 mt-2">
                Select your default gateway and account details.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-black/5">
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-black/30 block mb-2">
                  Preferred Method
                </label>
                <select
                  className="w-full bg-[#f9fafb] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none appearance-none cursor-pointer"
                  value={profile.payment_method || "BKASH"}
                  onChange={(e) =>
                    setProfile({ ...profile, payment_method: e.target.value })
                  }
                >
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-black/30 block mb-2">
                  Account / Phone Number
                </label>
                <input
                  className="w-full bg-[#f9fafb] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#071f18] outline-none"
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
          </section>

          {/* Footer Save Bar */}
          <footer className="flex flex-col sm:flex-row justify-between items-center bg-[#071f18] p-6 rounded-3xl shadow-xl mt-20 gap-4">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest sm:pl-4">
              {saving ? "Updating system..." : "Unsaved changes"}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-[#071f18] w-full sm:w-auto px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#e2e2e2] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
