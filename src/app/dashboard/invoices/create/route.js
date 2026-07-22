import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

function isMissingColumnError(error, column) {
  const message = error?.message || "";
  return (
    message.includes(`column "invoices.${column}" does not exist`) ||
    message.includes(`column invoices.${column} does not exist`) ||
    message.includes(`column "${column}" does not exist`) ||
    message.includes(`Could not find the '${column}' column`)
  );
}

async function insertInvoiceWithNoteFallback(baseInvoice, noteText) {
  const noteValue = noteText?.toString().trim() || null;
  const candidates = [
    { ...baseInvoice, note_text: noteValue },
    { ...baseInvoice, notes: noteValue },
    { ...baseInvoice },
  ];

  let lastError = null;

  for (const payload of candidates) {
    const { data, error } = await supabaseAdmin
      .from("invoices")
      .insert([payload])
      .select("id")
      .single();

    if (!error) return data;

    const isNoteColumnIssue =
      isMissingColumnError(error, "note_text") ||
      isMissingColumnError(error, "notes");

    if (!isNoteColumnIssue) {
      throw error;
    }

    lastError = error;
  }

  throw lastError;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      clientId,
      items,
      total,
      vat,
      tax,
      sender_name,
      sender_email,
      payment_method,
      payment_number,
      currency,
      note_text,
    } = await req.json();

 
    const invoiceBase = {
      sender_name,
      sender_email,
      payment_method,
      payment_number,
      currency,
      user_id: session.user.id,
      client_id: clientId,
      total: total,
      vat: Number(vat) || 0,
      tax: Number(tax) || 0,
      status: "sent",
    };

    console.log("ROUTE HANDLER INVOICE INSERT:", {
      invoiceBase,
      serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
      sessionUser: session.user,
    });

    const invoice = await insertInvoiceWithNoteFallback(invoiceBase, note_text);


    const lineItems = items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description || "Service",
      quantity: Number.parseInt(item.quantity, 10) || 0,
      unit_price: Number.parseFloat(item.unit_price) || 0,
      total_price:
        (Number.parseInt(item.quantity, 10) || 0) *
        (Number.parseFloat(item.unit_price) || 0),
    }));

    const { error: itemError } = await supabaseAdmin
      .from("invoice_items")
      .insert(lineItems);
    if (itemError) throw itemError;

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Error:", err.message);
    return NextResponse.json(
      {
        error: err.message,
        serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      },
      { status: 500 },
    );
  }
}
