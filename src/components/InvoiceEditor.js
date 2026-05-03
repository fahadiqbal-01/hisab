"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PrintButton from "./PrintButton";
import { updateInvoice } from "@/app/actions/invoices";

export default function InvoiceEditor({ initialInvoice, user }) {
  const router = useRouter();

  if (!initialInvoice) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState({
    id: initialInvoice.id || "new-invoice",
    ...initialInvoice,
    sender_name: initialInvoice.sender_name || user?.name || "",
    sender_email: initialInvoice.sender_email || user?.email || "",
    invoice_items: initialInvoice.invoice_items || [],
  });

  const calculateTotal = () => {
    return invoice.invoice_items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0,
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateInvoice({
        id: invoice.id,
        sender_name: invoice.sender_name,
        sender_email: invoice.sender_email,
        total: calculateTotal(),
        invoice_items: invoice.invoice_items,
      });
      if (result.error) throw new Error(result.error);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoice.invoice_items];
    newItems[index][field] = value;
    setInvoice({ ...invoice, invoice_items: newItems });
  };

  const addNewRow = () => {
    setInvoice({
      ...invoice,
      invoice_items: [
        ...invoice.invoice_items,
        {
          description: "New Service",
          quantity: 1,
          unit_price: 0,
          id: crypto.randomUUID(),
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = invoice.invoice_items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, invoice_items: newItems });
  };

  const inputClasses =
    "bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors text-[#071f18]";

  return (
    <div className="min-h-screen pb-20">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8 px-6 print:hidden">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 dark:text-white ">
            {isEditing ? "Editing Mode" : "Invoice Preview"}
          </h2>
          <p className="text-[10px] text-black/20 dark:text-white/70 font-mono mt-1">
            ID: {invoice.id}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="select-none cursor-pointer text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-red-700 "
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#071f18] text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="select-none cursor-pointer text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white dark:hover:text-orange-700 hover:text-[#071f18]"
              >
                Edit Invoice
              </button>
              <PrintButton
                invoiceId={invoice.id}
                initialStatus={invoice.status}
              />
            </>
          )}
        </div>
      </div>

      {/* Scroll Wrapper */}
      <div className="w-full overflow-x-auto pb-10 cursor-grab active:cursor-grabbing px-4 sm:px-6">
        <div
          id="invoice-capture-area"
          className={`w-[210mm] min-h-[297mm] mx-auto bg-white p-[20mm] shadow-2xl transition-all relative ${
            isEditing
              ? "ring-2 ring-blue-400"
              : "print:shadow-none print:m-0 print:p-0"
          }`}
        >
          {/* Header */}
          <header className="flex justify-between items-start mb-24">
            <div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    className={`${inputClasses} text-5xl font-serif italic w-full`}
                    value={invoice.sender_name}
                    onChange={(e) =>
                      setInvoice({ ...invoice, sender_name: e.target.value })
                    }
                  />
                  <input
                    className={`${inputClasses} text-sm text-black/40 w-full`}
                    value={invoice.sender_email}
                    onChange={(e) =>
                      setInvoice({ ...invoice, sender_email: e.target.value })
                    }
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-5xl font-serif italic text-[#071f18] leading-tight">
                    {invoice.sender_name}
                  </h1>
                  <p className="text-sm text-black/40 mt-3">
                    {invoice.sender_email}
                  </p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tracking-widest uppercase">
                {invoice.invoice_number_full || `INV-${invoice.id.slice(0, 5)}`}
              </p>
              <p className="text-sm text-black/40 mt-1">
                {new Date(invoice.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          </header>

          {/* Info Section */}
          <section className="grid grid-cols-2 gap-20 mb-24">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-4">
                Billed To
              </h3>
              <p className="font-bold text-xl text-[#071f18]">
                {invoice.clients?.name}
              </p>
              <p className="text-sm text-black/50 mt-1">
                {invoice.clients?.email}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-4">
                Payment Method
              </h3>
              <p className="text-sm font-bold uppercase">
                {invoice.payment_method ||
                  invoice.clients?.preferred_payment_method ||
                  "BKASH"}
              </p>
              <p className="text-sm text-black/50 mt-1">
                {invoice.payment_number || invoice.clients?.payment_number}
              </p>
            </div>
          </section>

          {/* Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest text-black/30">
                  Description
                </th>
                <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest text-black/30">
                  Qty
                </th>
                <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest text-black/30">
                  Unit Price
                </th>
                <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest text-black/30">
                  Total
                </th>
                {isEditing && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {invoice.invoice_items?.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-6 pr-4">
                    {isEditing ? (
                      <input
                        className={`${inputClasses} w-full text-sm font-medium`}
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                      />
                    ) : (
                      <span className="text-sm text-[#071f18]">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="py-6 text-right w-16">
                    {isEditing ? (
                      <input
                        type="number"
                        className={`${inputClasses} w-full text-right text-sm`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm text-black/50">
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="py-6 text-right w-32">
                    {isEditing ? (
                      <input
                        type="number"
                        className={`${inputClasses} w-full text-right text-sm`}
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "unit_price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    ) : (
                      <span className="text-sm text-[#071f18]">
                        {invoice.currency || "৳"}{" "}
                        {item.unit_price?.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-6 text-right text-sm font-bold text-[#071f18] w-32">
                    {invoice.currency || "৳"}{" "}
                    {(item.quantity * (item.unit_price || 0)).toLocaleString()}
                  </td>
                  {isEditing && (
                    <td className="py-6 text-right">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {isEditing && (
            <button
              onClick={addNewRow}
              className="mb-12 text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-700"
            >
              + Add Line Item
            </button>
          )}

          {/* Footer */}
          <footer className="mt-auto pt-10 border-t-2 border-[#071f18] flex justify-between items-end">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-3">
                Status
              </h3>
              <p
                className={`text-xl font-black italic uppercase tracking-tighter ${invoice.status === "paid" ? "text-green-600" : "text-orange-500"}`}
              >
                {invoice.status || "UNPAID"}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">
                Total Due
              </h3>
              <p className="text-6xl font-serif font-bold text-[#071f18] leading-tight">
                <span className="text-2xl mr-1">{invoice.currency || "৳"}</span>
                {calculateTotal().toLocaleString()}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
