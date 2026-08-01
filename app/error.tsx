"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--black)" }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,46,159,.1)", border: "1px solid rgba(255,46,159,.2)" }}>
          <span className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--magenta)" }}>!</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text)" }}>Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button onClick={reset} className="btn btn-primary" style={{ padding: "10px 20px" }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
