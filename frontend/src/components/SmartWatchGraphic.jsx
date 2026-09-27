// High-fidelity SVG reproduction of the Figma MegaMart "Smart Wearable" Noise-style smartwatch

export default function SmartWatchGraphic({ width = 230, height = 230 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 16px 32px rgba(0, 0, 0, 0.45))' }}
      aria-label="Smart Wearable Watch"
    >
      <defs>
        {/* Bezel Gold Gradient */}
        <linearGradient id="goldBezel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F6D5A8" />
          <stop offset="35%" stopColor="#D8A56E" />
          <stop offset="70%" stopColor="#F9DFB8" />
          <stop offset="100%" stopColor="#B37E47" />
        </linearGradient>

        {/* Strap Navy Gradient */}
        <linearGradient id="strapNavy" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#25324E" />
          <stop offset="50%" stopColor="#3B4C72" />
          <stop offset="100%" stopColor="#1E283E" />
        </linearGradient>

        {/* Screen Glass Reflection */}
        <linearGradient id="screenGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#121824" />
          <stop offset="100%" stopColor="#080C14" />
        </linearGradient>
      </defs>

      {/* ── Top Strap ── */}
      <path
        d="M 68 85 C 68 30, 80 10, 120 10 C 160 10, 172 30, 172 85 Z"
        fill="url(#strapNavy)"
      />
      {/* Top Strap subtle ridge texture */}
      <path d="M 78 40 Q 120 45 162 40" stroke="#485B84" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M 75 55 Q 120 60 165 55" stroke="#485B84" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M 72 70 Q 120 75 168 70" stroke="#485B84" strokeWidth="1.5" fill="none" opacity="0.4" />

      {/* ── Bottom Strap ── */}
      <path
        d="M 68 155 C 68 215, 85 235, 120 235 C 155 235, 172 215, 172 155 Z"
        fill="url(#strapNavy)"
      />
      {/* Bottom Strap texture & buckle pin slot */}
      <path d="M 72 170 Q 120 165 168 170" stroke="#485B84" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M 75 185 Q 120 180 165 185" stroke="#485B84" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M 78 200 Q 120 195 162 200" stroke="#485B84" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="120" cy="205" r="4" fill="#1A2234" />

      {/* ── Watch Case: Rose Gold Bezel ── */}
      <rect
        x="50"
        y="55"
        width="140"
        height="130"
        rx="28"
        fill="url(#goldBezel)"
        stroke="#966835"
        strokeWidth="1.5"
      />

      {/* Digital Crown Button on Right */}
      <rect
        x="190"
        y="100"
        width="7"
        height="26"
        rx="3.5"
        fill="url(#goldBezel)"
        stroke="#7A5025"
        strokeWidth="1"
      />

      {/* ── OLED Display Area ── */}
      <rect
        x="57"
        y="62"
        width="126"
        height="116"
        rx="22"
        fill="url(#screenGlass)"
        stroke="#1E2738"
        strokeWidth="1"
      />

      {/* ── Screen UI Content (matching Figma Noise smartwatch display) ── */}

      {/* Top Status Bar: Running target pill */}
      <rect x="70" y="74" width="34" height="11" rx="5.5" fill="#008ECC" fillOpacity="0.25" />
      <circle cx="76" cy="79.5" r="2.5" fill="#00D2FF" />
      <text x="82" y="82.5" fill="#00D2FF" fontSize="7" fontWeight="bold" fontFamily="monospace">8000</text>

      {/* Main Digital Clock: 08:26:00 */}
      <text
        x="120"
        y="112"
        fill="#FFFFFF"
        fontSize="21"
        fontWeight="800"
        fontFamily="'Inter', -apple-system, sans-serif"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        08:26<tspan fontSize="12" fill="#00D2FF">:00</tspan>
      </text>

      {/* Middle row: Heart Rate & Date */}
      {/* Heart icon */}
      <path
        d="M 72 128 C 72 125, 75 124, 76.5 126 C 78 124, 81 125, 81 128 C 81 131, 76.5 133.5, 76.5 133.5 C 76.5 133.5, 72 131, 72 128 Z"
        fill="#FF3B30"
      />
      <text x="85" y="131" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">102</text>

      {/* Date: SAT 04/06 */}
      <rect x="110" y="122" width="58" height="13" rx="3" fill="#1C273C" />
      <text x="139" y="132" fill="#E2E8F0" fontSize="8.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">
        SAT 04/06
      </text>

      {/* Bottom Row: Battery & Step Counter */}
      {/* Battery */}
      <rect x="70" y="145" width="18" height="9" rx="2" stroke="#249B3E" strokeWidth="1" fill="none" />
      <rect x="72" y="147" width="14" height="5" rx="1" fill="#249B3E" />
      <text x="92" y="152" fill="#249B3E" fontSize="8" fontWeight="bold">100%</text>

      {/* Step count */}
      <text x="142" y="152" fill="#00D2FF" fontSize="9" fontWeight="bold">234</text>
      <circle cx="158" cy="149" r="2" fill="#FF9500" />
    </svg>
  );
}
