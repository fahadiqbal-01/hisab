"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") return { error: error.message };
  return { data };
}

export async function updateProfile(profileData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const { error } = await supabaseAdmin.from("profiles").upsert({
    id: session.user.id,
    ...profileData,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { success: true };
}
