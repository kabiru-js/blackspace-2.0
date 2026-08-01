export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--black)" }}>
      <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(5,5,6,.6)", backdropFilter: "blur(14px)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <div className="w-24 h-5 rounded animate-pulse" style={{ background: "var(--card)" }} />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, var(--card2), var(--card))", border: "1px solid var(--line-strong)" }}>
            <div className="h-32 animate-pulse" style={{ background: "var(--card)" }} />
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-20 h-3 rounded animate-pulse" style={{ background: "var(--card)" }} />
                <div className="w-24 h-3 rounded animate-pulse" style={{ background: "var(--card)" }} />
              </div>
              <div className="w-full h-4 rounded animate-pulse" style={{ background: "var(--card)" }} />
              <div className="flex gap-2 pt-1">
                <div className="flex-1 h-10 rounded-full animate-pulse" style={{ background: "var(--card)" }} />
                <div className="flex-1 h-10 rounded-full animate-pulse" style={{ background: "var(--card)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
