import InvoiceAnalysisChart from "@/components/InvoiceAnalysisChart";
import { supabaseAdmin } from "@/lib/supabase";
import EmptyFinanceState from "@/components/EmptyFinanceState";
import { getCachedServerSession } from "@/lib/session";
import Link from "next/link";
import { 
  DollarSign, 
  Clock, 
  FileText, 
  TrendingUp, 
  Plus, 
  Users, 
  Settings, 
  ArrowDownRight,
  ChevronRight
} from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  return (
    <DashboardContent lang={lang} />
  );
}

async function DashboardContent({ lang = "en" }) {
  const t = getTranslations(lang);
  const session = await getCachedServerSession();

  if (!session?.user?.id) {
    return (
      <div className="p-10 text-black/20 font-bold uppercase tracking-widest text-xs">
        {t.sessionLost}
      </div>
    );
  }

  const [invoicesResponse, clientsResponse] = await Promise.all([
    supabaseAdmin
      .from("invoices")
      .select(`id, invoice_number_full, total, status, created_at, clients ( name )`)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id),
  ]);

  const invoices = invoicesResponse.data;
  const clientCount = clientsResponse.count || 0;
  const hasPaidInvoices =
    invoices?.some((invoice) => invoice.status === "paid") || false;

  if (clientCount === 0 && !hasPaidInvoices) {
    return <EmptyFinanceState user={session.user} t={t} />;
  }

  const revenue = invoices?.reduce(
    (acc, inv) => {
      if (inv.status === "paid") acc.collected += inv.total;
      else acc.pending += inv.total;
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

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };
  const greeting = t[getGreetingKey()];

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

  // Sort invoices to display recent items first
  const recentInvoices = [...(invoices || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* Dynamic Header & Greeting */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {greeting},
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#082019] dark:text-white mt-1">
            {session.user.name || "User"}
          </h2>
          <p className="text-sm text-black/50 dark:text-white/40 mt-1.5">
            {t.studioOverview}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#fcfaf0] dark:bg-white/5 px-5 py-3.5 rounded-2xl border border-black/5 dark:border-white/5 sm:text-right">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-black/40 dark:text-white/30">
              {t.totalGrowth}
            </p>
            <div className="flex items-center gap-2 mt-1 sm:justify-end">
              <span className={`flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                growthDisplay.startsWith("-") 
                  ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" 
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              }`}>
                {growthDisplay.startsWith("-") ? <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                {growthDisplay}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Revenue Collected Card */}
        <div className="bg-[#082019] dark:bg-[#0e2a20] p-6 rounded-3xl shadow-md border border-emerald-500/10 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-emerald-500/5 group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
              {t.collectedRevenue}
            </p>
            <div className="p-2.5 bg-white/10 text-emerald-400 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mt-4 tracking-tight">
            ৳ {revenue.collected.toLocaleString()}
          </h3>
          <p className="text-[10px] text-white/40 mt-2 font-medium tracking-wide">
            {t.clearedTrans}
          </p>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-orange-500/5 group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <p className="text-black/40 dark:text-white/40 text-xs uppercase tracking-widest font-bold">
              {t.pendingAmount}
            </p>
            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-4xl font-bold mt-4 tracking-tight text-[#082019] dark:text-white">
            ৳ {revenue.pending.toLocaleString()}
          </h3>
          <p className="text-[10px] text-black/40 dark:text-white/40 mt-2 font-medium tracking-wide">
            {t.awaitingClearance}
          </p>
        </div>

        {/* Total Invoices Card */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-blue-500/5 group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <p className="text-black/40 dark:text-white/40 text-xs uppercase tracking-widest font-bold">
              {t.totalInvoices}
            </p>
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-4xl font-bold mt-4 tracking-tight text-[#082019] dark:text-white">
            {invoices?.length || 0}
          </h3>
          <p className="text-[10px] text-black/40 dark:text-white/40 mt-2 font-medium tracking-wide">
            {t.billingEntries}
          </p>
        </div>
      </div>

      {/* Grid Layout: Chart & Recent Activity VS Side Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Chart & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <InvoiceAnalysisChart data={analysisData} t={t} />
          
          {/* Recent Invoices Card */}
          <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#082019] dark:text-white">
                  {t.recentInvoices}
                </h3>
                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                  {t.recentTransactions}
                </p>
              </div>
              <Link 
                href="/dashboard/invoices" 
                className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {t.viewAll} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#fcfaf0] dark:bg-white/5 hover:bg-[#f8f5ea] dark:hover:bg-white/10 border border-black/5 dark:border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#082019] dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {inv.invoice_number_full || `Invoice #${inv.id.slice(0, 6)}`}
                      </p>
                      <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                        {inv.clients?.name || "Unknown Client"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#082019] dark:text-white">
                        ৳ {inv.total.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-black/30 dark:text-white/30 mt-0.5">
                        {new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      inv.status === "paid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                    }`}>
                      {inv.status === "paid" ? t.paidStatus : t.dueStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions & Details */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-[#082019] dark:text-white mb-4">
              {t.quickActions}
            </h3>
            
            <div className="space-y-3">
              <Link 
                href="/dashboard/invoices/new" 
                className="flex items-center gap-3.5 p-4 w-full rounded-2xl bg-[#082019] hover:bg-[#0c3127] text-white transition-all shadow-md active:scale-98 group"
              >
                <div className="p-2 bg-white/10 text-emerald-300 rounded-xl group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-wide">{t.createInvoice}</p>
                  <p className="text-[10px] text-white/50">{t.draftSendBillings}</p>
                </div>
              </Link>
              
              <Link 
                href="/dashboard/clients" 
                className="flex items-center gap-3.5 p-4 w-full rounded-2xl bg-[#fcfaf0] hover:bg-[#f8f5ea] dark:bg-white/5 dark:hover:bg-white/10 text-[#082019] dark:text-white border border-black/5 dark:border-white/5 transition-all active:scale-98 group"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-wide">{t.manageClients}</p>
                  <p className="text-[10px] text-black/40 dark:text-white/40">{t.onboardTrack}</p>
                </div>
              </Link>
              
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3.5 p-4 w-full rounded-2xl bg-[#fcfaf0] hover:bg-[#f8f5ea] dark:bg-white/5 dark:hover:bg-white/10 text-[#082019] dark:text-white border border-black/5 dark:border-white/5 transition-all active:scale-98 group"
              >
                <div className="p-2 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-wide">{t.accountSettings}</p>
                  <p className="text-[10px] text-black/40 dark:text-white/40">{t.configDefaults}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Helper / Visual Tip */}
          <div className="bg-[#FAF9F5] dark:bg-white/2 p-6 rounded-[2.5rem] border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col justify-center items-center text-center py-10 transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#082019] dark:text-white mb-1">
              {t.smartDelivery}
            </h4>
            <p className="text-xs text-black/40 dark:text-white/40 max-w-[200px] leading-relaxed">
              {t.smartDeliveryDesc}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
