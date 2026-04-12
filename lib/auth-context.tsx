"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import { supabase } from "./supabaseClient"

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  plan: string
  login: () => void
  logout: () => void
  toggleAuth: () => void
  likedProperties: Set<string>
  savedProperties: Set<string>
  toggleLike: (propertyId: string) => void
  toggleSave: (propertyId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<string>("gratis")
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set())
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())

  const isLoggedIn = user !== null && user.isLoggedIn

  const buildUser = async (supabaseUser: any): Promise<User> => {
    const meta = supabaseUser.user_metadata
    const { data: userData } = await supabase
      .from("users")
      .select("avatar_url, full_name, phone, city, province")
      .eq("id", supabaseUser.id)
      .single()
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("plan, estado, fecha_vencimiento")
      .eq("user_id", supabaseUser.id)
      .eq("estado", "activo")
      .single()
    if (subData && new Date(subData.fecha_vencimiento) > new Date()) {
      setPlan(subData.plan)
    } else {
      setPlan("gratis")
    }
    return {
      id: supabaseUser.id,
      name: userData?.full_name || `${meta.nombre || ""} ${meta.apellido || ""}`.trim() || supabaseUser.email || "Usuario",
      email: supabaseUser.email || "",
      isLoggedIn: true,
      avatar_url: userData?.avatar_url || meta.avatar_url || null,
      phone: userData?.phone || meta.telefono || "",
      city: userData?.city || "",
      province: userData?.province || "",
      level: "basico",
      verified: false,
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await buildUser(session.user))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        buildUser(session.user).then(setUser)
      } else {
        setUser(null)
        setPlan("gratis")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(() => {}, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPlan("gratis")
  }, [])

  const toggleAuth = useCallback(async () => {
    if (isLoggedIn) {
      await supabase.auth.signOut()
      setUser(null)
      setPlan("gratis")
    }
  }, [isLoggedIn])

  const toggleLike = useCallback((propertyId: string) => {
    setLikedProperties((prev) => {
      const next = new Set(prev)
      next.has(propertyId) ? next.delete(propertyId) : next.add(propertyId)
      return next
    })
  }, [])

  const toggleSave = useCallback((propertyId: string) => {
    setSavedProperties((prev) => {
      const next = new Set(prev)
      next.has(propertyId) ? next.delete(propertyId) : next.add(propertyId)
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn, plan,
      login, logout, toggleAuth,
      likedProperties, savedProperties,
      toggleLike, toggleSave,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
