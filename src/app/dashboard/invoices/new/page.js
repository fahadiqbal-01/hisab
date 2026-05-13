import React from "react";
import { supabaseAdmin } from "@/lib/supabase";
import NewInvoiceForm from "@/components/NewInvoiceForm";
import { getCachedServerSession } from "@/lib/session";

export default async function NewInvoicePage() {
  const session = await getCachedServerSession();

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase tracking-widest text-xs">
        Session lost. Please refresh or re-login.
      </div>
    );
  }

  const [clientsResponse, profileResponse] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, name")
      .eq("user_id", session.user.id)
      .order("name"),
    supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle(),
  ]);

  return (
    <NewInvoiceForm
      initialClients={clientsResponse.data || []}
      initialProfile={profileResponse.data || null}
      user={session.user}
    />
  );
}
