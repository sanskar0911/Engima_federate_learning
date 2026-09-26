"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  roleLabel: string
  institution: string
  bankId?: string
  avatarInitials: string
  avatarColor: string
  clearanceLevel: "TIER_1_FEDERATION" | "TIER_2_BANK_NODE" | "TIER_3_AUDITOR"
}

export const DEMO_PERSONAS: UserProfile[] = [
  {
    id: "user-fed-admin",
    name: "Alex Chen",
    email: "admin@fedshield.io",
    role: "FEDERATION_ADMIN",
    roleLabel: "Lead ML & Federation Architect",
    institution: "FedShield Central Orchestrator",
    avatarInitials: "AC",
    avatarColor: "bg-blue-600",
    clearanceLevel: "TIER_1_FEDERATION",
  },
  {
    id: "user-bank-a",
    name: "Priya Sharma",
    email: "priya.sharma@apexbank.in",
    role: "BANK_NODE_OPERATOR",
    roleLabel: "Head of Fraud Intelligence",
    institution: "Apex National Bank (BANK-A)",
    bankId: "BANK-A",
    avatarInitials: "PS",
    avatarColor: "bg-emerald-600",
    clearanceLevel: "TIER_2_BANK_NODE",
  },
  {
    id: "user-bank-b",
    name: "Vikramaditya Roy",
    email: "vikram.roy@bharatfc.in",
    role: "BANK_NODE_OPERATOR",
    roleLabel: "Senior Risk Strategist",
    institution: "Bharat Financial Corp (BANK-B)",
    bankId: "BANK-B",
    avatarInitials: "VR",
    avatarColor: "bg-indigo-600",
    clearanceLevel: "TIER_2_BANK_NODE",
  },
  {
    id: "user-auditor",
    name: "Rajeshwar Sen",
    email: "audit.inspector@rbi.org.in",
    role: "REGULATORY_AUDITOR",
    roleLabel: "DPDP Act Privacy Inspector",
    institution: "Reserve Bank Compliance & Audit",
    avatarInitials: "RS",
    avatarColor: "bg-amber-600",
    clearanceLevel: "TIER_3_AUDITOR",
  },
]

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  switchPersona: (personaId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "fedshield_auth_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // Default to Federation Admin for smooth demo experience
        const defaultUser = DEMO_PERSONAS[0]
        setUser(defaultUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser))
      }
    } catch (_) {
      setUser(DEMO_PERSONAS[0])
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600)) // smooth realism delay

    // Find persona by email or match by role
    const matched = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase())
    const authenticatedUser: UserProfile = matched || {
      id: `user-${Date.now()}`,
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email,
      role: "FINANCIAL_ANALYST",
      roleLabel: "Financial Risk Analyst",
      institution: "Federated Network Member",
      avatarInitials: email.slice(0, 2).toUpperCase(),
      avatarColor: "bg-purple-600",
      clearanceLevel: "TIER_2_BANK_NODE",
    }

    setUser(authenticatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
    setLoading(false)
    return true
  }

  const switchPersona = (personaId: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId)
    if (persona) {
      setUser(persona)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persona))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        switchPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
