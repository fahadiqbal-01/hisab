import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const { error } = await supabaseAdmin
    .from("invoices")
    .update({ status: status })
    .eq("id", id)
    .eq("user_id", session.user.id); 

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
  revalidatePath("/dashboard");

  return NextResponse.json({ success: true });
}
