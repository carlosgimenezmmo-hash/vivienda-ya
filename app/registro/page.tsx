"use client"

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react"
import confetti from "canvas-confetti"
import { createWorker } from "tesseract.js"
import { useProtectedAction } from "@/lib/protected-action-context"
import { translations } from "@/lib/translations"
import { useAuth } from "@/lib/auth-context"

export default function RegistroPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [isAdult, setIsAdult] = useState<boolean | null>(null)
  const [warning, setWarning] = useState("")
  const [scanning, setScanning] = useState(false)
  const [lang, setLang] = useState<"es" | "pt">(() => {
    if (typeof navigator !== "undefined") {
      return navigator.language.startsWith("pt") ? "pt" : "es"
    }
    return "es"
  })

  const t = translations[lang]

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleScanClick = () => {
    fileInputRef.current?.click()
  }

  const parseDateFromText = (text: string): string | null => {
    // look for patterns like 12/03/1990 or 12-03-1990 or 12.03.1990
    const match = text.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/)
    return match ? match[1] : null
  }

  const evaluateAge = (dateStr: string) => {
    const parts = dateStr.split(/[\/\-.]/)
    const d = new Date(+parts[2], +parts[1] - 1, +parts[0])
    if (isNaN(d.getTime())) return null
    const ageDifMs = Date.now() - d.getTime()
    const ageDate = new Date(ageDifMs)
    const age = Math.abs(ageDate.getUTCFullYear() - 1970)
    return age
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setWarning("")
    try {
      // createWorker does not have great typings; treat as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worker: any = await createWorker()
      await worker.load()
      await worker.loadLanguage("spa")
      await worker.initialize("spa")
      const { data } = await worker.recognize(file)
      await worker.terminate()
      const text = data.text
      const dateStr = parseDateFromText(text)
      if (dateStr) {
        setBirthDate(dateStr)
        const age = evaluateAge(dateStr)
        if (age !== null) {
          const adult = age >= 18
          setIsAdult(adult)
          if (!adult) {
            setWarning(t.under_age_error)
          }
        }
      } else {
        setWarning("No se pudo leer la fecha de nacimiento. Intenta otra foto.")
      }
    } catch (err) {
      console.error(err)
      setWarning("Error al procesar la imagen")
    } finally {
      setScanning(false)
      // reset file input so same file can be picked again
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const { executePendingAction } = useProtectedAction()
  const { addCredits } = useAuth()
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  useEffect(() => {
    if (registrationSuccess) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [registrationSuccess])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isAdult === false) return
    // enviar datos al servidor o simular registro
    addCredits(1, "Recompensa por verificacion")
    setRegistrationSuccess(true)
    // after a short delay show reward then redirect
    setTimeout(() => {
      executePendingAction()
    }, 2000)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-20">
      {registrationSuccess ? (
        <div className="flex flex-col items-center">
          <h1 className="mb-6 text-2xl font-bold">
            {lang === "es"
              ? "¡Identidad Verificada! Ya podés tener tus créditos de recompensa"
              : "Identidade Verificada! Você já pode ter seus créditos de recompensa"}
          </h1>
          <div className="relative h-24 w-24">
            {/* simple confetti effect */}
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="absolute block h-2 w-2 bg-primary animate-fall"
                style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random()}s` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-bold">{lang === "es" ? "Registro" : "Registro"}</h1>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4"
          >
        <div>
          <label className="block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Fecha de nacimiento</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={birthDate}
              readOnly
              placeholder="DD/MM/YYYY"
              className="flex-1 rounded-md border px-3 py-2 bg-gray-50"
            />
            <button
              type="button"
              onClick={handleScanClick}
              disabled={scanning}
              className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50"
            >
              {scanning ? t.scanning_id : lang === "es" ? "Escanear DNI" : "Escanear DNI"}
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {warning && <p className="text-sm text-red-600">{warning}</p>}

        <button
          type="submit"
          disabled={isAdult === false || scanning}
          className="w-full rounded-md bg-vy-blue px-4 py-2 text-white disabled:opacity-50"
        >
          Registrarme
        </button>
      </form>
        </>
      )}
    </div>
  )
}
