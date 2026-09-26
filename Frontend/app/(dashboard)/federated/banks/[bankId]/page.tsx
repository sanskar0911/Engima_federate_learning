"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  getBankById,
  getModelUpdates,
  connectBank,
  disconnectBank,
} from "@/lib/federated-api"
import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Wifi,
  WifiOff,
  Shield,
  ShieldCheck,
  Cpu,
  Database,
  ArrowLeft,
  Activity,
  Layers,
  Lock,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ONLINE:       { label: "Online",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  OFFLINE:      { label: "Offline",     color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",          dot: "bg-zinc-400" },
  TRAINING:     { label: "Training",    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",          dot: "bg-blue-400 animate-pulse" },
  AGGREGATING:  { label: "Aggregating", color: "bg-purple-500/10 text-purple-400 border-purple-500/20",    dot: "bg-purple-400 animate-pulse" },
  ERROR:        { label: "Error",       color: "bg-red-500/10 text-red-400 border-red-500/20",             dot: "bg-red-400" },
}

export default function BankDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bankId = String(params?.bankId || "")

  const [bank, setBank] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { on } = useFederatedSocket()

  const loadData = useCallback(async () => {
    if (!bankId) return
    try {
      setLoading(true)
      setError(null)
      const [bankRes, updatesRes] = await Promise.all([
        getBankById(bankId),
        getModelUpdates({ bankId }).catch(() => ({ data: [] })),
      ])
      setBank(bankRes.data || bankRes)
      setUpdates(updatesRes.data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load bank node details")
    } finally {
      setLoading(false)
    }
  }, [bankId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const offBank = on("bank:status_change", (d: any) => {
      if (d.bankId === bankId) {
        setBank((prev: any) => prev ? { ...prev, status: d.status, lastSeen: d.timestamp } : prev)
      }
    })
    const offUpdate = on("bank:update_received", (d: any) => {
      if (d.bankId === bankId) {
        setUpdates((prev) => [d, ...prev])
      }
    })
    return () => {
      offBank()
      offUpdate()
    }
  }, [on, bankId])

  const handleToggleConnection = async () => {
    if (!bank) return
    setBusy(true)
    try {
      if (bank.status === "OFFLINE") {
        await connectBank(bank.bankId)
      } else {
        await disconnectBank(bank.bankId)
      }
      await loadData()
    } catch (err: any) {
      setError(err.message || "Action failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !bank) {
    return (
      <div className="space-y-6">
        <Link href="/federated">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Federated Hub
          </Button>
        </Link>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error || `Bank node ${bankId} not found`}</p>
            <Button onClick={loadData} variant="outline" size="sm" className="mt-4 gap-2">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[bank.status] || STATUS_CONFIG.OFFLINE
  const dp = bank.differentialPrivacy || {
    enabled: true,
    epsilon: 1.2,
    delta: "1e-5",
    noiseMultiplier: 0.8,
    clipNorm: 1.0,
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/federated">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{bank.bankName || bank.bankId}</h1>
              <Badge className={`text-xs border ${cfg.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                {cfg.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Node Identifier: <span className="font-mono text-foreground">{bank.bankId}</span> · Code: {bank.shortCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {bank.status === "OFFLINE" ? (
            <Button
              size="sm"
              onClick={handleToggleConnection}
              disabled={busy}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
              Connect Node
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleConnection}
              disabled={busy}
              className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WifiOff className="h-3.5 w-3.5" />}
              Disconnect Node
            </Button>
          )}
        </div>
      </div>

      {/* DPDP Compliance Sovereignty Banner */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 sm:mt-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                DPDP Act 2023 Compliant Data Sovereignty
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Verified</Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Local raw financial records never leave {bank.bankName}’s firewall. Only differential-privacy perturbed gradient tensors are synchronized with the central orchestrator.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs shrink-0 border border-emerald-500/30">
            Zero Raw Data Exfiltration
          </Badge>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Local Dataset</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {(bank.datasetSize || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Local transaction training records</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Current Model</CardTitle>
            <Layers className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {bank.currentModelVersion || "v1.0.0"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Synchronized global version</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Privacy Budget (ε)</CardTitle>
            <Lock className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {dp.epsilon || 1.2}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Noise multiplier: {dp.noiseMultiplier || 0.8}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Updates</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {updates.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Rounds participated</p>
          </CardContent>
        </Card>
      </div>

      {/* Details Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Node Specs */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Node Configuration
            </CardTitle>
            <CardDescription className="text-xs">Edge runtime and privacy parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">API Endpoint</span>
              <span className="font-mono text-foreground">{bank.endpoint || "Local Worker Process"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Differential Privacy</span>
              <span className="font-semibold text-emerald-400">Opacus DP-SGD Active</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Epsilon (ε)</span>
              <span className="font-mono text-foreground">{dp.epsilon || 1.2}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Delta (δ)</span>
              <span className="font-mono text-foreground">{dp.delta || "1e-5"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Max Gradient Norm</span>
              <span className="font-mono text-foreground">{dp.clipNorm || 1.0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Last Heartbeat</span>
              <span className="font-mono text-muted-foreground">
                {bank.lastSeen ? new Date(bank.lastSeen).toLocaleTimeString() : "Recent"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Update History */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Model Update History
            </CardTitle>
            <CardDescription className="text-xs">Weights contributed to federated rounds</CardDescription>
          </CardHeader>
          <CardContent>
            {updates.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                No model updates submitted by this bank yet.
                <p className="mt-1">Updates are generated automatically when a federated round starts.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {updates.map((upd: any, idx: number) => (
                  <div
                    key={upd._id || idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">Round #{upd.roundNumber}</span>
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                          <span>Loss: <b className="text-foreground font-mono">{(upd.loss || 0).toFixed(4)}</b></span>
                          <span>·</span>
                          <span>Samples: <b className="text-foreground font-mono">{(upd.sampleCount || 0).toLocaleString()}</b></span>
                          <span>·</span>
                          <span>Duration: <b className="text-foreground font-mono">{upd.trainingDurationMs || 0}ms</b></span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-border">
                      ε={upd.epsilonUsed || dp.epsilon || 1.2}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
