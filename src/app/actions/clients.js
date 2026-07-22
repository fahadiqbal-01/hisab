"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
      company: formData.company,
      address: formData.address,
      city_state: formData.city_state,
      zip_code: formData.zip_code,
      country: formData.country,
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
