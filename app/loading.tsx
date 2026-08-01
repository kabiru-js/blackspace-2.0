export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--black)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--lime)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--faint)" }}>Loading...</p>
      </div>
    </div>
  );
}
