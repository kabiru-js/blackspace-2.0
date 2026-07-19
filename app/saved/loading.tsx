export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <div className="w-24 h-5 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="h-32 bg-zinc-800 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-20 h-3 bg-zinc-800 rounded animate-pulse" />
                <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="w-full h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="flex-1 h-10 bg-zinc-800 rounded-xl animate-pulse" />
                <div className="flex-1 h-10 bg-zinc-800 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
