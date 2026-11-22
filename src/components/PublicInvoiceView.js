import { CheckCircle2, Clock } from "lucide-react";

function amount(value) {
  return (Number(value) || 0).toLocaleString();
}

export default function PublicInvoiceView({ invoice }) {
  const subtotal = (invoice.invoice_items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );
  const vat = (subtotal * (Number(invoice.vat) || 0)) / 100;
  const tax = (subtotal * (Number(invoice.tax) || 0)) / 100;
  const currency = invoice.currency || "৳";
  const isPaid = invoice.status === "paid";

  return (
    <main className="min-h-screen bg-[#f9f8f5] p-4 sm:p-8 text-[#071f18]">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border-t-4 border-[#061e18] bg-white p-7 shadow-xl sm:p-12">
        <header className="flex flex-col justify-between gap-8 border-b border-black/10 pb-10 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-black/40">Invoice from</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{invoice.sender_name}</h1>
            {invoice.sender_email && <p className="mt-1 text-sm text-black/60">{invoice.sender_email}</p>}
          </div>
          <div className="sm:text-right">
            <p className="font-bold tracking-widest">{invoice.invoice_number_full || `INV-${invoice.id.slice(0, 5)}`}</p>
            <p className="mt-1 text-sm text-black/50">{new Date(invoice.created_at).toLocaleDateString("en-GB")}</p>
            <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isPaid ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-amber-500/20 bg-amber-500/10 text-amber-600"}`}>
              {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {isPaid ? "Paid" : "Due"}
            </span>
          </div>
        </header>

        <section className="grid gap-8 py-10 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-black/40">Billed to</p>
            <p className="text-xl font-bold">{invoice.clients?.name}</p>
            <p className="mt-1 text-sm text-black/60">{invoice.clients?.email}</p>
            {invoice.clients?.company && <p className="mt-1 text-sm text-black/60">{invoice.clients.company}</p>}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-black/40">Payment method</p>
            <p className="font-bold capitalize">{invoice.payment_method || invoice.clients?.preferred_payment_method || "—"}</p>
            <p className="mt-1 text-sm text-black/60">{invoice.payment_number || invoice.clients?.payment_number}</p>
          </div>
        </section>

        <table className="w-full border-collapse text-sm">
          <thead><tr className="border-b border-black/10 text-left text-[10px] font-bold uppercase tracking-widest text-black/45"><th className="py-4">Description</th><th className="py-4 text-right">Qty</th><th className="py-4 text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-black/5">
            {(invoice.invoice_items || []).map((item) => <tr key={item.id}><td className="py-4 pr-4">{item.description}</td><td className="py-4 text-right text-black/60">{item.quantity}</td><td className="py-4 text-right font-medium">{currency} {amount(item.price)}</td></tr>)}
          </tbody>
        </table>

        <section className="ml-auto mt-8 max-w-xs space-y-2 border-t-2 border-[#071f18] pt-5 text-right">
          {(Number(invoice.vat) > 0 || Number(invoice.tax) > 0) && <><p className="text-sm text-black/60">Subtotal: {currency} {amount(subtotal)}</p>{Number(invoice.vat) > 0 && <p className="text-sm text-black/60">VAT ({invoice.vat}%): {currency} {amount(vat)}</p>}{Number(invoice.tax) > 0 && <p className="text-sm text-black/60">Tax ({invoice.tax}%): {currency} {amount(tax)}</p>}</>}
          <p className="pt-2 text-xs font-bold uppercase tracking-[0.2em] text-black/45">Total</p>
          <p className="text-4xl font-extrabold">{currency} {amount(invoice.total ?? subtotal + vat + tax)}</p>
        </section>

        {invoice.note_text && <section className="mt-12 border-t border-black/10 pt-7"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-black/40">Note</p><p className="text-sm leading-relaxed text-black/60">{invoice.note_text}</p></section>}
      </article>
    </main>
  );
}
