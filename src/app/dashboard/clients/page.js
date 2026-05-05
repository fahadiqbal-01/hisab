import { Suspense } from "react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteClientButton from "@/components/DeleteClientButton";

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsSkeleton />}>
      <ClientsContent />
    </Suspense>
  );
}

async function ClientsContent() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("user_id", session.user.id)
    .order("name");

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-3xl font-bold text-[#071f18] dark:text-white ">
          Clients
        </h2>
        <Link
          href="/dashboard/clients/new"
          className="select-none cursor-pointer bg-[#071f18] dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-medium shadow-sm"
        >
          + Add Client
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients?.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-[#0d0d0d] p-6 rounded-3xl border border-black/5 flex justify-between items-start"
          >
            <div>
              <h3 className="font-bold text-lg text-[#071f18 dark:text-orange-700 ">
                {client.name}
              </h3>
              <p className="text-sm text-black/40 dark:text-white ">
                {client.email}
              </p>
              <p className="text-xs text-black/30 dark:text-white mt-2 font-mono uppercase tracking-tighter">
                {client.preferred_payment_method}: {client.payment_number}
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <Link
                href={`/dashboard/clients/${client.id}/edit`}
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
    </motion.section>
  );
}

function ClientsSkeleton() {
  return (
    <section className="animate-pulse">
      <header className="flex justify-between items-center mb-10">
        <div className="h-10 w-32 bg-black/5 dark:bg-white/5 rounded-xl" />
        <div className="h-10 w-32 bg-black/5 dark:bg-white/5 rounded-full" />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-black/5 dark:bg-white/5 h-40 rounded-3xl border border-black/5"
          />
        ))}
      </div>
    </section>
  );
}
