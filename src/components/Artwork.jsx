export function BalloonArt({ id }) {
  return <svg viewBox="0 0 120 195" aria-hidden="true">
    <defs>
      <radialGradient id={`balloon-color-${id}`} cx=".3" cy=".25" r=".85"><stop stopColor="#ffc6ce" /><stop offset=".4" stopColor="#d87590" /><stop offset="1" stopColor="#9a3d63" /></radialGradient>
      <radialGradient id={`balloon-volume-${id}`} cx=".34" cy=".27" r=".75"><stop style={{ stopColor: 'white' }} stopOpacity=".25" /><stop offset=".48" style={{ stopColor: 'white' }} stopOpacity="0" /><stop offset=".84" style={{ stopColor: '#070519' }} stopOpacity=".35" /><stop offset="1" style={{ stopColor: '#070519' }} stopOpacity=".82" /></radialGradient>
      <linearGradient id={`balloon-edge-${id}`} x1="0" y1="0" x2="1" y2="1"><stop style={{ stopColor: 'white' }} stopOpacity=".75" /><stop offset=".5" style={{ stopColor: 'white' }} stopOpacity="0" /><stop offset="1" style={{ stopColor: 'white' }} stopOpacity=".4" /></linearGradient>
      <clipPath id={`balloon-clip-${id}`}><ellipse cx="60" cy="61" rx="46" ry="57" /></clipPath>
    </defs>
    <path d="M60 116Q44 135 61 150T58 193" fill="none" stroke="#ab8b83" />
    <path d="M55 115L65 115L67 122L53 122Z" fill="#a94467" />
    <ellipse cx="60" cy="61" rx="46" ry="57" fill={`url(#balloon-color-${id})`} />
    <ellipse cx="60" cy="61" rx="46" ry="57" fill={`url(#balloon-volume-${id})`} stroke={`url(#balloon-edge-${id})`} strokeWidth="1.2" />
    <g clipPath={`url(#balloon-clip-${id})`} fill="none" stroke="white" strokeWidth=".6" opacity=".12"><ellipse cx="60" cy="61" rx="27" ry="57" /><ellipse cx="60" cy="61" rx="45" ry="24" /><path d="M14 44Q60 71 106 44M14 79Q60 106 106 79" /></g>
    <ellipse cx="39" cy="30" rx="9" ry="18" fill="white" opacity=".65" transform="rotate(30 39 30)" />
    <ellipse cx="48" cy="19" rx="3" ry="6" fill="white" opacity=".65" transform="rotate(45 48 19)" />
    <path d="M85 82Q80 99 66 105" fill="none" stroke="white" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
    <text x="62" y="81" textAnchor="middle" fontSize="38" fill="#080719" opacity=".3">♡</text>
    <text x="60" y="78" textAnchor="middle" fontSize="38" fill="white" opacity=".95">♡</text>
  </svg>;
}

export function BowArt() {
  return <svg viewBox="0 0 110 120" aria-hidden="true">
    <path d="M36 8Q104 60 36 112" fill="none" stroke="#986449" strokeWidth="5" strokeLinecap="round" />
    <path d="M36 8L14 60L36 112" fill="none" stroke="#be9c7e" strokeWidth="1.5" />
    <path d="M66 50L69 69" stroke="#673c39" strokeWidth="6" />
    <path d="M15 60H105M96 54L106 60L96 66M15 60L5 53M15 60L5 67" fill="none" stroke="#8c455b" strokeWidth="2" />
  </svg>;
}
