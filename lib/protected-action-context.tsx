"use client"

import { createContext, useContext, useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

interface PendingAction {
  name: string
  callback: () => void
}

interface ProtectedActionContextType {
  handleProtectedAction: (actionName: string, callback: () => void) => void
  pendingAction: PendingAction | null
  clearPendingAction: () => void
  executePendingAction: () => void
}

const ProtectedActionContext = createContext<ProtectedActionContextType | undefined>(undefined)

export function ProtectedActionProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [showModal, setShowModal] = useState(false)
  const callbackRef = useRef<(() => void) | null>(null)

  const isVerified = () => {
    if (!user) return false
    const levels = [
      "visitante",
      "basico",
      "propietario",
      "propietario-plus",
      "inmobiliaria",
      "top",
    ]
    return levels.indexOf(user.level) >= 2
  }

  const handleProtectedAction = (actionName: string, callback: () => void) => {
    // public actions do not go through this helper
    // protected actions require login + verification
    if (isLoggedIn && isVerified()) {
      callback()
      return
    }
    // otherwise store pending and show modal or redirect
    setPendingAction({ name: actionName, callback })
    callbackRef.current = callback
    setShowModal(true)
  }

  const clearPendingAction = () => {
    setPendingAction(null)
    callbackRef.current = null
  }

  const executePendingAction = () => {
    if (callbackRef.current && isLoggedIn && isVerified()) {
      callbackRef.current()
    }
    clearPendingAction()
  }

  // if user becomes authenticated/verified while modal open, run action
  useEffect(() => {
    if (showModal && isLoggedIn && isVerified()) {
      executePendingAction()
      setShowModal(false)
    }
  }, [showModal, isLoggedIn, user])

  const message =
    "Para interactuar con la comunidad y realizar transacciones, debes registrarte y verificar tu identidad / Para interagir com a comunidade e realizar transações, você deve se registrar e verificar sua identidade"

  return (
    <ProtectedActionContext.Provider
      value={{ handleProtectedAction, pendingAction, clearPendingAction, executePendingAction }}
    >
      {children}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-lg bg-card p-6 text-center">
            <p className="mb-4 text-sm text-foreground">{message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  router.push("/registro")
                }}
                className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
              >
                Registrarse
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-primary px-6 py-2 text-sm font-semibold text-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedActionContext.Provider>
  )
}

export function useProtectedAction() {
  const context = useContext(ProtectedActionContext)
  if (!context) {
    throw new Error("useProtectedAction must be used within ProtectedActionProvider")
  }
  return context
}
