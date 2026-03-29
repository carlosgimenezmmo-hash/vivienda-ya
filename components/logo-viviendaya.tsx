export function LogoViviendaYa({ size = 24, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="24" fill="#22C55E"/>
        <polyline points="24,10 8,22 40,22" stroke="white" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        <rect x="12" y="22" width="24" height="18" rx="2" stroke="white" strokeWidth="2.5" fill="none"/>
        <rect x="19" y="27" width="10" height="13" rx="1" fill="white"/>
      </svg>
      {showText && (
        <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", fontSize: size * 0.75, letterSpacing: -0.5 }}>
          <span style={{ fontWeight: 300, color: "inherit" }}>Vivienda</span>
          <span style={{ fontWeight: 700, color: "#22C55E" }}>Ya</span>
        </span>
      )}
    </div>
  )
}