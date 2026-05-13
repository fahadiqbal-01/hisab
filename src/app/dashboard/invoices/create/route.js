import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
    } = await req.json();

    // 1. Insert Invoice
    const { data: invoice, error: invError } = await supabaseAdmin
      .from("invoices")
      .insert([
        {
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
        },
      ])
      .select("id")
      .single();

    if (invError) throw invError;

    // 2. Insert Items
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
