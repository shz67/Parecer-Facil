export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#logo-g)" />
      <rect x="148" y="112" width="216" height="280" rx="36" fill="#fff" />
      <rect x="188" y="168" width="136" height="20" rx="10" fill="#C7D2FE" />
      <rect x="188" y="214" width="104" height="20" rx="10" fill="#C7D2FE" />
      <rect x="188" y="260" width="120" height="20" rx="10" fill="#C7D2FE" />
      <circle cx="356" cy="364" r="76" fill="#10B981" stroke="#4F46E5" strokeWidth="18" />
      <path d="M322 366l24 24 46-50" fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
