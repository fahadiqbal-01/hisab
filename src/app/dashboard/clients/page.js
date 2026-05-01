import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteClientButton from "@/components/DeleteClientButton";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("user_id", session.user.id)
    .order("name");

  return (
    <section>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-3xl font-bold text-[#071f18]">Clients</h2>
        <Link
          href="/dashboard/clients/new"
          className="bg-[#071f18] text-white px-6 py-2 rounded-full font-medium shadow-sm"
        >
          + Add Client
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients?.map((client) => (
          <div
            key={client.id}
            className="bg-white p-6 rounded-3xl border border-black/5 flex justify-between items-start"
          >
            <div>
              <h3 className="font-bold text-lg text-[#071f18]">
                {client.name}
              </h3>
              <p className="text-sm text-black/40">{client.email}</p>
              <p className="text-xs text-black/30 mt-2 font-mono uppercase tracking-tighter">
                {client.preferred_payment_method}: {client.payment_number}
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <Link
                href={`/dashboard/clients/${client.id}/edit`}
                className="text-black/20 hover:text-[#071f18] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Link>
              <DeleteClientButton id={client.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
