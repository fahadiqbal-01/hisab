"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClient } from "@/app/actions/clients";

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
    "w-full p-4 rounded-2xl border border-black/5 bg-[#fdfaf1] focus:outline-none focus:ring-1 focus:ring-[#071f18] transition-all text-[#071f18] font-medium";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2 block ml-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-sm"
    >
      {/* Basic Information */}
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

      {/* Contact Details */}
      <div>
        <label className={labelClass}>Phone Number (for WhatsApp)</label>
        <input
          required
          className={inputClass}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      {/* Payment Information */}
      <div className="pt-6 border-t border-black/5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#071f18] mb-6">
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
              {/* The 'value' must match your Supabase ENUM exactly (usually lowercase) */}
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#071f18] text-white w-full sm:w-auto px-10 py-4 rounded-full font-bold hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-[#071f18]/10"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors w-full sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
