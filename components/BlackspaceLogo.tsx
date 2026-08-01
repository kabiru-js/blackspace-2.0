export function BlackspaceLogo() {
  return (
    <svg viewBox="0 0 420 96" width="294" height="67" xmlns="http://www.w3.org/2000/svg" aria-label="Blackspace">
      <defs>
        <filter id="logoGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="logoVoid" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A0A2E" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#06060C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="38" stroke="#D8D4CC" strokeWidth="1.1" fill="none" />
      <ellipse cx="48" cy="48" rx="38" ry="12" stroke="#3E3E52" strokeWidth="0.9" fill="none" transform="rotate(-20 48 48)" />
      <circle cx="48" cy="48" r="22" fill="url(#logoVoid)" />
      <circle cx="48" cy="48" r="8" stroke="#2A2A3E" strokeWidth="0.75" fill="none" />
      <circle cx="83.7" cy="35" r="3.2" fill="#8B5CF6" filter="url(#logoGlow)" />
      <circle cx="83.7" cy="35" r="1.8" fill="#C4B5FD" />
      <circle cx="12.3" cy="61" r="1.4" fill="#5B21B6" opacity="0.55" />
      <text x="112" y="49" fontFamily="'Inter', system-ui, -apple-system, sans-serif" fontWeight="300" fontSize="19" fill="#D8D4CC" dominantBaseline="middle" style={{ letterSpacing: '0.26em' }}>BLACKSPACE</text>
    </svg>
  );
}
