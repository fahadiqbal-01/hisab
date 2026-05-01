import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteButton from "@/components/DeleteButton";

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  const { data: invoices } = await supabaseAdmin
    .from("invoices")
    .select(
      `
      *,
      clients (name, phone)
    `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <section>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-[#071f18]">Invoices</h2>
          <p className="text-black/50 mt-1">
            Track your billings and payment statuses.
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="select-none cursor-pointer bg-[#071f18] text-white px-6 py-2 rounded-full font-medium hover:bg-[#0a2d23] transition-all"
        >
          + Create Invoice
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#fdfaf1] border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-black/60">
                Invoice #
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-black/60">
                Client
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-black/60">
                Amount
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-black/60">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-black/60 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {invoices?.map((inv) => {
              // Defensive variables to prevent the crash seen in image_d5dd5f.png
              const clientName = inv.clients?.name || "Unknown Client";
              const clientPhone = inv.clients?.phone || "";

              const message = `Hello ${clientName}, your invoice ${inv.invoice_number_full} for ৳${inv.total} is ready. Please check it here.`;

              // Only generate WhatsApp link if a phone number exists
              const whatsappUrl = clientPhone
                ? `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
                : null;

              return (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#071f18]">
                    {inv.invoice_number_full}
                  </td>
                  <td className="px-6 py-4 text-black/60">{clientName}</td>
                  <td className="px-6 py-4 font-bold text-[#071f18]">
                    ৳ {inv.total}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-6">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="select-none cursor-pointer text-green-600 font-medium hover:underline text-sm"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-black/20 text-sm italic">
                          No Phone
                        </span>
                      )}

                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className=" select-none cursor-pointer text-[#071f18] font-medium hover:underline text-sm"
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
    </section>
  );
}
