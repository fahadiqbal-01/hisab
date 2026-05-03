"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchClients } from "@/app/actions/clients";
import { getProfile } from "@/app/actions/profiles";

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // State Management
  const [clients, setClients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientName, setSelectedClientName] =
    useState("Choose a client...");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [items, setItems] = useState([
    { description: "", quantity: 1, price: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch Data
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClientSelect = (id, name) => {
    setSelectedClientId(id);
    setSelectedClientName(name);
    setIsDropdownOpen(false);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.price || 0),
      0,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert("Please select a client");
      return;
    }
    setLoading(true);

    const res = await fetch("/dashboard/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClientId,
        items,
        total: calculateTotal(),
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
    <div className="max-w-4xl px-4 md:px-0 pb-10">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-[#071f18] dark:text-white ">Create Invoice</h2>
        <p className="text-black/50 mt-1">
          Generate a professional invoice for your client.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-[#0d0d0d] p-6 md:p-8 rounded-2xl shadow-sm border border-black/5 space-y-6">
          {/* Custom Client Selection Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-black/60 dark:text-white mb-2">
              Select Client
            </label>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex justify-between items-center px-5 py-3 bg-[#fdfaf1] dark:bg-white/20 rounded-xl border border-black/5 cursor-pointer outline-none focus:ring-2 ring-[#071f18]/10 transition-all"
            >
              <span
                className={
                  selectedClientId
                    ? "text-[#071f18] dark:text-white font-medium"
                    : "text-black/33 dark:text-white/50 "
                }
              >
                {selectedClientName}
              </span>
              <svg
                className={`transition-transform duration-200 text-[#071f18] dark:text-white opacity-40 ${isDropdownOpen ? "rotate-180" : ""}`}
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

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden animate-in fade-in zoom-in duration-200">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleClientSelect(c.id, c.name)}
                    className={`px-5 py-3 cursor-pointer transition-colors ${
                      selectedClientId === c.id
                        ? "bg-[#061e18] text-white"
                        : "text-[#071f18] "
                    }`}
                  >
                    {c.name}
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="px-5 py-3 text-black/30 dark:text-white italic">
                    No clients found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-black/6 dark:text-white ">
              Services / Items
            </label>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 items-start md:items-end border-b border-black/5 pb-4 md:border-0 md:pb-0"
              >
                <div className="flex-1 w-full">
                  <input
                    placeholder="Description (e.g. Web Development)"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="w-full p-3 bg-[#fdfaf1] dark:bg-white/20 text-black/60 dark:text-white dark:placeholder:text-white/50 rounded-xl outline-none"
                    required
                  />
                </div>
                <div className="w-full md:w-32">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    className="w-full p-3 bg-[#fdfaf1] dark:bg-white/20 text-black/60 dark:text-white/50 dark:placeholder:text-white/50 rounded-xl outline-none"
                    required
                  />
                </div>
                <div className="w-full md:w-40">
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    className="w-full p-3 bg-[#fdfaf1] dark:bg-white/20 text-black/60 dark:text-white dark:placeholder:text-white/50 rounded-xl outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-bold text-[#071f18] dark:text-white hover:underline"
            >
              + Add another item
            </button>
          </div>
        </div>

        {/* Total & Summary */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#071f18] dark:bg-[#0d0d0d] text-white p-8 rounded-2xl gap-8">
          <div className="text-center md:text-left">
            <p className="text-white/50 text-sm uppercase tracking-widest font-bold">
              Total Amount
            </p>
            <h3 className="text-4xl font-bold mt-1">
              ৳ {calculateTotal().toLocaleString()}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm font-bold uppercase tracking-widest text-white/50 dark:hover:text-red-700 hover:text-white transition-colors order-2 sm:order-1 select-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-white text-[#071f18] px-12 py-4 rounded-full font-bold hover:bg-[#fdfaf1] transition-all disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2 select-none cursor-pointer "
            >
              {loading ? "Generating..." : "Save Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
