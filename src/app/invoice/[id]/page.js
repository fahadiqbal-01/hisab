import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import PublicInvoiceView from "@/components/PublicInvoiceView";

export const metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function SharedInvoicePage({ params }) {
  const { id } = await params;
  const { data: invoice } = await supabaseAdmin
    .from("invoices")
    .select(`*, clients (name, email, company, address, city_state, zip_code, country, preferred_payment_method, payment_number), invoice_items (*)`)
    .eq("id", id)
    .single();

  if (!invoice) notFound();
  return <PublicInvoiceView invoice={invoice} />;
}
