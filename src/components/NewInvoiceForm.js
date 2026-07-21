"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown } from "lucide-react";

export default function NewInvoiceForm({
  initialClients,
  initialProfile,
  user,
}) {
  const router = useRouter();

  const [clients] = useState(initialClients || []);
  const [profile] = useState(initialProfile || null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientName, setSelectedClientName] =
    useState("Choose a client...");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [items, setItems] = useState([
    { description: "", quantity: 1, unit_price: "" },
  ]);
  const [vat, setVat] = useState("");
  const [tax, setTax] = useState("");
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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
    setItems([...items, { description: "", quantity: 1, unit_price: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.unit_price || 0),
      0,
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vatAmount = (subtotal * (Number(vat) || 0)) / 100;
    const taxAmount = (subtotal * (Number(tax) || 0)) / 100;
    return subtotal + vatAmount + taxAmount;
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
        vat: Number(vat) || 0,
        tax: Number(tax) || 0,
        sender_name: profile?.studio_name || user?.name,
        sender_email: profile?.contact_email || user?.email,
        payment_method: profile?.payment_method,
        payment_number: profile?.payment_number,
        currency: profile?.currency || "৳",
        note_text: noteText,
      }),
    });

    if (res.ok) {
      router.refresh();
      router.push("/dashboard/invoices");
    } else {
      let message = "Failed to create invoice";
      try {
        const errorPayload = await res.json();
        if (errorPayload?.error) message = errorPayload.error;
      } catch {
        // Ignore JSON parsing errors and keep fallback message.
      }
      setLoading(false);
      alert(message);
    }
  };

  const labelClass =
    "block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1";
  const inputClass =
    "w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium";

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <header className="mb-8 md:mb-10 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <h2 className="text-3xl font-bold text-[#082019] dark:text-white">
          Create Invoice
        </h2>
        <p className="text-black/50 dark:text-white/40 mt-1.5 text-sm">
          Generate a professional invoice for your client.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm space-y-6 transition-colors duration-300">
          
          {/* Custom Client Selection Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className={labelClass}>
              Select Client
            </label>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex justify-between items-center px-4 py-3.5 bg-[#f6f4ed] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl cursor-pointer outline-none focus:ring-2 ring-emerald-500/20 transition-all text-sm"
            >
              <span
                className={
                  selectedClientId
                    ? "text-[#082019] dark:text-white font-semibold"
                    : "text-black/30 dark:text-white/30 font-medium"
                }
              >
                {selectedClientName}
              </span>
              <ChevronDown
                className={`transition-transform duration-200 text-black/40 dark:text-white/40 w-4 h-4 shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#141414] rounded-2xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleClientSelect(c.id, c.name)}
                    className={`px-5 py-3.5 cursor-pointer text-sm font-semibold transition-colors flex items-center justify-between ${
                      selectedClientId === c.id
                        ? "bg-[#082019] text-white"
                        : "text-[#082019] dark:text-white hover:bg-[#f6f4ed] dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedClientId === c.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="px-5 py-4 text-xs text-black/40 dark:text-white/40 italic text-center">
                    No clients found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <label className={labelClass}>
              Services / Items
            </label>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 items-start md:items-end border-b border-black/5 dark:border-white/5 pb-4 md:border-0 md:pb-0"
                >
                  <div className="flex-1 w-full">
                    <input
                      placeholder="Description (e.g. Web Development)"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <input
                      type="number"
                      step="any"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <input
                      type="number"
                      step="any"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(index, "unit_price", e.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-3 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer self-center"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 mt-2 transition-colors cursor-pointer select-none"
            >
              <Plus className="w-3.5 h-3.5" /> Add another item
            </button>
          </div>

          {/* Optional VAT and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-black/5 dark:border-white/5">
            <div>
              <label className={labelClass}>
                VAT (%) <span className="text-[9px] font-normal opacity-50 lowercase italic">(optional)</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Tax (%) <span className="text-[9px] font-normal opacity-50 lowercase italic">(optional)</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Note Field */}
          <div className="pt-6 border-t border-black/5 dark:border-white/5">
            <label className={labelClass}>
              Invoice Note <span className="text-[9px] font-normal opacity-50 lowercase italic">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Please process the payment using the method mentioned above."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className={`${inputClass} resize-none h-24`}
            />
          </div>
        </div>

        {/* Total & Summary */}
        <div className="bg-[#082019] dark:bg-white/5 text-white p-8 rounded-[2rem] border border-[#082019] dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm transition-colors duration-300">
          <div className="text-center md:text-left space-y-2">
            {(Number(vat) > 0 || Number(tax) > 0) && (
              <div className="flex flex-col gap-1 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex justify-between md:justify-start md:gap-4">
                  <span>Subtotal:</span>
                  <span className="text-white">৳ {calculateSubtotal().toLocaleString()}</span>
                </div>
                {Number(vat) > 0 && (
                  <div className="flex justify-between md:justify-start md:gap-4 text-emerald-400">
                    <span>VAT ({vat}%):</span>
                    <span>
                      + ৳{" "}
                      {(
                        (calculateSubtotal() * Number(vat)) /
                        100
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                {Number(tax) > 0 && (
                  <div className="flex justify-between md:justify-start md:gap-4 text-emerald-400">
                    <span>Tax ({tax}%):</span>
                    <span>
                      + ৳{" "}
                      {(
                        (calculateSubtotal() * Number(tax)) /
                        100
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="text-white/50 text-sm uppercase tracking-widest font-bold">
                Total Amount
              </p>
              <h3 className="text-4xl font-bold mt-1">
                ৳ {calculateTotal().toLocaleString()}
              </h3>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-white/50 hover:text-white dark:hover:text-red-400 transition-colors order-2 sm:order-1 font-bold uppercase tracking-wider text-xs cursor-pointer select-none"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              aria-disabled={loading}
              className="bg-white hover:bg-neutral-100 text-[#082019] dark:bg-white dark:text-[#082019] dark:hover:bg-neutral-100 px-10 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2 select-none cursor-pointer shadow-md active:scale-95 duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                      strokeLinecap="round"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                "Save Invoice"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
