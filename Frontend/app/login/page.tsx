"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, DEMO_PERSONAS } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, switchPersona } = useAuth()

  const [email, setEmail] = useState("admin@fedshield.io")
  const [password, setPassword] = useState("fedshield@2026")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<string>("user-fed-admin")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      await login(email, password)
      router.push("/")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectPersona = async (personaId: string) => {
    setSelectedPersona(personaId)
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId)
    if (persona) {
      setEmail(persona.email)
      setPassword("password123")
      setIsSubmitting(true)
      await login(persona.email)
      setIsSubmitting(false)
      router.push("/")
    }
  }

  const [mode, setMode] = useState<"login" | "signup">("login")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupBank, setSignupBank] = useState("Oasis Thrift (Bank 70)")
  const [signupRole, setSignupRole] = useState("AML Compliance Officer")

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupEmail) return
    setIsSubmitting(true)
    try {
      await login(signupEmail, signupPassword)
      router.push("/")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px] -translate-x-48" />
        <div className="h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px] translate-x-48" />
      </div>

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DPDP Act 2023 Compliant Financial Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-3">
            <span className="bg-gradient-to-r from-blue-400 via-primary to-emerald-400 bg-clip-text text-transparent">
              FedShield
            </span>
            <span className="text-muted-foreground font-light text-2xl">|</span>
            <span className="text-xl sm:text-2xl font-semibold">Federated Risk Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Decentralized AML and money-laundering detection across 5 banking institutions.
            Raw financial data remains strictly local — only differential privacy gradients are synchronized.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12 items-start">
          {/* Main Form (Tabs: Login / Signup) */}
          <Card className="md:col-span-7 border-border/80 bg-card/90 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={mode === "login" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("login")}
                    className="text-xs h-8"
                  >
                    Institutional Sign In
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "signup" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("signup")}
                    className="text-xs h-8"
                  >
                    Register New Node / User
                  </Button>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  Secure Portal
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {mode === "login" ? (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Institutional Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="officer@oathrift.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-xs h-9 bg-muted/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium">Security Key / Passphrase</Label>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9 text-xs h-9 bg-muted/40"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full text-xs h-9 gap-2 shadow-md shadow-primary/20"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Authenticating...
                        </>
                      ) : (
                        <>
                          Authenticate & Enter Node <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Officer Full Name</Label>
                      <Input
                        placeholder="Kunal Sharma"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="text-xs h-8 bg-muted/40"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Institutional Email</Label>
                      <Input
                        type="email"
                        placeholder="kunal@banknode.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="text-xs h-8 bg-muted/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Assigned Bank Node</Label>
                      <select
                        value={signupBank}
                        onChange={(e) => setSignupBank(e.target.value)}
                        className="w-full text-xs h-8 rounded-md border border-input bg-muted/40 px-2 text-foreground"
                      >
                        <option>Oasis Thrift (Bank 70)</option>
                        <option>National Bank of Laramie (Bank 10)</option>
                        <option>National Bank of the East (Bank 12)</option>
                        <option>Arbor Savings Bank (Bank 1)</option>
                        <option>Japan Bank #0 (Bank 15)</option>
                        <option>Central FIU Consortium Regulatory</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Security Clearance Role</Label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full text-xs h-8 rounded-md border border-input bg-muted/40 px-2 text-foreground"
                      >
                        <option>AML Compliance Officer</option>
                        <option>Bank Risk Analyst</option>
                        <option>Central FIU Auditor</option>
                        <option>Federated Node Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Security Passphrase</Label>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="text-xs h-8 bg-muted/40"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning Node Access...
                        </>
                      ) : (
                        <>
                          Register Account & Connect <UserCheck className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/40 mt-3 flex items-center justify-between text-[11px] text-muted-foreground py-2.5">
              <span>Encryption: <b className="text-foreground">AES-256 GCM</b></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> TLS 1.3 Active
              </span>
            </CardFooter>
          </Card>

          {/* Quick Demo Access Personas */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                1-Click Bank Personas
              </span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                5 IBM Banks
              </Badge>
            </div>


            <div className="grid gap-2.5">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = selectedPersona === persona.id
                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={`cursor-pointer group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full ${persona.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow-sm`}
                      >
                        {persona.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {persona.name}
                          </p>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            {persona.clearanceLevel.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                          {persona.roleLabel} · <span className="text-foreground/80">{persona.institution}</span>
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className="h-7 text-[11px] px-2.5 gap-1 shrink-0 ml-2"
                    >
                      <UserCheck className="h-3 w-3" /> Select
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Privacy highlights card */}
            <div className="p-3 rounded-xl border border-border/50 bg-muted/20 space-y-1.5 text-xs">
              <p className="font-medium text-foreground text-[11px] flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Multi-Institutional Federation Guard
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Logging in as a Bank Node Operator isolates your interface to that bank’s differential privacy parameters, local data, and model updates. The Federation Admin observes all nodes in aggregate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
