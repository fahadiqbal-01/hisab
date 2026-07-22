"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteAccount() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return { error: "Unauthorized" };

  const { data: invoices, error: invoicesFetchError } = await supabaseAdmin
    .from("invoices")
    .select("id")
    .eq("user_id", userId);

  if (invoicesFetchError) return { error: invoicesFetchError.message };

  const invoiceIds = (invoices || []).map((inv) => inv.id).filter(Boolean);

  if (invoiceIds.length > 0) {
    const { error: invoiceItemsDeleteError } = await supabaseAdmin
      .from("invoice_items")
      .delete()
      .in("invoice_id", invoiceIds);
    if (invoiceItemsDeleteError) return { error: invoiceItemsDeleteError.message };

    const { error: paymentsByInvoiceDeleteError } = await supabaseAdmin
      .from("payments")
      .delete()
      .in("invoice_id", invoiceIds);
    if (paymentsByInvoiceDeleteError) {
      return { error: paymentsByInvoiceDeleteError.message };
    }
  }

  const { error: paymentsDeleteError } = await supabaseAdmin
    .from("payments")
    .delete()
    .eq("user_id", userId);
  if (paymentsDeleteError) return { error: paymentsDeleteError.message };

  const { error: invoicesDeleteError } = await supabaseAdmin
    .from("invoices")
    .delete()
    .eq("user_id", userId);
  if (invoicesDeleteError) return { error: invoicesDeleteError.message };

  const { error: clientsDeleteError } = await supabaseAdmin
    .from("clients")
    .delete()
    .eq("user_id", userId);
  if (clientsDeleteError) return { error: clientsDeleteError.message };

  const { error: subscriptionsDeleteError } = await supabaseAdmin
    .from("subscriptions")
    .delete()
    .eq("user_id", userId);
  if (subscriptionsDeleteError) return { error: subscriptionsDeleteError.message };

  const { error: profilesDeleteError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (profilesDeleteError) return { error: profilesDeleteError.message };

  const { error: usersDeleteError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);
  if (usersDeleteError) return { error: usersDeleteError.message };

  const { error: authDeleteError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authDeleteError) return { error: authDeleteError.message };

  return { success: true };
}

