import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import DeleteClientButton from "@/components/DeleteClientButton";
import { getCachedServerSession } from "@/lib/session";
import { Plus, Mail, Edit, User } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

async function ClientsList({ userId, lang }) {
  const t = getTranslations(lang);

  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("id, name, email")
    .eq("user_id", userId)
    .order("name");

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 p-12 text-center transition-colors duration-300">
        <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-black/30 dark:text-white/30" />
        </div>
        <h3 className="text-base font-bold text-[#082019] dark:text-white mb-1">
          {t.noClientsOnboarded}
        </h3>
        <p className="text-xs text-black/40 dark:text-white/40 max-w-xs mx-auto leading-relaxed">
          {t.clientDirectoryEmpty}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {clients.map((client) => {
        const initials = client.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "C";

        return (
          <div
            key={client.id}
            className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 dark:border-white/5 flex justify-between items-start gap-4 transition-all duration-300 hover:shadow-sm hover:border-black/10 dark:hover:border-white/10"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Profile Avatar with Initials */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm tracking-wider uppercase border border-emerald-500/20 shrink-0 select-none">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-[#082019] dark:text-white truncate">
                  {client.name}
                </h3>
                <p className="text-xs text-black/40 dark:text-white/40 truncate flex items-center gap-1.5 mt-1 font-medium">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-black/30 dark:text-white/30" />
                  {client.email || (lang === "bn" ? "কোন ইমেল ঠিকানা নেই" : "No email address")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 self-center">
              <Link
                href={`/dashboard/clients/${client.id}/edit`}
                prefetch={true}
                className="p-2 bg-[#fcfaf0] dark:bg-white/5 text-black/40 hover:text-[#082019] dark:text-white/40 dark:hover:text-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <DeleteClientButton id={client.id} t={t} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function ClientsPage() {
  const session = await getCachedServerSession();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = getTranslations(lang);

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase tracking-widest text-xs">
        {t.sessionLost}
      </div>
    );
  }

  return (
    <section className="space-y-8">
      
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-3xl font-bold text-[#082019] dark:text-white">
            {t.clients}
          </h2>
          <p className="text-black/50 dark:text-white/40 mt-1.5 text-sm">
            {t.clientDirectory}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          prefetch={true}
          className="select-none cursor-pointer bg-[#082019] hover:bg-[#0c3127] dark:bg-white dark:text-[#082019] dark:hover:bg-neutral-100 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> {t.addClient}
        </Link>
      </header>

      <ClientsList userId={session.user.id} lang={lang} />
    </section>
  );
}
