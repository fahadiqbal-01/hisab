import InvoiceAnalysisChart from "@/components/InvoiceAnalysisChart";
import { supabaseAdmin } from "@/lib/supabase";
import EmptyFinanceState from "@/components/EmptyFinanceState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const revalidate = 0;

export default async function DashboardPage() {
  return <DashboardContent />;
}

async function DashboardContent() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase tracking-widest text-xs">
        Session lost. Please refresh or re-login.
      </div>
    );
  }

  const [invoicesResponse, clientsResponse] = await Promise.all([
    supabaseAdmin
      .from("invoices")
      .select(`id, total, status, created_at, clients ( name )`)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id),
  ]);

  const invoices = invoicesResponse.data;
  const clientCount = clientsResponse.count || 0;

  if (clientCount === 0) {
    return <EmptyFinanceState />;
  }

  const revenue = invoices?.reduce(
    (acc, inv) => {
      if (inv.status === "paid") acc.collected += inv.total;
      if (inv.status === "due") acc.pending += inv.total;
      return acc;
    },
    { collected: 0, pending: 0 },
  ) || { collected: 0, pending: 0 };

  const calculateGrowth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const currentMonthRevenue =
      invoices
        ?.filter((inv) => {
          const d = new Date(inv.created_at);
          return (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear &&
            inv.status === "paid"
          );
        })
        .reduce((sum, inv) => sum + inv.total, 0) || 0;

    const lastMonthRevenue =
      invoices
        ?.filter((inv) => {
          const d = new Date(inv.created_at);
          return (
            d.getMonth() === lastMonth &&
            d.getFullYear() === lastMonthYear &&
            inv.status === "paid"
          );
        })
        .reduce((sum, inv) => sum + inv.total, 0) || 0;

    if (lastMonthRevenue === 0) return currentMonthRevenue > 0 ? "100%" : "0%";
    const growth =
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    return `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  const growthDisplay = calculateGrowth();

  const analysisData =
    invoices?.map((inv) => {
      const d = new Date(inv.created_at);
      return {
        date: d
          .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          .toUpperCase(),
        amount: inv.total,
        client: inv.clients?.name || "Unknown Client",
        status: inv.status,
      };
    }) || [];

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 ">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#071f18] dark:text-white">
            Finance Overview
          </h2>
          <p className="text-black/50 dark:text-white/40 mt-1">
            Real-time performance for {session?.user?.name || "your studio"}.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-black/30 dark:text-white/30">
            Total Growth
          </p>
          <p className="text-xl font-serif italic text-[#071f18] dark:text-white">
            {growthDisplay} vs last month
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#071f18] dark:bg-green-700  p-8 rounded-3xl shadow-sm">
          <p className="text-white dark:text-white opacity-50 text-xs uppercase tracking-widest font-bold text-[10px]">
            Revenue Collected
          </p>
          <h3 className=" text-white text-4xl font-bold mt-2">
            ৳ {revenue.collected.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
          <p className="text-black/30 dark:text-white/70 text-xs uppercase tracking-widest font-bold text-[10px]">
            Pending Payment
          </p>
          <h3 className="text-4xl font-bold mt-2 text-[#071f18] dark:text-white">
            ৳ {revenue.pending.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white dark:bg-[#0d0d0d] p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
          <p className="text-black/30 dark:text-white/70 text-xs uppercase tracking-widest font-bold text-[10px]">
            Total Invoices
          </p>
          <h3 className="text-4xl font-bold mt-2 text-[#071f18] dark:text-white">
            {invoices?.length || 0}
          </h3>
        </div>
      </div>

      <InvoiceAnalysisChart data={analysisData} />
    </div>
  );
}
