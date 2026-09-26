"use client"

import { useFederatedRounds } from "@/hooks/useFederated"
import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, PlayCircle, Clock, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  WAITING:      { label: "Waiting",      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",        icon: Clock },
  COLLECTING:   { label: "Collecting",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20",        icon: Loader2 },
  AGGREGATING:  { label: "Aggregating",  color: "bg-amber-500/10 text-amber-400 border-amber-500/20",     icon: Loader2 },
  DISTRIBUTING: { label: "Distributing", color: "bg-sky-500/10 text-sky-400 border-sky-500/20",           icon: Loader2 },
  COMPLETED:    { label: "Completed",    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  FAILED:       { label: "Failed",       color: "bg-red-500/10 text-red-400 border-red-500/20",           icon: XCircle },
}

// Maps round status to a progress percentage
const STATUS_PROGRESS: Record<string, number> = {
  WAITING: 0, COLLECTING: 25, AGGREGATING: 55, DISTRIBUTING: 80, COMPLETED: 100, FAILED: 0,
}

function RoundProgress({ status }: { status: string }) {
  const progress = STATUS_PROGRESS[status] || 0
  const isActive = !["COMPLETED", "FAILED"].includes(status)
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000",
          status === "FAILED" ? "bg-destructive" : "bg-blue-500",
          isActive && "animate-pulse"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Live timeline for the current round
function RoundTimeline({ roundId }: { roundId: string }) {
  const { on } = useFederatedSocket()
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const evts = [
      "federated:round_started",
      "federated:bank_training",
      "federated:update_received",
      "federated:all_updates_received",
      "federated:aggregation_started",
      "federated:aggregation_completed",
      "federated:model_created",
      "federated:model_distribution_started",
      "federated:model_received",
      "federated:round_completed",
    ]
    const offs = evts.map((evt) =>
      on(evt, (d: any) => {
        if (d.roundId && d.roundId !== roundId) return
        setEvents((prev) => [
          ...prev,
          {
            event: evt.replace("federated:", ""),
            bankId: d.bankId || d.bankName || null,
            timestamp: d.timestamp || new Date().toISOString(),
            status: evt.includes("failed") || evt.includes("error") ? "FAILURE" : "SUCCESS",
            description: buildDescription(evt, d),
          },
        ])
      })
    )
    return () => offs.forEach((off) => off())
  }, [on, roundId])

  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">Waiting for events...</p>
  }

  return (
    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          {e.status === "SUCCESS" ? (
            <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-foreground">{e.description}</span>
            {e.bankId && <span className="ml-1 text-muted-foreground">— {e.bankId}</span>}
          </div>
          <span className="text-muted-foreground/60 flex-shrink-0">
            {new Date(e.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function buildDescription(evt: string, d: any): string {
  const map: Record<string, string> = {
    "federated:round_started": `Round ${d.roundNumber} started`,
    "federated:bank_training": `${d.bankId} local training started`,
    "federated:update_received": `${d.bankId} model update received (${d.updateSizeKB?.toFixed(1)} KB)`,
    "federated:all_updates_received": `All ${d.receivedFrom?.length} updates collected`,
    "federated:aggregation_started": "FedAvg aggregation started",
    "federated:aggregation_completed": `Aggregation complete — Model ${d.globalModelVersion}`,
    "federated:model_created": `Global Model ${d.version} created`,
    "federated:model_distribution_started": "Distributing global model to banks",
    "federated:model_received": `${d.bankId} acknowledged model ${d.globalModelVersion}`,
    "federated:round_completed": `Round ${d.roundNumber} completed`,
  }
  return map[evt] || evt
}

export function FederatedRoundCard({ showTimeline = true }: { showTimeline?: boolean }) {
  const { rounds, currentRound, loading, startRound } = useFederatedRounds()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setStarting(true)
    setError(null)
    try {
      await startRound()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }

  if (loading && !currentRound && rounds.length === 0) {
    return (
      <div className="flex items-center gap-2 py-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    )
  }

  const activeRound = currentRound
  const latestRound = rounds[0]

  return (
    <div className="space-y-4">
      {/* Current Round */}
      {activeRound ? (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-semibold text-blue-300">Round {activeRound.roundNumber}</span>
            </div>
            {(() => {
              const cfg = STATUS_CONFIG[activeRound.status] || STATUS_CONFIG.WAITING
              const Icon = cfg.icon
              return (
                <Badge className={cn("text-[10px] border gap-1", cfg.color)}>
                  <Icon className={cn("h-2.5 w-2.5", ["COLLECTING","AGGREGATING","DISTRIBUTING"].includes(activeRound.status) && "animate-spin")} />
                  {cfg.label}
                </Badge>
              )
            })()}
          </div>

          <RoundProgress status={activeRound.status} />

          <div className="text-xs text-muted-foreground">
            {activeRound.participatingBanks?.length || 0} banks · Started {new Date(activeRound.startedAt).toLocaleTimeString()}
          </div>

          {showTimeline && <RoundTimeline roundId={activeRound.roundId} />}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">No active round</span>
            <Button size="sm" onClick={handleStart} disabled={starting} className="h-7 text-xs gap-1">
              {starting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
              Start Round
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {error}
            </div>
          )}
        </div>
      )}

      {/* Recent Rounds */}
      {rounds.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recent Rounds</p>
          {rounds.slice(0, 5).map((r) => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.COMPLETED
            const Icon = cfg.icon
            return (
              <div key={r.roundId} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2 text-xs">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground">Round {r.roundNumber}</span>
                  {r.globalModelVersion && (
                    <span className="font-mono text-muted-foreground">→ {r.globalModelVersion}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {r.duration && (
                    <span className="text-[10px] text-muted-foreground">{Math.round(r.duration / 1000)}s</span>
                  )}
                  <Badge className={cn("text-[10px] border", cfg.color)}>{cfg.label}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
