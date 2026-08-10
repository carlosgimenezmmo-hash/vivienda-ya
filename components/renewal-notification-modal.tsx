"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

interface PendingRenewal {
  id: string
  title: string
  renewal_token: string
  renewal_notified_at: string
}

export function RenewalNotificationModal() {
  const { isLoggedIn, user } = useAuth()
  const [pendingRenewals, setPendingRenewals] = useState<PendingRenewal[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return
    checkPendingRenewals()
  }, [isLoggedIn, user?.id])

  const checkPendingRenewals = async () => {
    try {
      setIsLoading(true)
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Buscar propiedades pendientes de renovación (notificadas en las últimas 24h, sin confirmar)
      const { data, error: queryError } = await supabase
        .from("properties")
        .select("id, title, renewal_token, renewal_notified_at")
        .eq("user_id", user.id)
        .eq("listing_status", "activa")
        .not("renewal_notified_at", "is", null)
        .gt("renewal_notified_at", twentyFourHoursAgo.toISOString())
        .is("last_confirmed_at", null)

      if (queryError) throw queryError

      if (data && data.length > 0) {
        setPendingRenewals(data)
        setIsOpen(true)
        setCurrentIndex(0)
      } else {
        setPendingRenewals([])
      }
    } catch (err: any) {
      console.error("Error checking renewals:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenewalAction = async (action: "confirmar" | "finalizar") => {
    if (!pendingRenewals[currentIndex]) return

    try {
      setIsProcessing(true)
      setError("")

      const renewal = pendingRenewals[currentIndex]
      const response = await fetch("/api/renovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: renewal.renewal_token,
          action,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al procesar la solicitud")
      }

      // Remover la propiedad renovada de la lista
      const newRenewals = pendingRenewals.filter((_, idx) => idx !== currentIndex)
      setPendingRenewals(newRenewals)

      if (newRenewals.length === 0) {
        setIsOpen(false)
      } else if (currentIndex >= newRenewals.length) {
        setCurrentIndex(0)
      }
    } catch (err: any) {
      console.error("Error processing renewal:", err)
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen || pendingRenewals.length === 0) {
    return null
  }

  const current = pendingRenewals[currentIndex]
  const total = pendingRenewals.length
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Progress indicator */}
        {total > 1 && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                height: "4px",
                background: "#e5e7eb",
                borderRadius: "2px",
                overflow: "hidden",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "#3b82f6",
                  width: `${progress}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#999",
                margin: 0,
                textAlign: "center",
              }}
            >
              Propiedad {currentIndex + 1} de {total}
            </p>
          </div>
        )}

        {/* Header */}
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#0a0a0a",
          }}
        >
          Tu propiedad necesita renovación
        </h2>

        <p
          style={{
            margin: "0 0 24px",
            fontSize: "14px",
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          <strong>"{current.title}"</strong> ha estado publicada por más de 7 días.
          ¿Sigue disponible?
        </p>

        {/* Warning box */}
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#92400e",
              lineHeight: 1.5,
            }}
          >
            <strong>⏰ Importante:</strong> Si no confirmas en 24 horas, se dará de baja
            automáticamente.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={() => handleRenewalAction("confirmar")}
            disabled={isProcessing}
            style={{
              flex: 1,
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) (e.target as HTMLButtonElement).style.background = "#16a34a"
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) (e.target as HTMLButtonElement).style.background = "#22c55e"
            }}
          >
            {isProcessing ? "Procesando..." : "✓ Sigue disponible"}
          </button>

          <button
            onClick={() => handleRenewalAction("finalizar")}
            disabled={isProcessing}
            style={{
              flex: 1,
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) (e.target as HTMLButtonElement).style.background = "#4b5563"
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) (e.target as HTMLButtonElement).style.background = "#6b7280"
            }}
          >
            {isProcessing ? "Procesando..." : "✗ Ya se vendió"}
          </button>
        </div>

        {/* Skip option if multiple properties */}
        {total > 1 && (
          <button
            onClick={() => {
              const newIndex = currentIndex + 1
              if (newIndex < total) {
                setCurrentIndex(newIndex)
              } else {
                setIsOpen(false)
              }
            }}
            disabled={isProcessing}
            style={{
              width: "100%",
              background: "transparent",
              color: "#666",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.background = "#f9f9f9"
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.background = "transparent"
              }
            }}
          >
            Después
          </button>
        )}

        {total === 1 && (
          <button
            onClick={() => setIsOpen(false)}
            disabled={isProcessing}
            style={{
              width: "100%",
              background: "transparent",
              color: "#666",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.background = "#f9f9f9"
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                (e.target as HTMLButtonElement).style.background = "transparent"
              }
            }}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  )
}
