import React from "react";
import Link from "next/link";
import { getCachedServerSession } from "@/lib/session";
import { Plus } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";
import InvoicesListClient from "@/components/InvoicesListClient";
import { getSiteUrl } from "@/lib/site";

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

  // Fetch all invoices once on the server
  const { data: invoices } = await supabaseAdmin
    .from("invoices")
    .select(
      `id, invoice_number_full, total, status, created_at, clients (name, phone)`,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

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

      {/* Interactive filterable client list */}
      <InvoicesListClient 
        invoices={invoices || []} 
        lang={lang} 
        t={t} 
        initialStatusFilter={statusFilter} 
        shareBaseUrl={getSiteUrl()}
      />
    </section>
  );
}
