"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton";
import { updateInvoice } from "@/app/actions/invoices";
import { ArrowLeft, Edit, Check, CheckCircle2, Clock } from "lucide-react";

export default function InvoiceEditor({ initialInvoice, user }) {
  const router = useRouter();

  const normalizeInvoice = (sourceInvoice) => ({
    id: sourceInvoice?.id || "new-invoice",
    ...sourceInvoice,
    sender_name: sourceInvoice?.sender_name || user?.name || "",
    sender_email: sourceInvoice?.sender_email || user?.email || "",
    vat: sourceInvoice?.vat ?? 0,
    tax: sourceInvoice?.tax ?? 0,
    note_text: sourceInvoice?.note_text ?? "",
    payment_method: sourceInvoice?.payment_method ?? "",
    payment_number: sourceInvoice?.payment_number ?? "",
    currency: sourceInvoice?.currency || "৳",
    invoice_items:
      sourceInvoice?.invoice_items?.map((item) => ({
        ...item,
        description: item?.description ?? "",
        quantity: item?.quantity ?? 0,
        unit_price: item?.unit_price ?? 0,
        price:
          item?.price ??
          (Number(item?.quantity) || 0) * (Number(item?.unit_price) || 0),
      })) || [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(() =>
    normalizeInvoice(initialInvoice),
  );

  const subtotal = useMemo(() => {
    return invoice.invoice_items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0,
    );
  }, [invoice.invoice_items]);

  const total = useMemo(() => {
    const vatVal = parseFloat(invoice.vat) || 0;
    const taxVal = parseFloat(invoice.tax) || 0;
    const vatAmount = (subtotal * (Number(vatVal) || 0)) / 100;
    const taxAmount = (subtotal * (Number(taxVal) || 0)) / 100;
    return subtotal + vatAmount + taxAmount;
  }, [subtotal, invoice.vat, invoice.tax]);

  if (!initialInvoice) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateInvoice({
        id: invoice.id,
        sender_name: invoice.sender_name,
        sender_email: invoice.sender_email,
        vat: Number(invoice.vat) || 0,
        tax: Number(invoice.tax) || 0,
        total: total,
        invoice_items: invoice.invoice_items,
        note_text: invoice.note_text,
      });
      if (result.error) throw new Error(result.error);
      router.refresh();
      router.push("/dashboard/invoices");
    } catch (error) {
      let userMessage = "Failed to save invoice.";
      if (
        error.message.includes("Could not find the 'note_text' column") ||
        error.message.includes('column "notes" does not exist')
      ) {
        userMessage =
          "Failed to save invoice: The 'note_text' field is missing from the database schema. Please ensure the 'invoices' table has a 'note_text' column.";
      } else if (error.message.includes("Failed to update invoice")) {
        userMessage = error.message;
      }
      alert(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = invoice.invoice_items.map((item, i) => {
      if (i !== index) return item;
      const updatedItem = { ...item, [field]: value };

      if (field === "price") {
        const qty = Number(updatedItem.quantity) || 0;
        updatedItem.unit_price = qty > 0 ? (Number(value) || 0) / qty : 0;
      }

      if (field === "quantity") {
        const qty = Number(value) || 0;
        updatedItem.unit_price = qty > 0 ? (Number(updatedItem.price) || 0) / qty : 0;
      }

      return updatedItem;
    });
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
          price: 0,
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
    <div className="min-h-screen pb-20 space-y-6 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300 print:hidden mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/invoices"
            className="p-2.5 bg-[#fcfaf0] dark:bg-white/5 text-[#082019] dark:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Back to Invoices"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {isEditing ? "Editing Mode" : "Invoice Preview"}
            </span>
            <h2 className="text-xl font-bold text-[#082019] dark:text-white mt-0.5">
              {invoice.invoice_number_full || `Invoice #${invoice.id.slice(0, 8)}`}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto sm:justify-end">
          {/* Invoice Status Badge */}
          <span
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shrink-0 ${
              invoice.status === "paid"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {invoice.status === "paid" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            {invoice.status === "paid" ? "Paid" : "Due"}
          </span>

          <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10 hidden sm:block" />

          {isEditing ? (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setInvoice({
                    ...normalizeInvoice(initialInvoice),
                  });
                  setIsEditing(false);
                }}
                className="px-5 py-2.5 rounded-full border border-red-500/20 hover:bg-red-500/5 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#082019] dark:bg-white text-white dark:text-[#082019] px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-full border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-[#082019] dark:text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Invoice
              </button>
              <PrintButton
                invoiceId={invoice.id}
                initialStatus={invoice.status}
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-10 cursor-grab active:cursor-grabbing px-4 sm:px-6">
        <div
          id="invoice-capture-area"
          className={`w-[210mm] min-h-[297mm] mx-auto bg-white p-[20mm] shadow-2xl border-y-4 border-[#061e18] transition-all relative ${
            isEditing
              ? "ring-2 ring-blue-400"
              : "print:shadow-none print:m-0 print:p-0"
          }`}
        >
          <header className="flex justify-between items-start mb-24">
            <div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    className={`${inputClasses} text-5xl font-serif w-full`}
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
                  <h1 className="text-5xl font-extrabold text-[#061e18] leading-tight">
                    {invoice.sender_name}
                  </h1>
                  <p className="text-sm text-black/70 mt-1">
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

          <section className="grid grid-cols-2 gap-20 mb-24">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">
                Billed To
              </h3>
              <p className="font-bold text-xl text-[#061e18]">
                {invoice.clients?.name}
              </p>
              <p className="pt-2">{invoice.clients?.email}</p>
              {invoice.clients?.company && (
                <p className="text-sm font-medium text-black/60 mt-1">
                  {invoice.clients.company}
                </p>
              )}
              <div className="text-sm text-black/50 mt-0.5 space-y-0.5">
                {invoice.clients?.address && <p>{invoice.clients.address}</p>}
                {(invoice.clients?.city_state || invoice.clients?.zip_code) && (
                  <p>
                    {[invoice.clients?.city_state, invoice.clients?.zip_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {invoice.clients?.country && <p>{invoice.clients.country}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">
                Payment Method
              </h3>
              <p className="text-sm font-bold text-[#061e18] capitalize">
                {invoice.payment_method ||
                  invoice.clients?.preferred_payment_method ||
                  "bkash"}
              </p>
              <p className="text-sm text-black/50 mt-1">
                {invoice.payment_number || invoice.clients?.payment_number}
              </p>
            </div>
          </section>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest text-black/50">
                  Description
                </th>
                <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest text-black/50">
                  Qty
                </th>
                <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest text-black/50">
                  Price
                </th>
                {isEditing && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/3">
              {invoice.invoice_items?.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-1 pr-4">
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
                  <td className="py-1 text-right w-16">
                    {isEditing ? (
                      <input
                        type="number"
                        className={`${inputClasses} w-full text-right text-sm`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", e.target.value)
                        }
                      />
                    ) : (
                      <span className="text-sm text-black/50">
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="py-1 text-right w-32">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        className={`${inputClasses} w-full text-right text-sm`}
                        value={item.price}
                        onChange={(e) =>
                          updateItem(idx, "price", e.target.value)
                        }
                      />
                    ) : (
                      <span className="text-sm text-[#071f18]">
                        {invoice.currency || "৳"}{" "}
                        {(Number(item.price) || 0).toLocaleString()}
                      </span>
                    )}
                  </td>
                  {isEditing && (
                    <td className="py-1 text-right">
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

          {isEditing && (
            <div className="grid grid-cols-2 gap-20 mb-12 border-t border-black/5 pt-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2 block">
                  VAT (%)
                </label>
                <input
                  type="number"
                  step="any"
                  className={`${inputClasses} w-full text-sm font-medium`}
                  value={invoice.vat}
                  onChange={(e) =>
                    setInvoice({ ...invoice, vat: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2 block">
                  Tax (%)
                </label>
                <input
                  type="number"
                  step="any"
                  className={`${inputClasses} w-full text-sm font-medium`}
                  value={invoice.tax}
                  onChange={(e) =>
                    setInvoice({ ...invoice, tax: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-auto pt-10 border-t-2 border-[#071f18] flex justify-between items-end">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-1">
                Status
              </h3>
              <p
                className={`text-xl font-black uppercase tracking-tighter ${invoice.status === "paid" ? "text-green-600" : "text-orange-500"}`}
              >
                {invoice.status === "paid" ? "Paid" : "Due"}
              </p>
            </div>
            <div className="text-right">
              {(Number(invoice.vat) > 0 || Number(invoice.tax) > 0) && (
                <div className="mb-4 space-y-1">
                  <div className="flex justify-end gap-4 text-[10px] font-bold uppercase tracking-widest text-black/30">
                    <span>Subtotal:</span>
                    <span className="text-[#071f18]">
                      {invoice.currency || "৳"} {subtotal.toLocaleString()}
                    </span>
                  </div>
                  {Number(invoice.vat) > 0 && (
                    <div className="flex justify-end gap-4 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                      <span>VAT ({invoice.vat}%):</span>
                      <span>
                        + ৳{" "}
                        {(
                          (subtotal * Number(invoice.vat)) /
                          100
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {Number(invoice.tax) > 0 && (
                    <div className="flex justify-end gap-4 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                      <span>Tax ({invoice.tax}%):</span>
                      <span>
                        + ৳{" "}
                        {(
                          (subtotal * Number(invoice.tax)) /
                          100
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-1">
                Total Due
              </h3>
              <p className="text-6xl font-mono font-extrabold text-[#071f18] leading-tight">
                <span className="text-2xl mr-1">{invoice.currency || "৳"}</span>
                {total.toLocaleString()}
              </p>
            </div>
          </footer>
          <div className="mt-24">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">
              Note
            </h3>
            {isEditing ? (
              <textarea
                className={`${inputClasses} w-full text-sm py-2 resize-none h-20`}
                placeholder="e.g. Please process the payment using the method mentioned above."
                value={invoice.note_text || ""}
                onChange={(e) =>
                  setInvoice({ ...invoice, note_text: e.target.value })
                }
              />
            ) : (
              <p className="text-sm text-black/50 leading-relaxed  ">
                {invoice.note_text ||
                  "Please process the payment using the method mentioned above. Thank you!"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
