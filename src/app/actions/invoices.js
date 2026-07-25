"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function isMissingColumnError(error, column) {
  const message = error?.message || "";
  return (
    message.includes(`column "invoices.${column}" does not exist`) ||
    message.includes(`column invoices.${column} does not exist`) ||
    message.includes(`column "${column}" does not exist`) ||
    message.includes(`Could not find the '${column}' column`)
  );
}

async function updateInvoiceWithNoteFallback(baseUpdate, noteValue, id, userId) {
  const updateCandidates = [
    { ...baseUpdate, note_text: noteValue },
    { ...baseUpdate, notes: noteValue },
    { ...baseUpdate },
  ];

  let lastError = null;

  for (const updatePayload of updateCandidates) {
    const { error } = await supabaseAdmin
      .from("invoices")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) return null;

    const isNoteColumnIssue =
      isMissingColumnError(error, "note_text") ||
      isMissingColumnError(error, "notes");

    if (!isNoteColumnIssue) {
      return error;
    }

    lastError = error;
  }

  return lastError;
}

export async function deleteInvoice(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const { error } = await supabaseAdmin
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

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
    const {
      id,
      sender_name,
      sender_email,
      total,
      invoice_items,
      vat,
      tax,
      note_text,
      notes,
    } = invoiceData;
    const resolvedNote = note_text ?? notes ?? "";

    // 1. Update main invoice total and sender details
    const invError = await updateInvoiceWithNoteFallback(
      {
        total: total,
        sender_name: sender_name,
        sender_email: sender_email,
        vat: Number(vat) || 0,
        tax: Number(tax) || 0,
      },
      resolvedNote,
      id,
      session.user.id,
    );

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
      console.error(
        "Supabase Delete Invoice Items Error:",
        deleteItemsError.message,
      );
      throw new Error(
        `Failed to delete old invoice items: ${deleteItemsError.message}`,
      );
    }

    // Prepare items for insertion
    const itemsToInsert = invoice_items.map((item) => ({
      invoice_id: id,
      description: item.description || "Service",
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      total_price: Number(item.quantity || 0) * Number(item.unit_price || 0),
    }));

    const { error: insertItemsError } = await supabaseAdmin
      .from("invoice_items")
      .insert(itemsToInsert);

    if (insertItemsError) {
      console.error(
        "Supabase Insert Invoice Items Error:",
        insertItemsError.message,
      );
      throw new Error(
        `Failed to insert new invoice items: ${insertItemsError.message}`,
      );
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
