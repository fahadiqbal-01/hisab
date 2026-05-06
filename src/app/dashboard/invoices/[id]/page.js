import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import InvoiceEditor from "@/components/InvoiceEditor";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function InvoicePage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

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
    .single();

  if (!invoice) notFound();

  return <InvoiceEditor initialInvoice={invoice} user={session?.user} />;
}
