"use client"

import { useFederatedEvents } from "@/hooks/useFederatedSocket"
import { cn } from "@/lib/utils"
import {
  Activity, Database, Shield, AlertTriangle, CheckCircle2,
  Wifi, WifiOff, Zap, RefreshCw,
} from "lucide-react"

const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  "federated:round_started":          { icon: Activity,      color: "text-blue-400",    label: "Round Started" },
  "federated:round_completed":        { icon: CheckCircle2,  color: "text-emerald-400", label: "Round Completed" },
  "federated:bank_training":          { icon: Zap,           color: "text-blue-400",    label: "Training" },
  "federated:update_received":        { icon: Database,      color: "text-violet-400",  label: "Update Received" },
  "federated:aggregation_started":    { icon: RefreshCw,     color: "text-amber-400",   label: "Aggregating" },
  "federated:aggregation_completed":  { icon: CheckCircle2,  color: "text-emerald-400", label: "Aggregated" },
  "federated:model_created":          { icon: Database,      color: "text-sky-400",     label: "Model Created" },
  "federated:model_received":         { icon: CheckCircle2,  color: "text-emerald-400", label: "Model Received" },
  "federated:bank_connected":         { icon: Wifi,          color: "text-emerald-400", label: "Connected" },
  "federated:bank_disconnected":      { icon: WifiOff,       color: "text-zinc-400",    label: "Disconnected" },
  "federated:demo_started":           { icon: Zap,           color: "text-amber-400",   label: "Demo Started" },
  "federated:demo_completed":         { icon: CheckCircle2,  color: "text-emerald-400", label: "Demo Complete" },
  "federated:error":                  { icon: AlertTriangle, color: "text-destructive", label: "Error" },
  "privacy:transfer_event":           { icon: Shield,        color: "text-violet-400",  label: "Privacy Event" },
  "new-transaction":                  { icon: Activity,      color: "text-zinc-400",    label: "Transaction" },
  "new-alert":                        { icon: AlertTriangle, color: "text-red-400",     label: "Alert" },
}

function buildMessage(event: any): string {
  const { type } = event
  if (type === "federated:round_started")         return `Round ${event.roundNumber} started — ${event.participatingBanks?.length} banks`
  if (type === "federated:round_completed")       return `Round ${event.roundNumber} complete — ${event.globalModelVersion}`
  if (type === "federated:bank_training")         return `${event.bankId} local training started`
  if (type === "federated:update_received")       return `${event.bankId} update received (${event.updateSizeKB?.toFixed(1)} KB, DP applied)`
  if (type === "federated:aggregation_started")   return `FedAvg aggregation started (${event.updatesCount} updates)`
  if (type === "federated:aggregation_completed") return `Aggregation complete — ${event.globalModelVersion} (${(event.accuracy * 100)?.toFixed(1)}%)`
  if (type === "federated:model_created")         return `Global Model ${event.version} created`
  if (type === "federated:model_received")        return `${event.bankId} acknowledged ${event.globalModelVersion}`
  if (type === "federated:bank_connected")        return `${event.bankId} (${event.bankName}) connected`
  if (type === "federated:bank_disconnected")     return `${event.bankId} disconnected`
  if (type === "federated:demo_started")          return `Demo started — ${event.patternLabel}`
  if (type === "federated:demo_completed")        return `Demo complete — ${event.patternLabel}`
  if (type === "privacy:transfer_event")          return `${event.source} → ${event.destination}: ${event.transferType} ${event.allowed ? "ALLOWED" : "BLOCKED"}`
  if (type === "new-transaction")                 return `TX ₹${event.tx?.amount?.toLocaleString("en-IN")} (${event.result?.riskLevel})`
  if (type === "new-alert")                       return `Alert: ${event.transactionId} — ${event.riskLevel}`
  if (type === "federated:error")                 return `Error: ${event.error}`
  return type
}

function getSource(event: any): string {
  if (event.bankId) return event.bankId
  if (event.type?.startsWith("federated:")) return "FEDERATION"
  if (event.type === "privacy:transfer_event") return "PRIVACY"
  if (event.type === "new-transaction") return event.tx?.bank_id || "SIM"
  if (event.type === "new-alert") return "ALERT"
  return "SYSTEM"
}

export function LiveFederatedEvents({ maxHeight = "h-80" }: { maxHeight?: string }) {
  const { events, connected } = useFederatedEvents(100)

  return (
    <div className={cn("overflow-y-auto space-y-0.5 pr-1", maxHeight)}>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <Activity className="h-6 w-6 mb-2 opacity-30" />
          <p className="text-sm">{connected ? "Waiting for events..." : "Connecting to event stream..."}</p>
        </div>
      ) : (
        events.map((e, i) => {
          const cfg = EVENT_CONFIG[e.type] || { icon: Activity, color: "text-zinc-400", label: "Event" }
          const Icon = cfg.icon
          const msg = buildMessage(e)
          const source = getSource(e)
          return (
            <div
              key={i}
              className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/20"
            >
              <Icon className={cn("h-3 w-3 mt-0.5 flex-shrink-0", cfg.color)} />
              <div className="flex-1 min-w-0">
                <span className="text-foreground leading-snug">{msg}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn("text-[9px] font-mono", cfg.color)}>{source}</span>
                <span className="text-muted-foreground/50 text-[9px]">
                  {new Date(e._localTime || e.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
