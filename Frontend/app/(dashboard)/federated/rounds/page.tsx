"use client"

import { useState, useCallback } from "react"
import { useFederatedRounds } from "@/hooks/useFederated"
import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { getRoundById } from "@/lib/federated-api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle, XCircle, Loader2, PlayCircle, Clock,
  ChevronDown, ChevronRight, Activity,
} from "lucide-react"

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  WAITING:      { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",         dot: "bg-zinc-500" },
  COLLECTING:   { color: "bg-blue-500/10 text-blue-400 border-blue-500/20",          dot: "bg-blue-400 animate-pulse" },
  AGGREGATING:  { color: "bg-amber-500/10 text-amber-400 border-amber-500/20",       dot: "bg-amber-400 animate-pulse" },
  DISTRIBUTING: { color: "bg-sky-500/10 text-sky-400 border-sky-500/20",             dot: "bg-sky-400 animate-pulse" },
  COMPLETED:    { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  FAILED:       { color: "bg-red-500/10 text-destructive border-red-500/20",         dot: "bg-destructive" },
}

function RoundRow({ round }: { round: any }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const cfg = STATUS_CONFIG[round.status] || STATUS_CONFIG.COMPLETED

  const loadDetail = async () => {
    if (!expanded && !detail) {
      setLoading(true)
      try {
        const res = await getRoundById(round.roundId)
        setDetail(res.data)
      } catch (_) {} finally { setLoading(false) }
    }
    setExpanded((e) => !e)
  }

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        className="w-full flex items-center justify-between py-3 px-1 text-xs hover:bg-muted/10 transition-colors"
        onClick={loadDetail}
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-2 w-2 rounded-full flex-shrink-0", cfg.dot)} />
          <span className="font-mono font-semibold text-foreground">Round #{round.roundNumber}</span>
          <span className="text-muted-foreground hidden sm:block">{round.participatingBanks?.join(", ")}</span>
        </div>
        <div className="flex items-center gap-3">
          {round.duration && <span className="text-muted-foreground">{Math.round(round.duration / 1000)}s</span>}
          {round.globalModelVersion && (
            <span className="font-mono text-sky-400">{round.globalModelVersion}</span>
          )}
          <Badge className={cn("text-[10px] border", cfg.color)}>{round.status}</Badge>
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="pb-3 px-1 space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading timeline...
            </div>
          ) : (
            <div className="space-y-1 pl-4 border-l border-border/50 ml-1">
              {(detail?.timeline || round.timeline || []).map((e: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {e.status === "SUCCESS" || e.status === "COMPLETED" ? (
                    <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : e.status === "FAILURE" ? (
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">{e.description}</span>
                  <span className="ml-auto text-muted-foreground/50 flex-shrink-0">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FederatedRoundsPage() {
  const { rounds, currentRound, loading, startRound } = useFederatedRounds()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setStarting(true)
    setError(null)
    try { await startRound() }
    catch (e: any) { setError(e.message) }
    finally { setStarting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Federated Rounds</h1>
          <p className="text-sm text-muted-foreground">History and lifecycle of all federated learning rounds</p>
        </div>
        <Button onClick={handleStart} disabled={starting || !!currentRound} className="gap-2">
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          Start New Round
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Active round banner */}
      {currentRound && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-semibold text-blue-300">Active: Round #{currentRound.roundNumber}</span>
            <Badge className="text-[10px] border bg-blue-500/10 text-blue-400 border-blue-500/20">{currentRound.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {currentRound.participatingBanks?.join(", ")} · Started {new Date(currentRound.startedAt).toLocaleString()}
          </p>
          {currentRound.receivedUpdates?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Updates received: {currentRound.receivedUpdates.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* All rounds */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Round History</CardTitle>
          <CardDescription className="text-xs">{rounds.length} rounds — click to expand timeline</CardDescription>
        </CardHeader>
        <CardContent className="p-0 px-4">
          {loading && rounds.length === 0 ? (
            <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading rounds...
            </div>
          ) : rounds.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No rounds yet. Start the first federated round.</p>
            </div>
          ) : (
            rounds.map((r) => <RoundRow key={r.roundId} round={r} />)
          )}
        </CardContent>
      </Card>
    </div>
  )
}
