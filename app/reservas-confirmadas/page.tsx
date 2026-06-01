"use client"
import { useRouter } from "next/navigation"

export default function ReservasConfirmadasPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Reserva confirmada</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, textAlign: "center", margin: "0 0 8px", lineHeight: 1.5 }}>
        Tu reserva fue registrada correctamente.
      </p>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", margin: "0 0 36px", lineHeight: 1.5 }}>
        El propietario recibira una notificacion y se pondra en contacto con vos.
      </p>

      <button onClick={() => router.push("/feed")} style={{
        width: "100%", maxWidth: 340, padding: "16px", borderRadius: 14, border: "none",
        background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
        color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        marginBottom: 12,
      }}>
        Volver al feed
      </button>

      <button onClick={() => router.push("/mis-reservas")} style={{
        width: "100%", maxWidth: 340, padding: "15px", borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600,
        cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        Ver mis reservas
      </button>
    </div>
  )
}