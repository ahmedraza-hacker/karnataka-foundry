type FanIllustrationProps = {
  variant?: "hero" | "card";
};

export function FanIllustration({ variant = "card" }: FanIllustrationProps) {
  const hero = variant === "hero";

  return (
    <svg
      aria-hidden="true"
      className={hero ? "fan-illustration fan-illustration-hero" : "fan-illustration"}
      viewBox="0 0 480 480"
      fill="none"
    >
      <defs>
        <linearGradient id="fan-metal" x1="100" y1="72" x2="375" y2="402" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e2e1dc" />
          <stop offset=".48" stopColor="#85898a" />
          <stop offset="1" stopColor="#343a3c" />
        </linearGradient>
        <radialGradient id="fan-hub">
          <stop stopColor="#c7c8c4" />
          <stop offset=".54" stopColor="#74797a" />
          <stop offset="1" stopColor="#34393b" />
        </radialGradient>
      </defs>
      <circle cx="240" cy="240" r="198" stroke="currentColor" opacity=".14" />
      <circle cx="240" cy="240" r="165" stroke="currentColor" opacity=".18" />
      <circle cx="240" cy="240" r="144" fill="#272c2e" stroke="url(#fan-metal)" strokeWidth="4" />
      <g fill="url(#fan-metal)" stroke="#d8d7d1" strokeOpacity=".28" strokeWidth="1.5">
        <path d="M240 226c-19-67-25-114-8-145 11-20 40-17 47 5 10 29-8 85-25 143z" />
        <path d="M240 226c-19-67-25-114-8-145 11-20 40-17 47 5 10 29-8 85-25 143z" transform="rotate(60 240 240)" />
        <path d="M240 226c-19-67-25-114-8-145 11-20 40-17 47 5 10 29-8 85-25 143z" transform="rotate(120 240 240)" />
        <path d="M240 226c-19-67-25-114-8-145 11-20 40-17 47 5 10 29-8 85-25 143z" transform="rotate(180 240 240)" />
        <path d="M240 226c-19-67-25-114-8-145 11-20 40-17 47 5 10 29-8 85-25 143z" transform="rotate(240 240 240)" />
        <path d="M240 226c-19-67-25-114-8-145 11-20 40-17 47 5 10 29-8 85-25 143z" transform="rotate(300 240 240)" />
      </g>
      <circle cx="240" cy="240" r="36" fill="url(#fan-hub)" stroke="#d9d8d2" strokeOpacity=".45" strokeWidth="2" />
      <circle cx="240" cy="240" r="10" fill="#272c2e" stroke="#d9d8d2" strokeOpacity=".4" strokeWidth="2" />
      <circle cx="240" cy="240" r="183" stroke="#c77d45" strokeOpacity=".55" strokeDasharray="2 13" />
    </svg>
  );
}
