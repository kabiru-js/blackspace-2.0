export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <div className="w-20 h-5 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-20 flex flex-col items-center">
        {/* Card skeleton */}
        <div className="w-full max-w-sm aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="h-[45%] bg-zinc-800 animate-pulse" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 bg-zinc-800 rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-6 bg-zinc-800 rounded-md animate-pulse" />
              <div className="w-20 h-6 bg-zinc-800 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
