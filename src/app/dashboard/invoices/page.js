import React from "react";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { getCachedServerSession } from "@/lib/session";
import { Plus, FileText, ExternalLink, Calendar, DollarSign } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

async function InvoicesList({ userId, statusFilter, lang }) {
  const t = getTranslations(lang);

  const { data: invoices } = await supabaseAdmin
    .from("invoices")
    .select(
      `id, invoice_number_full, total, status, created_at, clients (name, phone)`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Calculate counts for all tabs
  const allCount = invoices?.length || 0;
  const paidCount = invoices?.filter((inv) => inv.status === "paid").length || 0;
  const dueCount = invoices?.filter((inv) => inv.status === "due").length || 0;

  // Filter invoices for current tab selection
  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices?.filter((inv) => inv.status === statusFilter);

  const tabs = [
    { id: "all", label: t.allInvoices, count: allCount, href: "/dashboard/invoices" },
    { id: "paid", label: t.paid, count: paidCount, href: "/dashboard/invoices?status=paid" },
    { id: "due", label: t.due, count: dueCount, href: "/dashboard/invoices?status=due" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Visual Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl w-fit backdrop-blur">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-[#082019] text-white shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20"
                  : "text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isActive
                  ? "bg-white/20 text-white dark:bg-emerald-400/20 dark:text-emerald-400"
                  : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40"
              }`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Invoices Table Card */}
      {filteredInvoices && filteredInvoices.length > 0 ? (
        <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcfaf0] dark:bg-white/2 border-b border-black/5 dark:border-white/5 transition-colors duration-300">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
                    {t.invoiceNumberCol}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
                    {t.clientCol}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
                    {t.dateCreatedCol}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
                    {t.amountCol}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
                    {t.statusCol}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40 text-right">
                    {t.actionsCol}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredInvoices.map((inv) => {
                  const clientName = inv.clients?.name || "Unknown Client";
                  const rawPhone = inv.clients?.phone || "";

                  let cleanNumber = rawPhone.replace(/\D/g, "");

                  if (cleanNumber.startsWith("01")) {
                    cleanNumber = `88${cleanNumber}`;
                  } else if (
                    cleanNumber.startsWith("1") &&
                    cleanNumber.length === 10
                  ) {
                    cleanNumber = `880${cleanNumber}`;
                  }

                  const message = t.whatsappMessage
                    .replace("{clientName}", clientName)
                    .replace("{invoiceNumber}", inv.invoice_number_full)
                    .replace("{total}", inv.total.toLocaleString());

                  const whatsappUrl =
                    cleanNumber.length >= 10
                      ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`
                      : null;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4.5 font-bold text-[#082019] dark:text-white text-sm">
                        {inv.invoice_number_full}
                      </td>
                      <td className="px-6 py-4.5 text-black/60 dark:text-white/70 text-sm">
                        {clientName}
                      </td>
                      <td className="px-6 py-4.5 text-black/40 dark:text-white/40 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(inv.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-bold text-[#082019] dark:text-white text-sm">
                        ৳ {inv.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            inv.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {inv.status === "paid" ? t.paidStatus : t.dueStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-5">
                          {whatsappUrl ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {t.whatsApp} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-black/20 dark:text-white/20 text-[10px] uppercase tracking-widest font-bold">
                              {t.noPhone}
                            </span>
                          )}

                          <Link
                            href={`/dashboard/invoices/${inv.id}`}
                            className="text-[#082019] dark:text-white font-bold uppercase text-[10px] tracking-widest hover:underline cursor-pointer"
                          >
                            {t.view}
                          </Link>

                          <DeleteButton id={inv.id} t={t} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 p-12 text-center transition-colors duration-300">
          <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-black/30 dark:text-white/30" />
          </div>
          <h3 className="text-base font-bold text-[#082019] dark:text-white mb-1">
            {t.noInvoicesFound}
          </h3>
          <p className="text-xs text-black/40 dark:text-white/40 max-w-xs mx-auto leading-relaxed">
            {t.noInvoicesDesc}
          </p>
        </div>
      )}
    </div>
  );
}

export default async function InvoicesPage({ searchParams }) {
  const session = await getCachedServerSession();
  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams?.status || "all";

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = getTranslations(lang);

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase text-xs">
        {t.sessionLost}
      </div>
    );
  }

  return (
    <section className="animate-in fade-in duration-500 space-y-8">
      
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-3xl font-bold text-[#082019] dark:text-white">
            {t.invoices}
          </h2>
          <p className="text-black/50 dark:text-white/40 mt-1.5 text-sm">
            {t.trackAndManageBillings}
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="select-none cursor-pointer bg-[#082019] hover:bg-[#0c3127] dark:bg-white dark:text-[#082019] dark:hover:bg-neutral-100 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> {t.createInvoice}
        </Link>
      </header>

      <InvoicesList userId={session.user.id} statusFilter={statusFilter} lang={lang} />
    </section>
  );
}
