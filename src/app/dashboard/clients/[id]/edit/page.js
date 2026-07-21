import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import EditClientForm from "@/components/EditClientForm"; // Ensure this import is correct

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function EditClientPage({ params }) {
  const { id } = await params;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <section className="max-w-2xl mx-auto pb-16 animate-in fade-in duration-500">
      <header className="mb-8 md:mb-10 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <h2 className="text-3xl font-bold text-[#082019] dark:text-white">Edit Client</h2>
        <p className="text-black/50 dark:text-white/40 mt-1.5 text-sm">
          Update information for {client.name}.
        </p>
      </header>
      <EditClientForm client={client} />
    </section>
  );
}

