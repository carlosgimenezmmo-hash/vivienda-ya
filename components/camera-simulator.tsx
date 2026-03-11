"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ShieldCheck, MapPin, Circle, Square, ChevronRight,
  DoorOpen, Sofa, CookingPot, Bed, Bath, Trees, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArryseMode } from "@/lib/types"

const stepIcons = [DoorOpen, Sofa, CookingPot, Bed, Bath, Trees]

const arryseSteps = [
  { label: "Entrada", instruction: "Graba la entrada principal de la propiedad", duration: 15 },
  { label: "Living", instruction: "Muestra el living o sala principal", duration: 20 },
  { label: "Cocina", instruction: "Recorre la cocina completa", duration: 15 },
  { label: "Dormitorio", instruction: "Muestra el dormitorio principal", duration: 15 },
  { label: "Bano", instruction: "Graba el bano principal", duration: 10 },
  { label: "Exterior", instruction: "Muestra el balcon, patio o terraza", duration: 15 },
]

interface CameraSimulatorProps {
  mode: ArryseMode
  onComplete: () => void
  onCancel: () => void
}

export function CameraSimulator({ mode, onComplete, onCancel }: CameraSimulatorProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gpsVerified, setGpsVerified] = useState(false)
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([])

  const maxSteps = mode === "express" ? 5 : arryseSteps.length
  const currentStepData = arryseSteps[currentStep]

  // Simulate GPS verification
  useEffect(() => {
    const timer = setTimeout(() => setGpsVerified(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Simulate recording progress
  useEffect(() => {
    if (!isRecording) return
    const duration = currentStepData.duration
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRecording(false)
          setStepsCompleted((s) => [...s, currentStep])
          return 100
        }
        return prev + 100 / (duration * 10)
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isRecording, currentStep, currentStepData.duration])

  const startRecording = useCallback(() => {
    if (!gpsVerified) return
    setIsRecording(true)
    setProgress(0)
  }, [gpsVerified])

  const nextStep = useCallback(() => {
    if (currentStep < maxSteps - 1) {
      setCurrentStep((s) => s + 1)
      setProgress(0)
    } else {
      onComplete()
    }
  }, [currentStep, maxSteps, onComplete])

  const isStepDone = stepsCompleted.includes(currentStep)

  return (
    <div className="flex h-dvh flex-col bg-black text-white">
      {/* Camera viewfinder (simulated) */}
      <div className="relative flex-1 overflow-hidden">
        {/* Simulated camera background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="grid grid-cols-3 gap-px">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-32 w-28 border border-white/20" />
              ))}
            </div>
          </div>
        </div>

        {/* GPS verification badge */}
        <div className="absolute left-4 top-4 z-10">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-500",
              gpsVerified
                ? "bg-vy-green/90 text-white animate-pulse-glow"
                : "bg-white/20 text-white/60"
            )}
          >
            {gpsVerified ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4 animate-pulse" />
            )}
            {gpsVerified ? "GPS Verificado" : "Verificando GPS..."}
          </div>
        </div>

        {/* Mode badge */}
        <div className="absolute right-4 top-4 z-10">
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold",
              mode === "pro" ? "bg-vy-gold/90 text-black" : "bg-white/20 text-white"
            )}
          >
            ARRYSE {mode.toUpperCase()}
          </span>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="absolute left-4 top-14 z-10 text-xs text-white/60"
        >
          Cancelar
        </button>

        {/* Center instruction */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          {!isRecording && !isStepDone && (
            <div className="animate-slide-up text-center">
              {(() => {
                const StepIcon = stepIcons[currentStep] || DoorOpen
                return <StepIcon className="mx-auto mb-3 h-16 w-16 text-white/50" />
              })()}
              <p className="mb-1 text-lg font-bold">{currentStepData.label}</p>
              <p className="max-w-[250px] text-sm text-white/70">{currentStepData.instruction}</p>
            </div>
          )}
          {isRecording && (
            <div className="flex flex-col items-center gap-3">
              <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
              <p className="text-sm font-semibold">Grabando...</p>
            </div>
          )}
          {isStepDone && !isRecording && (
            <div className="animate-slide-up flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vy-green/20">
                <Check className="h-8 w-8 text-vy-green" />
              </div>
              <p className="text-sm font-semibold">Listo!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 bg-black/90 px-4 pb-24 pt-4">
        {/* Step indicators */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {Array.from({ length: maxSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                i === currentStep
                  ? "bg-vy-blue text-white scale-110"
                  : stepsCompleted.includes(i)
                    ? "bg-vy-green text-white"
                    : "bg-white/10 text-white/40"
              )}
            >
              {stepsCompleted.includes(i) ? <Check className="h-4 w-4" /> : i + 1}
            </div>
          ))}
        </div>

        {/* Recording progress bar */}
        {isRecording && (
          <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6">
          {!isStepDone ? (
            <button
              onClick={isRecording ? () => { setIsRecording(false); setStepsCompleted((s) => [...s, currentStep]); setProgress(100) } : startRecording}
              disabled={!gpsVerified}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all",
                isRecording
                  ? "border-red-500 bg-red-500/20"
                  : gpsVerified
                    ? "border-white bg-white/10 active:scale-90"
                    : "border-white/20 bg-white/5 opacity-50"
              )}
            >
              {isRecording ? (
                <Square className="h-6 w-6 text-red-500" fill="currentColor" />
              ) : (
                <Circle className="h-8 w-8 text-white" fill="currentColor" />
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 rounded-full bg-vy-blue px-8 py-4 text-sm font-semibold text-white active:scale-95"
            >
              {currentStep < maxSteps - 1 ? "Siguiente paso" : "Finalizar grabacion"}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
