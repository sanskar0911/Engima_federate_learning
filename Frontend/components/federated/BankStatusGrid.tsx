"use client"

import { useBankStatus } from "@/hooks/useFederated"
import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Loader2, AlertTriangle, Server, ChevronRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ONLINE:       { label: "Online",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  OFFLINE:      { label: "Offline",     color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",         dot: "bg-zinc-500"   },
  TRAINING:     { label: "Training",    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",          dot: "bg-blue-400 animate-pulse" },
  UPLOADING:    { label: "Uploading",   color: "bg-violet-500/10 text-violet-400 border-violet-500/20",    dot: "bg-violet-400 animate-pulse" },
  AGGREGATING:  { label: "Aggregating", color: "bg-amber-500/10 text-amber-400 border-amber-500/20",       dot: "bg-amber-400 animate-pulse" },
  UPDATING:     { label: "Updating",    color: "bg-sky-500/10 text-sky-400 border-sky-500/20",             dot: "bg-sky-400 animate-pulse" },
  ERROR:        { label: "Error",       color: "bg-red-500/10 text-red-400 border-red-500/20",             dot: "bg-red-400" },
}

function BankCard({ bank, onConnect, onDisconnect }: { bank: any; onConnect: () => Promise<void> | void; onDisconnect: () => Promise<void> | void }) {
  const cfg = STATUS_CONFIG[bank.status] || STATUS_CONFIG.OFFLINE
  const [busy, setBusy] = useState(false)

  const handle = async (fn: () => Promise<void> | void) => {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <div className={cn(
      "relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200",
      bank.status === "OFFLINE" ? "border-border/40 bg-card/40" : "border-border bg-card"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full flex-shrink-0", cfg.dot)} />
          <span className="text-sm font-semibold text-card-foreground">{bank.bankId}</span>
          <span className="text-xs text-muted-foreground hidden sm:block">· {bank.shortCode}</span>
        </div>
        <Badge className={cn("text-[10px] border", cfg.color)}>{cfg.label}</Badge>
      </div>

      {/* Name */}
      <p className="text-xs text-muted-foreground leading-snug">{bank.bankName}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg bg-muted/40 px-2 py-1.5">
          <span className="text-muted-foreground">Dataset</span>
          <p className="font-mono font-semibold text-foreground">{(bank.datasetSize || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-muted/40 px-2 py-1.5">
          <span className="text-muted-foreground">Model</span>
          <p className="font-mono font-semibold text-foreground truncate">{bank.currentModelVersion || "—"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {bank.status === "OFFLINE" ? (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => handle(onConnect)}
            disabled={busy}
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3 mr-1" />}
            Connect
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => handle(onDisconnect)}
            disabled={busy || bank.status !== "ONLINE"}
          >
            <WifiOff className="h-3 w-3 mr-1" /> Disconnect
          </Button>
        )}
        <Link href={`/federated/banks/${bank.bankId}`}>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function BankStatusGrid() {
  const { banks, loading, connectBank, disconnectBank, connectAll } = useBankStatus()
  const { connected } = useFederatedSocket()
  const [connectingAll, setConnectingAll] = useState(false)

  const handleConnectAll = async () => {
    setConnectingAll(true)
    try { await connectAll() } finally { setConnectingAll(false) }
  }

  const onlineCount = banks.filter((b) => b.status !== "OFFLINE" && b.status !== "ERROR").length

  if (loading && banks.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading bank nodes...
      </div>
    )
  }

  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <Server className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No bank nodes registered.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-400 animate-pulse" : "bg-zinc-500")} />
          <span className="text-sm text-muted-foreground">
            {onlineCount}/{banks.length} banks connected
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={handleConnectAll}
          disabled={connectingAll}
        >
          {connectingAll ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          Connect All
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {banks.map((bank) => (
          <BankCard
            key={bank.bankId}
            bank={bank}
            onConnect={() => connectBank(bank.bankId)}
            onDisconnect={() => disconnectBank(bank.bankId)}
          />
        ))}
      </div>
    </div>
  )
}
