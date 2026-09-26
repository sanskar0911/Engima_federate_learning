"use client"

import { useGlobalModel } from "@/hooks/useFederated"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Activity } from "lucide-react"

const STATUS_CONFIG: Record<string, string> = {
  READY:        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DISTRIBUTED:  "bg-sky-500/10 text-sky-400 border-sky-500/20",
  DISTRIBUTING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DEPRECATED:   "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  CREATING:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

export function GlobalModelStatus() {
  const { models, currentModel, loading } = useGlobalModel()

  if (loading && !currentModel) {
    return <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading model data...</div>
  }

  return (
    <div className="space-y-4">
      {/* Current model highlight */}
      {currentModel ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">Current Global Model</span>
            </div>
            <Badge className={cn("text-[10px] border", STATUS_CONFIG[currentModel.status] || STATUS_CONFIG.READY)}>
              {currentModel.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Version",    value: currentModel.version },
              { label: "Round",      value: `#${currentModel.roundNumber}` },
              { label: "Method",     value: currentModel.aggregationMethod || "FedAvg" },
              { label: "Accuracy",   value: currentModel.accuracy != null ? `${(currentModel.accuracy * 100).toFixed(1)}%` : "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-black/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="font-mono text-sm font-semibold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-muted-foreground space-x-4">
            <span>{currentModel.participatingBanks?.join(", ") || "—"}</span>
            <span>·</span>
            <span>{currentModel.totalUpdates} updates aggregated</span>
            <span>·</span>
            <span>{currentModel.modelSize ? `${(currentModel.modelSize / 1024).toFixed(1)} KB` : "—"}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card/40 p-4 text-center text-sm text-muted-foreground">
          <Database className="h-6 w-6 mx-auto mb-2 opacity-30" />
          No global model yet. Start a federated round.
        </div>
      )}

      {/* Version history */}
      {models.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Version History</p>
          {models.slice(0, 8).map((m) => (
            <div key={m.version} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-foreground w-10">{m.version}</span>
                <span className="text-muted-foreground">Round {m.roundNumber}</span>
                {m.accuracy != null && (
                  <span className="text-emerald-400 font-mono">{(m.accuracy * 100).toFixed(1)}%</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/60">
                  {m.modelSize ? `${(m.modelSize / 1024).toFixed(0)} KB` : ""}
                </span>
                <Badge className={cn("text-[10px] border", STATUS_CONFIG[m.status] || STATUS_CONFIG.READY)}>
                  {m.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
