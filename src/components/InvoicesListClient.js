"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { Calendar, ExternalLink, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InvoicesListClient({ invoices, lang, t, initialStatusFilter, shareBaseUrl }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || "all");

  // Keep state in sync with URL filter changes (e.g. back/forward navigation)
  useEffect(() => {
    setStatusFilter(initialStatusFilter || "all");
  }, [initialStatusFilter]);

  const handleTabChange = (tabId) => {
    setStatusFilter(tabId);
    const newPath = tabId === "all" ? "/dashboard/invoices" : `/dashboard/invoices?status=${tabId}`;
    router.replace(newPath, { scroll: false });
  };

  const allCount = invoices.length;
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const dueCount = invoices.filter((inv) => inv.status !== "paid").length;

  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : statusFilter === "paid"
      ? invoices.filter((inv) => inv.status === "paid")
      : invoices.filter((inv) => inv.status !== "paid");

  const tabs = [
    { id: "all", label: t.allInvoices, count: allCount },
    { id: "paid", label: t.paid, count: paidCount },
    { id: "due", label: t.due, count: dueCount },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl w-fit backdrop-blur relative">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer select-none outline-none ${
                isActive
                  ? "text-white dark:text-emerald-400 font-bold"
                  : "text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeInvoiceTabPill"
                  className="absolute inset-0 bg-[#082019] dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span
                className={`relative z-10 px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-emerald-400/20 dark:text-emerald-400"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Invoices Table Card */}
      <AnimatePresence mode="wait">
        {filteredInvoices && filteredInvoices.length > 0 ? (
          <motion.div
            key={statusFilter}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden transition-colors duration-300"
          >
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
                      .replace("{total}", inv.total.toLocaleString())
                      .concat(`\n\n${shareBaseUrl}/invoice/${inv.id}`);

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
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 p-12 text-center transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-black/30 dark:text-white/30" />
            </div>
            <h3 className="text-base font-bold text-[#082019] dark:text-white mb-1">
              {t.noInvoicesFound}
            </h3>
            <p className="text-xs text-black/40 dark:text-white/40 max-w-xs mx-auto leading-relaxed">
              {t.noInvoicesDesc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
