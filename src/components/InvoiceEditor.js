"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PrintButton from "./PrintButton";
import { updateInvoice } from "@/app/actions/invoices";

export default function InvoiceEditor({ initialInvoice, user }) {
  const router = useRouter();

  // Defensive check: if initialInvoice is not provided, render nothing or a loading state
  if (!initialInvoice) {
    console.warn(
      "InvoiceEditor received no initialInvoice. This should not happen if data fetching is correct.",
    );
    return null; // Or a loading spinner, or an error message
  }

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState({
    id: initialInvoice.id || "new-invoice", // Ensure id is always present, even if initialInvoice is an empty object
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
    const newTotal = calculateTotal();

    try {
      const result = await updateInvoice({
        id: invoice.id,
        sender_name: invoice.sender_name,
        sender_email: invoice.sender_email,
        total: newTotal,
        invoice_items: invoice.invoice_items,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Save error details:", error);
      alert(`Failed to save changes: ${error.message}`);
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
    "bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors";

  return (
    <>
      {/* Action Bar */}
      <div className="max-w-[210mm] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-6 print:hidden">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-black/40">
            {isEditing ? "Editing Mode" : "Invoice Preview"}
          </h2>
          <p className="text-xs text-black/30">ID: {invoice.id}</p>
        </div>
        <div className="flex items-center gap-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold uppercase tracking-widest text-black/40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#071f18] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-bold uppercase tracking-widest text-black/40 hover:text-[#071f18] transition-colors"
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

      {/* The Invoice Document */}
      <div className="overflow-x-auto w-full pb-10">
        <div
          id="invoice-capture-area"
          className={`w-[210mm] min-h-[297mm] mx-auto bg-white p-[10mm] md:p-[20mm] shadow-2xl transition-all ${isEditing ? "ring-2 ring-blue-400" : "print:shadow-none print:m-0"}`}
        >
          <header className="flex justify-between items-start mb-20">
            <div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    className={`${inputClasses} text-4xl font-serif italic text-[#071f18] w-full`}
                    value={invoice.sender_name}
                    onChange={(e) =>
                      setInvoice({ ...invoice, sender_name: e.target.value })
                    }
                    placeholder="Sender Name"
                  />
                  <input
                    className={`${inputClasses} text-sm text-black/50 w-full`}
                    value={invoice.sender_email}
                    onChange={(e) =>
                      setInvoice({ ...invoice, sender_email: e.target.value })
                    }
                    placeholder="Sender Description/Email"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-serif italic text-[#071f18]">
                    {invoice.sender_name}
                  </h1>
                  <p className="text-sm text-black/50 mt-2">
                    {invoice.sender_email}
                  </p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {invoice.invoice_number_full || `INV-${invoice.id.slice(0, 5)}`}
              </p>
              <p className="text-black/40">
                {new Date(invoice.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-10 md:gap-20 mb-20">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-4">
                Billed To
              </h3>
              <p className="font-bold text-xl">{invoice.clients?.name}</p>
              <p className="text-black/60">{invoice.clients?.email}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-4">
                Payment Method
              </h3>
              <p className="font-bold uppercase">
                {invoice.payment_method ||
                  invoice.clients?.preferred_payment_method ||
                  "BKASH"}
              </p>
              <p className="text-black/60">
                {invoice.payment_number ||
                  invoice.clients?.payment_number ||
                  ""}
              </p>
            </div>
          </section>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left py-4 text-xs font-bold uppercase text-black/30">
                  Description
                </th>
                <th className="text-right py-4 text-xs font-bold uppercase text-black/30">
                  Qty
                </th>
                <th className="text-right py-4 text-xs font-bold uppercase text-black/30">
                  Unit Price
                </th>
                <th className="text-right py-4 text-xs font-bold uppercase text-black/30">
                  Total
                </th>
                {isEditing && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-lg">
              {invoice.invoice_items?.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-6">
                    {isEditing ? (
                      <input
                        className={`${inputClasses} w-full font-medium`}
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="py-6 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className={`${inputClasses} w-16 text-right`}
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
                      item.quantity
                    )}
                  </td>
                  <td className="py-6 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className={`${inputClasses} w-24 text-right`}
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
                      `৳ ${item.unit_price?.toLocaleString()}`
                    )}
                  </td>
                  <td className="py-6 text-right font-bold text-[#071f18]">
                    ৳ {(item.quantity * item.unit_price).toLocaleString()}
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
              className="mb-12 text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-blue-700"
            >
              + Add Line Item
            </button>
          )}

          <footer className="border-t-2 border-black pt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-xs font-bold uppercase text-black/30">
                Current Status
              </p>
              <p
                className={`text-2xl font-bold uppercase tracking-tighter italic ${invoice.status === "paid" ? "text-green-600" : "text-orange-500"}`}
              >
                {invoice.status === "sent" ? "UNPAID" : invoice.status}
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-bold uppercase text-black/30">
                Total Balance Due
              </p>
              <p className="text-4xl md:text-6xl font-serif font-bold text-[#071f18]">
                {invoice.currency || "৳"} {calculateTotal().toLocaleString()}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
