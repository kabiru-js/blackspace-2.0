export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--black)" }}>
      <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(5,5,6,.6)", backdropFilter: "blur(14px)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <div className="w-20 h-5 rounded animate-pulse" style={{ background: "var(--card)" }} />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-20 flex flex-col items-center">
        <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, var(--card2), var(--card))", border: "1px solid var(--line-strong)" }}>
          <div className="h-[45%] animate-pulse" style={{ background: "var(--card)" }} />
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <div className="w-24 h-4 rounded animate-pulse" style={{ background: "var(--card)" }} />
              <div className="w-20 h-4 rounded animate-pulse" style={{ background: "var(--card)" }} />
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 rounded animate-pulse" style={{ background: "var(--card)" }} />
              <div className="w-3/4 h-3 rounded animate-pulse" style={{ background: "var(--card)" }} />
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-6 rounded-full animate-pulse" style={{ background: "var(--card)" }} />
              <div className="w-20 h-6 rounded-full animate-pulse" style={{ background: "var(--card)" }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-6">
          <div className="w-14 h-14 rounded-full animate-pulse" style={{ background: "var(--card)", border: "1px solid var(--line-strong)" }} />
          <div className="w-14 h-14 rounded-full animate-pulse" style={{ background: "var(--card)", border: "1px solid var(--line-strong)" }} />
        </div>
      </div>
    </div>
  );
}
