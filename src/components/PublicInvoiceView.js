function formatAmount(value) {
  return (Number(value) || 0).toLocaleString();
}

export default function PublicInvoiceView({ invoice }) {
  const subtotal = (invoice.invoice_items || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const vatAmount = (subtotal * (Number(invoice.vat) || 0)) / 100;
  const taxAmount = (subtotal * (Number(invoice.tax) || 0)) / 100;
  const total = Number(invoice.total ?? subtotal + vatAmount + taxAmount);
  const currency = invoice.currency || "৳";
  const paymentMethod = invoice.payment_method || invoice.clients?.preferred_payment_method || "";
  const paymentNumber = invoice.payment_number || invoice.clients?.payment_number || "";

  return (
    <main className="min-h-screen bg-[#f9f8f5] px-3 py-4 sm:p-8">
      <article className="mx-auto min-h-[297mm] w-full max-w-[210mm] border-y-4 border-[#061e18] bg-white p-[10mm] shadow-2xl sm:p-[20mm]">
        <header className="mb-20 flex items-start justify-between gap-5 sm:mb-24">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-[#061e18] sm:text-5xl">{invoice.sender_name}</h1>
            {invoice.sender_email && <p className="mt-1 text-xs text-black/70 sm:text-sm">{invoice.sender_email}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-bold uppercase tracking-widest sm:text-sm">{invoice.invoice_number_full || `INV-${invoice.id.slice(0, 5)}`}</p>
            <p className="mt-1 text-xs text-black/40 sm:text-sm">{new Date(invoice.created_at).toLocaleDateString("en-GB")}</p>
          </div>
        </header>

        <section className="mb-20 grid grid-cols-2 gap-8 sm:mb-24 sm:gap-20">
          <div>
            <h2 className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 sm:text-[10px]">Billed to</h2>
            <p className="text-base font-bold text-[#061e18] sm:text-xl">{invoice.clients?.name}</p>
            <p className="pt-2 text-xs sm:text-base">{invoice.clients?.email}</p>
            {invoice.clients?.company && <p className="mt-1 text-xs font-medium text-black/60 sm:text-sm">{invoice.clients.company}</p>}
            <div className="mt-0.5 space-y-0.5 text-xs text-black/50 sm:text-sm">
              {invoice.clients?.address && <p>{invoice.clients.address}</p>}
              {(invoice.clients?.city_state || invoice.clients?.zip_code) && <p>{[invoice.clients.city_state, invoice.clients.zip_code].filter(Boolean).join(", ")}</p>}
              {invoice.clients?.country && <p>{invoice.clients.country}</p>}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 sm:text-[10px]">Payment method</h2>
            <p className="text-xs font-bold capitalize text-[#061e18] sm:text-sm">{paymentMethod || "—"}</p>
            {paymentNumber && <p className="mt-1 text-xs text-black/50 sm:text-sm">{paymentNumber}</p>}
          </div>
        </section>

        <table className="mb-8 w-full">
          <thead><tr className="border-b border-black/5"><th className="py-4 text-left text-[9px] font-bold uppercase tracking-widest text-black/50 sm:text-[10px]">Item description</th><th className="py-4 text-right text-[9px] font-bold uppercase tracking-widest text-black/50 sm:text-[10px]">Qty</th><th className="py-4 text-right text-[9px] font-bold uppercase tracking-widest text-black/50 sm:text-[10px]">Unit price</th></tr></thead>
          <tbody className="divide-y divide-black/[0.03]">
            {(invoice.invoice_items || []).map((item) => <tr key={item.id}><td className="py-2 pr-4 text-xs text-[#071f18] sm:text-sm">{item.description}</td><td className="w-16 py-2 text-right text-xs text-black/50 sm:text-sm">{item.quantity}</td><td className="w-28 py-2 text-right text-xs text-[#071f18] sm:w-32 sm:text-sm">{currency} {formatAmount(item.price)}</td></tr>)}
          </tbody>
        </table>

        <footer className="mt-auto flex items-end justify-between border-t-2 border-[#071f18] pt-10">
          <div><h2 className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 sm:text-[10px]">Status</h2><p className={`text-base font-black uppercase tracking-tighter sm:text-xl ${invoice.status === "paid" ? "text-green-600" : "text-orange-500"}`}>{invoice.status === "paid" ? "Paid" : "Due"}</p></div>
          <div className="text-right">
            {(Number(invoice.vat) > 0 || Number(invoice.tax) > 0) && <div className="mb-4 space-y-1"><div className="flex justify-end gap-4 text-[9px] font-bold uppercase tracking-widest text-black/30 sm:text-[10px]"><span>Subtotal:</span><span className="text-[#071f18]">{currency} {formatAmount(subtotal)}</span></div>{Number(invoice.vat) > 0 && <div className="flex justify-end gap-4 text-[9px] font-bold uppercase tracking-widest text-orange-500 sm:text-[10px]"><span>VAT ({invoice.vat}%):</span><span>+ {currency} {formatAmount(vatAmount)}</span></div>}{Number(invoice.tax) > 0 && <div className="flex justify-end gap-4 text-[9px] font-bold uppercase tracking-widest text-orange-500 sm:text-[10px]"><span>Tax ({invoice.tax}%):</span><span>+ {currency} {formatAmount(taxAmount)}</span></div>}</div>}
            <h2 className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 sm:text-[10px]">Total</h2><p className="font-mono text-4xl font-extrabold leading-tight text-[#071f18] sm:text-6xl"><span className="mr-1 text-xl sm:text-2xl">{currency}</span>{formatAmount(total)}</p>
          </div>
        </footer>

        <section className="mt-24"><h2 className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 sm:text-[10px]">Note / Notes</h2><p className="text-xs leading-relaxed text-black/50 sm:text-sm">{invoice.note_text || "Please process the payment using the method mentioned above. Thank you!"}</p></section>
      </article>
    </main>
  );
}
