import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  console.log("POST request received at /api/invoices/create"); // Debug log

  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const {
      clientId,
      items,
      total,
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
          status: "sent",
        },
      ])
      .select()
      .single();

    if (invError) throw invError;

    // 2. Insert Items
    const lineItems = items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.price),
      total_price: parseInt(item.quantity) * parseFloat(item.price),
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
