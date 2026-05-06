import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchClients } from "@/app/actions/clients";
import { getProfile } from "@/app/actions/profiles";
import NewInvoiceForm from "@/components/NewInvoiceForm";

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase tracking-widest text-xs">
        Session lost. Please refresh or re-login.
      </div>
    );
  }

  const [clientsData, profileResult] = await Promise.all([
    fetchClients(),
    getProfile(),
  ]);

  return (
    <NewInvoiceForm
      initialClients={clientsData}
      initialProfile={profileResult?.data || null}
      user={session.user}
    />
  );
}
