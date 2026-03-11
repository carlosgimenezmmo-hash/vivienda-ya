"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, Transaction } from "./types"
import { mockUser, mockTransactions } from "./mock-data"
import { addRevenue } from "./revenue"

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  transactions: Transaction[]
  login: () => void
  logout: () => void
  toggleAuth: () => void
  // priceUSD optional for purchases; descriptions containing "Recompensa" are ignored
  addCredits: (amount: number, description: string, priceUSD?: number) => void
  spendCredits: (amount: number, description: string) => boolean
  likedProperties: Set<string>
  savedProperties: Set<string>
  toggleLike: (propertyId: string) => void
  toggleSave: (propertyId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set())
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set(["p3", "p8"]))

  const isLoggedIn = user !== null && user.isLoggedIn

  const login = useCallback(() => {
    setUser({ ...mockUser, isLoggedIn: true })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const toggleAuth = useCallback(() => {
    if (isLoggedIn) {
      setUser(null)
    } else {
      setUser({ ...mockUser, isLoggedIn: true })
    }
  }, [isLoggedIn])

  const addCredits = useCallback(
    (amount: number, description: string, priceUSD?: number) => {
      // accumulate revenue when a real purchase occurs
      if (priceUSD && !description.toLowerCase().includes("recompensa")) {
        addRevenue(priceUSD)
      }

      setUser((prev) => {
        if (!prev) return prev
        const newBalance = prev.credits + amount
        const newTransaction: Transaction = {
          id: `t${Date.now()}`,
          type: "recompensa",
          description,
          amount,
          date: new Date().toISOString().split("T")[0],
          balanceAfter: newBalance,
        }
        setTransactions((prevT) => [newTransaction, ...prevT])
        return { ...prev, credits: newBalance }
      })
    },
    []
  )

  const spendCredits = useCallback((amount: number, description: string): boolean => {
    let success = false
    setUser((prev) => {
      if (!prev || prev.credits < amount) return prev
      success = true
      const newBalance = prev.credits - amount
      const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        type: "gasto",
        description,
        amount: -amount,
        date: new Date().toISOString().split("T")[0],
        balanceAfter: newBalance,
      }
      setTransactions((prevT) => [newTransaction, ...prevT])
      return { ...prev, credits: newBalance }
    })
    return success
  }, [])

  const toggleLike = useCallback((propertyId: string) => {
    setLikedProperties((prev) => {
      const next = new Set(prev)
      if (next.has(propertyId)) {
        next.delete(propertyId)
      } else {
        next.add(propertyId)
      }
      return next
    })
  }, [])

  const toggleSave = useCallback((propertyId: string) => {
    setSavedProperties((prev) => {
      const next = new Set(prev)
      if (next.has(propertyId)) {
        next.delete(propertyId)
      } else {
        next.add(propertyId)
      }
      return next
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        transactions,
        login,
        logout,
        toggleAuth,
        addCredits,
        spendCredits,
        likedProperties,
        savedProperties,
        toggleLike,
        toggleSave,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
