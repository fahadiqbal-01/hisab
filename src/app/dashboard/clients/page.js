import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteClientButton from "@/components/DeleteClientButton";
import { Suspense } from "react";

async function ClientsList() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Optimization: Select only necessary columns to reduce database and network latency
  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("id, name, email")
    .eq("user_id", session.user.id)
    .order("name");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {clients?.map((client) => (
        <div
          key={client.id}
          className="bg-white dark:bg-[#0d0d0d] p-6 rounded-3xl border border-black/5 flex justify-between items-start"
        >
          <div>
            <h3 className="font-bold text-lg text-[#071f18] dark:text-orange-700 ">
              {client.name}
            </h3>
            <p className="text-sm text-black/40 dark:text-white ">
              {client.email}
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              prefetch={true}
              className="text-black/20 dark:text-blue-700 dark:hover:text-blue-400 hover:text-[#071f18] transition-colors"
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
  );
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  return (
    <section>
      {session?.user?.name && (
        <p className="text-[22px] font-bold uppercase text-orange-700 mb-4">
          {session.user.name}
        </p>
      )}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-3xl font-bold text-[#071f18] dark:text-white ">
          Clients
        </h2>
        <Link
          href="/dashboard/clients/new"
          prefetch={true}
          className="select-none cursor-pointer bg-[#071f18] dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-medium shadow-sm"
        >
          + Add Client
        </Link>
      </header>

      {/* 
          By using Suspense with fallback={null}, the header above renders 
          INSTANTLY. The list below pops in once Supabase responds.
      */}
      <Suspense fallback={null}>
        <ClientsList />
      </Suspense>
    </section>
  );
}
