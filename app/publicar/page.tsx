"use client"

import { useState } from "react"
import { useProtectedAction } from "@/lib/protected-action-context"
import {
  Video, Zap, Crown, ShieldCheck, ArrowRight, Check, Coins,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { CameraSimulator } from "@/components/camera-simulator"
import type { ArryseMode } from "@/lib/types"

const arryseModes: {
  mode: ArryseMode
  label: string
  description: string
  details: string
  icon: typeof Video
  cost: number
  colorClass: string
}[] = [
  {
    mode: "clasico",
    label: "ARRYSE Clasico",
    description: "Video completo de 3 minutos",
    details: "6 pasos guiados con verificacion GPS",
    icon: Video,
    cost: 0,
    colorClass: "border-vy-green bg-vy-green/5",
  },
  {
    mode: "express",
    label: "ARRYSE Express",
    description: "5 clips de 10 segundos",
    details: "Rapido y efectivo para publicar al instante",
    icon: Zap,
    cost: 0,
    colorClass: "border-vy-blue bg-vy-blue/5",
  },
  {
    mode: "pro",
    label: "ARRYSE Pro",
    description: "Video de 5 min + fotos 360",
    details: "Maxima calidad para propiedades premium",
    icon: Crown,
    cost: 5,
    colorClass: "border-vy-gold bg-vy-gold/5",
  },
]

export default function PublicarPage() {
  const { isLoggedIn, user, spendCredits } = useAuth()
  const [lang, setLang] = useState<"es" | "pt">(() => {
    if (typeof navigator !== "undefined") {
      return navigator.language.startsWith("pt") ? "pt" : "es"
    }
    return "es"
  })
  const { handleProtectedAction } = useProtectedAction()
  const [selectedMode, setSelectedMode] = useState<ArryseMode | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingComplete, setRecordingComplete] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pb-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Inicia sesion para publicar</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Necesitas una cuenta para publicar propiedades con el sistema ARRYSE verificado por GPS
        </p>
      </div>
    )
  }

  if (isRecording && selectedMode) {
    return (
      <CameraSimulator
        mode={selectedMode}
        onComplete={() => {
          setIsRecording(false)
          setRecordingComplete(true)
        }}
        onCancel={() => {
          setIsRecording(false)
          setSelectedMode(null)
        }}
      />
    )
  }

  if (recordingComplete) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pb-20">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-vy-green/10">
          <Check className="h-12 w-12 text-vy-green" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Grabacion completada!</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Tu video fue verificado con ARRYSE GPS y esta siendo procesado. Aparecera en el feed en minutos.
        </p>
        <div className="mt-3 flex items-center gap-1.5 rounded-full bg-vy-green/10 px-3 py-1.5 text-xs font-semibold text-vy-green">
          <Coins className="h-3.5 w-3.5" />
          +1 credito ganado por verificacion ARRYSE
        </div>
        <button
          onClick={() => {
            setRecordingComplete(false)
            setSelectedMode(null)
          }}
          className="mt-8 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
        >
          Publicar otra propiedad
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Publicar propiedad</h1>
        <p className="text-xs text-muted-foreground">
          Graba tu propiedad con el sistema ARRYSE verificado por GPS
        </p>
      </header>

      {/* ARRYSE explanation */}
      <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl bg-vy-green/5 border border-vy-green/20 p-4">
        <ShieldCheck className="mt-0.5 h-8 w-8 shrink-0 text-vy-green" />
        <div>
          <h3 className="text-sm font-bold text-foreground">Sistema ARRYSE</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Usa el GPS de tu celular para verificar que la propiedad existe en la ubicacion donde estas grabando. Seguiras pasos guiados para mostrar cada ambiente.
          </p>
        </div>
      </div>

      {/* Credits indicator */}
      <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-secondary px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Tu saldo</span>
        <span className="flex items-center gap-1 text-sm font-bold text-foreground">
          <Coins className="h-4 w-4 text-vy-gold" />
          {user?.credits || 0} creditos
        </span>
      </div>

      {/* Mode selection */}
      <div className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-bold text-foreground uppercase tracking-wide">
          Elige tu tipo de grabacion
        </h2>
        <div className="flex flex-col gap-3">
          {arryseModes.map((am) => {
            const Icon = am.icon
            const isSelected = selectedMode === am.mode
            const canAfford = am.cost === 0 || (user?.credits || 0) >= am.cost

            return (
              <button
                key={am.mode}
                onClick={() => setSelectedMode(am.mode)}
                disabled={!canAfford}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                  isSelected ? am.colorClass : "border-border bg-card",
                  !canAfford && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    am.mode === "pro" ? "bg-vy-gold/20" : am.mode === "express" ? "bg-vy-blue/20" : "bg-vy-green/20"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      am.mode === "pro" ? "text-vy-gold" : am.mode === "express" ? "text-vy-blue" : "text-vy-green"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{am.label}</span>
                    {am.cost > 0 ? (
                      <span className="flex items-center gap-0.5 rounded-full bg-vy-gold/10 px-2 py-0.5 text-[10px] font-bold text-vy-gold">
                        <Coins className="h-3 w-3" />
                        {am.cost}
                      </span>
                    ) : (
                      <span className="rounded-full bg-vy-green/10 px-2 py-0.5 text-[10px] font-bold text-vy-green">
                        GRATIS
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{am.description}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">{am.details}</p>
                </div>
                {isSelected && (
                  <Check className="mt-2 h-5 w-5 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Start button */}
      {selectedMode && (
        <div className="mt-6 px-4">
          <button
            onClick={() => handleProtectedAction('Grabar', () => {
              const mode = arryseModes.find((m) => m.mode === selectedMode)
              if (mode && mode.cost > 0) {
                // check enough credits before spending
                const balance = user?.credits || 0
                if (balance < mode.cost) {
                  const msg =
                    lang === "es"
                      ? "Saldo insuficiente. ¡Comprá un pack para publicar tu propiedad!"
                      : "Saldo insuficiente. Compre um pacote para publicar sua propriedade!"
                  alert(msg)
                  return
                }
                const success = spendCredits(mode.cost, `ARRYSE Pro - Grabacion`)
                if (!success) return
              }
              setIsRecording(true)
            })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98]"
          >
            Iniciar grabacion ARRYSE
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
