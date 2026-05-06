import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";
import { Suspense } from "react";

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function InvoicesList() {
  const session = await getServerSession(authOptions);
  const { data: invoices } = await supabaseAdmin
    .from("invoices")
    .select(
      `id, invoice_number_full, total, status, created_at, clients (name, phone)`,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#fdfaf1] dark:bg-white/5 border-b border-black/5 dark:border-white/10">
          <tr>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
              Invoice#
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
              Client
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
              Amount
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">
              Status
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {invoices?.map((inv) => {
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

            const message = `Hello ${clientName}, your invoice ${inv.invoice_number_full} for ৳${inv.total.toLocaleString()} is ready. Please check it here.`;

            const whatsappUrl =
              cleanNumber.length >= 10
                ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`
                : null;

            return (
              <tr
                key={inv.id}
                className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4 font-bold text-[#071f18] dark:text-white text-sm">
                  {inv.invoice_number_full}
                </td>
                <td className="px-6 py-4 text-black/60 dark:text-orange-700 text-sm">
                  {clientName}
                </td>
                <td className="px-6 py-4 font-bold text-[#071f18] dark:text-white text-sm">
                  ৳ {inv.total.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      inv.status === "paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                    }`}
                  >
                    {inv.status === "paid" ? "Paid" : "Due"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-6">
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 dark:text-green-400 font-bold uppercase text-[10px] tracking-widest hover:underline"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-black/20 dark:text-white/20 text-[10px] uppercase tracking-widest font-bold">
                        No Phone
                      </span>
                    )}

                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="text-[#071f18] dark:text-white font-bold uppercase text-[10px] tracking-widest hover:underline"
                    >
                      View
                    </Link>

                    <DeleteButton id={inv.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase text-xs">
        Session lost.
      </div>
    );
  }

  return (
    <section className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-[#071f18] dark:text-white">
            Invoices
          </h2>
          <p className="text-black/50 dark:text-white/40 mt-1">
            Track your billings.
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="select-none cursor-pointer bg-[#071f18] dark:bg-white dark:text-[#071f18] text-white px-6 py-2 rounded-full font-medium text-sm uppercase tracking-widest"
        >
          + Create Invoice
        </Link>
      </header>

      <Suspense fallback={null}>
        <InvoicesList />
      </Suspense>
    </section>
  );
}
