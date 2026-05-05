export default function ClientsLoading() {
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
