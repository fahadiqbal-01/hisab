import React from "react";
import { supabaseAdmin } from "@/lib/supabase";
import NewInvoiceForm from "@/components/NewInvoiceForm";
import { getCachedServerSession } from "@/lib/session";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

export default async function NewInvoicePage() {
  const session = await getCachedServerSession();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = getTranslations(lang);

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase tracking-widest text-xs">
        {t.sessionLost}
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
      lang={lang}
    />
  );
}
