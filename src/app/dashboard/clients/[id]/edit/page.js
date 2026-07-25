import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import EditClientForm from "@/components/EditClientForm";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EditClientPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = getTranslations(lang);

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!client) notFound();

  const updateInfoText = lang === "bn"
    ? `${client.name}-এর তথ্য আপডেট করুন।`
    : `Update information for ${client.name}.`;

  return (
    <section className="max-w-2xl mx-auto pb-16 animate-in fade-in duration-500">
      <header className="mb-8 md:mb-10 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <h2 className="text-3xl font-bold text-[#082019] dark:text-white">
          {t.editClientTitle}
        </h2>
        <p className="text-black/50 dark:text-white/40 mt-1.5 text-sm">
          {updateInfoText}
        </p>
      </header>
      <EditClientForm client={client} lang={lang} />
    </section>
  );
}
