"use client"

import { useEffect, useState } from "react"
import { useBankStatus, useGlobalModel, useFederatedRounds } from "@/hooks/useFederated"
import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { getStats, getAlerts } from "@/lib/federated-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Server, Activity, Database, Shield, AlertTriangle,
  ArrowUpRight, Cpu, Lock,
} from "lucide-react"

export function FederatedKPICards() {
  const { banks } = useBankStatus()
  const { currentModel } = useGlobalModel()
  const { rounds, currentRound } = useFederatedRounds()
  const { on } = useFederatedSocket()
  const [stats, setStats] = useState<any>(null)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, a] = await Promise.all([getStats(), getAlerts()])
        setStats(s)
        setAlertCount(Array.isArray(a) ? a.filter((x: any) => x.status === "PENDING").length : 0)
      } catch (_) {}
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const off = on("new-alert", () => setAlertCount((c) => c + 1))
    return () => off()
  }, [on])

  const onlineBanks = banks.filter((b) => b.status !== "OFFLINE" && b.status !== "ERROR").length
  const latestRound = rounds[0]
  const roundNumber = currentRound?.roundNumber || latestRound?.roundNumber || 0

  const cards = [
    {
      label: "Banks Online",
      value: `${onlineBanks} / ${banks.length}`,
      icon: Server,
      color: onlineBanks === banks.length && banks.length > 0 ? "text-emerald-400" : "text-amber-400",
      sub: "federated participants",
    },
    {
      label: "Current Round",
      value: currentRound ? `#${currentRound.roundNumber}` : `${roundNumber ? `#${roundNumber}` : "—"}`,
      icon: Activity,
      color: currentRound ? "text-blue-400" : "text-muted-foreground",
      sub: currentRound ? currentRound.status : (latestRound ? "last: " + latestRound.status : "No rounds yet"),
    },
    {
      label: "Global Model",
      value: currentModel?.version || "—",
      icon: Database,
      color: currentModel ? "text-sky-400" : "text-muted-foreground",
      sub: currentModel?.accuracy != null ? `${(currentModel.accuracy * 100).toFixed(1)}% accuracy` : "No model yet",
    },
    {
      label: "Transactions",
      value: stats?.totalTransactions?.toLocaleString() || "0",
      icon: ArrowUpRight,
      color: "text-violet-400",
      sub: `${stats?.suspiciousCount || 0} flagged`,
    },
    {
      label: "Active Alerts",
      value: alertCount,
      icon: AlertTriangle,
      color: alertCount > 0 ? "text-red-400" : "text-emerald-400",
      sub: alertCount > 0 ? "require attention" : "all clear",
    },
    {
      label: "Raw Data Shared",
      value: "0",
      icon: Lock,
      color: "text-emerald-400",
      sub: "DPDP Act compliant",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label} className="border-border bg-card relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <Icon className={cn("h-3.5 w-3.5", c.color)} />
              </div>
              <p className={cn("text-xl font-bold font-mono", c.color)}>{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{c.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
