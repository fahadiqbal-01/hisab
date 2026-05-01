"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchClients } from "@/app/actions/clients";
import { getProfile } from "@/app/actions/profiles";

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  // Fetch clients for the dropdown
  useEffect(() => {
    async function loadInitialData() {
      if (session?.user?.id) {
        const [clientsData, profileResult] = await Promise.all([
          fetchClients(),
          getProfile(),
        ]);
        setClients(clientsData);
        if (profileResult.data) setProfile(profileResult.data);
      }
    }
    loadInitialData();
  }, [session]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const total = calculateTotal();

    // Call an API route or handle logic to save the invoice and line items
    // For now, we will hit a dedicated route to handle the complex insert
    // Inside handleSubmit...
    // Change this line in your handleSubmit function
    const res = await fetch("/dashboard/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: selectedClientId,
        items,
        total,
        sender_name: profile?.studio_name || session?.user?.name,
        sender_email: profile?.contact_email || session?.user?.email,
        payment_method: profile?.payment_method,
        payment_number: profile?.payment_number,
        currency: profile?.currency || "৳",
      }),
    });

    if (res.ok) {
      router.push("/dashboard/invoices");
    } else {
      setLoading(false);
      alert("Failed to create invoice");
    }
  };

  return (
    <div className="max-w-4xl">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-[#071f18]">Create Invoice</h2>
        <p className="text-black/50 mt-1">
          Generate a professional invoice for your client.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-semibold text-black/60 mb-2">
              Select Client
            </label>
            <select
              required
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none focus:ring-2 ring-[#071f18]/10"
            >
              <option value="">Choose a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-black/60">
              Services / Items
            </label>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 items-start md:items-end border-b border-black/5 pb-4 md:border-0 md:pb-0"
              >
                <div className="flex-1">
                  <input
                    placeholder="Description (e.g. Web Development)"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none"
                    required
                  />
                </div>
                <div className="w-full md:w-24">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none"
                    required
                  />
                </div>
                <div className="w-full md:w-32">
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    className="w-full p-3 bg-[#fdfaf1] rounded-xl outline-none"
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-bold text-[#071f18] hover:underline"
            >
              + Add another item
            </button>
          </div>
        </div>

        {/* Total & Summary */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#071f18] text-white p-8 rounded-2xl gap-8">
          <div>
            <p className="text-white/50 text-sm uppercase tracking-widest font-bold">
              Total Amount
            </p>
            <h3 className="text-4xl font-bold mt-1">
              ৳ {calculateTotal().toLocaleString()}
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-white text-[#071f18] px-12 py-4 rounded-full font-bold hover:bg-[#fdfaf1] transition-all disabled:opacity-50"
            >
              {loading ? "Generating..." : "Save Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
