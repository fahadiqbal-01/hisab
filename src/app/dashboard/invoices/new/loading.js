export default function NewInvoiceLoading() {
  return (
    <div className="max-w-4xl px-4 md:px-0 pb-10 animate-pulse">
      <div className="h-10 w-56 rounded-xl bg-black/10 dark:bg-white/10  mb-3" />
      <div className="h-5 w-72 rounded-xl bg-black/10 dark:bg-white/10  mb-10" />
      <div className="rounded-2xl border border-black/5 bg-white dark:bg-[#0d0d0d] p-8 space-y-4">
        <div className="h-4 w-32 rounded bg-black/10 dark:bg-white/10 " />
        <div className="h-12 w-full rounded-xl bg-black/10 dark:bg-white/10 " />
        <div className="h-4 w-28 rounded bg-black/10 dark:bg-white/10  mt-6" />
        <div className="h-12 w-full rounded-xl bg-black/10 dark:bg-white/10 " />
        <div className="h-12 w-full rounded-xl bg-black/10 dark:bg-white/10 " />
      </div>
    </div>
  );
}
