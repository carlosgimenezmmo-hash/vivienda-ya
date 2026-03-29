export function LogoYah({ size = 24, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="24" fill="#0a0a0a"/>
        <text x="24" y="33" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="22" fontWeight="700" fill="#22C55E" textAnchor="middle">Y</text>
      </svg>
      {showText && (
        <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", fontSize: size * 0.75, letterSpacing: -0.5 }}>
          <span style={{ fontWeight: 300, color: "inherit" }}>Yah</span>
          <span style={{ fontWeight: 700, color: "#22C55E" }}>!</span>
        </span>
      )}
    </div>
  )
}