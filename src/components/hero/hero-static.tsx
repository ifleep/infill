export function HeroStaticVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-hero-bg">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(59,116,240,0.4), transparent 55%), radial-gradient(circle at 75% 70%, rgba(230,138,58,0.22), transparent 50%)",
        }}
      />
      <svg
        viewBox="0 0 320 320"
        className="relative h-[65%] w-auto max-w-[420px] opacity-95"
        aria-hidden="true"
      >
        <g stroke="#4d7bd6" strokeWidth="1.5" fill="none" opacity="0.7">
          <rect x="60" y="40" width="200" height="220" rx="4" />
          <line x1="60" y1="90" x2="260" y2="90" />
          <line x1="90" y1="40" x2="90" y2="260" />
          <line x1="230" y1="40" x2="230" y2="260" />
        </g>
        <rect x="80" y="210" width="160" height="14" rx="3" fill="#efe9df" />
        <rect x="70" y="224" width="180" height="10" rx="2" fill="#23262c" />
        <rect x="140" y="95" width="40" height="24" rx="3" fill="#3a3f48" />
        <rect x="152" y="119" width="16" height="20" fill="#8b93a0" />
        <path d="M155 139 L165 139 L160 154 Z" fill="#b8863b" />
        <circle cx="90" cy="65" r="9" fill="#111318" />
        <circle cx="230" cy="65" r="9" fill="#111318" />
        <rect x="130" y="130" width="60" height="70" rx="2" fill="#2f58ae" opacity="0.5" />
      </svg>
    </div>
  );
}
