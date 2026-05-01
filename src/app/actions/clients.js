"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function fetchClients() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id, name")
    .eq("user_id", session.user.id)
    .order("name");

  if (error) {
    console.error("Fetch Clients Error:", error.message);
    return [];
  }
  return data;
}

export async function updateClient(id, formData) {
  const { error } = await supabaseAdmin
    .from("clients")
    .update({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      // Force lowercase here to match the Database ENUM
      preferred_payment_method: formData.preferred_payment_method.toLowerCase(),
      payment_number: formData.payment_number,
    })
    .eq("id", id);

  if (error) {
    console.error("Update Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function deleteClient(id) {
  const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);

  if (error) {
    console.error("Delete Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/dashboard/clients");
  return { success: true };
}
