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
    <section className="max-w-2xl">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-[#071f18]">Edit Client</h2>
        <p className="text-black/50 mt-1">
          Update information for {client.name}.
        </p>
      </header>
      <EditClientForm client={client} />
    </section>
  );
}
