import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import InvoiceEditor from "@/components/InvoiceEditor";
import { cookies } from "next/headers";

export default async function InvoicePage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const { data: invoice } = await supabaseAdmin
    .from("invoices")
    .select(
      `
      *,
      clients (name, email, company, address, city_state, zip_code, country),
      invoice_items (*)
    `,
    )
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!invoice) notFound();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  return (
    <InvoiceEditor
      initialInvoice={invoice}
      user={session?.user}
      lang={lang}
    />
  );
}
