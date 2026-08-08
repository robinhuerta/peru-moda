export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#090909" />
      <ellipse cx="20" cy="27" rx="15" ry="4.2" fill="#8f1d10" />
      <path
        d="M8.5 27 C8.5 15 13.5 7 20 7 C26.5 7 31.5 15 31.5 27 Z"
        fill="#d12a18"
      />
      <path
        d="M20 9.5 C20 15 20 21 20 26.5"
        stroke="#ef5d4a"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M13.5 12.5 C15.5 18 15.8 22.5 15.3 26.5"
        stroke="#ef5d4a"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M26.5 12.5 C24.5 18 24.2 22.5 24.7 26.5"
        stroke="#ef5d4a"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
        fill="none"
      />
      <circle cx="20" cy="7.4" r="1.7" fill="#090909" />
      <circle cx="20" cy="7.4" r="1.7" fill="none" stroke="#ef5d4a" strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-xl font-black tracking-tight text-ink">
        Perú<span className="text-[#d12a18]">&</span>Moda
      </span>
    </span>
  );
}
