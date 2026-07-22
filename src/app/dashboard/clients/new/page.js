import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ClientAlreadyAddedAlert from "@/components/ClientAlreadyAddedAlert";
import SubmitButton from "@/components/SubmitButton";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

export default async function NewClientPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/sign-up");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = getTranslations(lang);

  const resolvedSearchParams = await searchParams;
  const isDuplicateClient = resolvedSearchParams?.error === "exists";

  async function createClientAction(formData) {
    "use server";

    const actionSession = await getServerSession(authOptions);
    if (!actionSession?.user?.id) return;
    const rawName = formData.get("name")?.toString().trim() || "";
    const rawEmail = formData.get("email")?.toString().trim() || "";

    let duplicateQuery = supabaseAdmin
      .from("clients")
      .select("id")
      .eq("user_id", actionSession.user.id)
      .limit(1);

    if (rawEmail) {
      duplicateQuery = duplicateQuery.ilike("email", rawEmail);
    } else {
      duplicateQuery = duplicateQuery.ilike("name", rawName);
    }

    const { data: existingClient } = await duplicateQuery.maybeSingle();
    if (existingClient) {
      redirect("/dashboard/clients/new?error=exists");
    }

    const { error } = await supabaseAdmin.from("clients").insert([
      {
        user_id: actionSession.user.id,
        name: rawName,
        email: rawEmail,
        phone: formData.get("phone"),
        company: formData.get("company"),
        address: formData.get("address"),
        city_state: formData.get("city_state"),
        zip_code: formData.get("zip_code"),
        country: formData.get("country"),
      },
    ]);

    if (!error) {
      revalidatePath("/dashboard/clients");
      redirect("/dashboard/clients");
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 animate-in fade-in duration-500">
      <ClientAlreadyAddedAlert show={isDuplicateClient} t={t} />
      
      {/* Header Banner */}
      <header className="mb-8 md:mb-10 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <h2 className="text-3xl font-bold text-[#082019] dark:text-white">
          {t.newClientTitle}
        </h2>
        <p className="text-black/50 dark:text-white/40 mt-1.5 text-sm">
          {t.newClientDesc}
        </p>
      </header>

      <form action={createClientAction} className="space-y-6">
        <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 transition-colors duration-300">
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.clientName}
            </label>
            <input
              name="name"
              required
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.companyOptional}
            </label>
            <input
              name="company"
              placeholder="e.g. Acme Corp"
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm placeholder-black/30 dark:placeholder-white/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.emailAddress}
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.phoneNumber}
            </label>
            <input
              name="phone"
              required
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.addressOptional}
            </label>
            <input
              name="address"
              placeholder="Street address, Suite, etc."
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm placeholder-black/30 dark:placeholder-white/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.cityStateOptional}
            </label>
            <input
              name="city_state"
              placeholder="e.g. Dhaka, BD"
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm placeholder-black/30 dark:placeholder-white/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.zipCodeOptional}
            </label>
            <input
              name="zip_code"
              placeholder="e.g. 1200"
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm placeholder-black/30 dark:placeholder-white/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2 ml-1">
              {t.countryOptional}
            </label>
            <input
              name="country"
              required
              defaultValue="Bangladesh"
              className="w-full bg-[#f6f4ed] dark:bg-white/5 text-black dark:text-white border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-black/20 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <SubmitButton label={t.createClientBtn} pendingLabel={t.creatingClientBtn} />
          <Link
            href="/dashboard/clients"
            className="select-none cursor-pointer text-[#082019] dark:text-white px-10 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center w-full md:w-auto"
          >
            {t.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
