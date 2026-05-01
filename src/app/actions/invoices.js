"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function deleteInvoice(id) {
  const { error } = await supabaseAdmin.from("invoices").delete().eq("id", id);

  if (!error) {
    revalidatePath("/dashboard/invoices");
    return { success: true };
  }
  return { error: "Failed to delete" };
}

export async function updateInvoice(invoiceData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const { id, sender_name, sender_email, total, invoice_items } = invoiceData;

    // 1. Update main invoice total and sender details
    const { error: invError } = await supabaseAdmin
      .from("invoices")
      .update({
        total: total,
        sender_name: sender_name,
        sender_email: sender_email,
      })
      .eq("id", id)
      .eq("user_id", session.user.id); // Crucial security check: only allow updating own invoices

    if (invError) {
      console.error("Supabase Invoice Update Error:", invError.message);
      throw new Error(`Failed to update invoice: ${invError.message}`);
    }

    // 2. Sync Items: Delete old and insert new set to handle additions/removals cleanly
    // Ensure that only items belonging to this invoice are deleted
    const { error: deleteItemsError } = await supabaseAdmin
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteItemsError) {
      console.error("Supabase Delete Invoice Items Error:", deleteItemsError.message);
      throw new Error(`Failed to delete old invoice items: ${deleteItemsError.message}`);
    }

    // Prepare items for insertion
    const itemsToInsert = invoice_items.map((item) => ({
      invoice_id: id,
      description: item.description || "Service",
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      total_price: Number(item.quantity || 0) * Number(item.unit_price || 0),
    }));

    const { error: insertItemsError } = await supabaseAdmin.from("invoice_items").insert(itemsToInsert);

    if (insertItemsError) {
      console.error("Supabase Insert Invoice Items Error:", insertItemsError.message);
      throw new Error(`Failed to insert new invoice items: ${insertItemsError.message}`);
    }

    // Revalidate paths to reflect changes
    revalidatePath(`/dashboard/invoices/${id}`);
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (error) {
    console.error("Update Invoice Action Error:", error.message);
    return { error: error.message };
  }
}
