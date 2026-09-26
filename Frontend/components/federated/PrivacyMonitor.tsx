"use client"

import { usePrivacy } from "@/hooks/useFederated"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldOff, CheckCircle2, XCircle, Loader2, Lock } from "lucide-react"

function PrivacyStatCard({
  label,
  value,
  sub,
  safe,
  icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  safe: boolean
  icon: any
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4 flex flex-col gap-2",
      safe ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
    )}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", safe ? "text-emerald-400" : "text-destructive")} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-2xl font-mono font-bold", safe ? "text-emerald-400" : "text-destructive")}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function PrivacyMonitor() {
  const { summary, events, loading } = usePrivacy()

  if (loading && !summary) {
    return <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading privacy data...</div>
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PrivacyStatCard label="Raw Data Transferred" value={summary?.rawDataTransferred ?? 0} sub="DPDP Act compliant" safe={true} icon={Lock} />
        <PrivacyStatCard label="PII Records Shared" value={summary?.piiRecordsTransferred ?? 0} sub="Zero PII egress" safe={true} icon={Shield} />
        <PrivacyStatCard label="Blocked Transfers" value={summary?.blockedTransfers ?? 0} sub="Raw data attempts blocked" safe={true} icon={ShieldOff} />
        <PrivacyStatCard
          label="Model Updates"
          value={summary?.modelUpdatesCount ?? 0}
          sub={`${((summary?.modelUpdatesTotalSize || 0) / 1024).toFixed(1)} KB total`}
          safe={true}
          icon={CheckCircle2}
        />
      </div>

      {/* Transfer table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">DATA TRANSFER LOG</span>
          <span className="text-[10px] text-muted-foreground">{events.length} events</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {events.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No transfer events yet. Start a federated round.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Time</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Source</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Destination</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Type</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">Size</th>
                  <th className="px-3 py-2 text-center text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {new Date(e.timestamp || e.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 font-mono">{e.source}</td>
                    <td className="px-3 py-2 font-mono">{e.destination}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        e.transferType === "RAW_TRANSACTION_DATA" || e.transferType === "PII_DATA"
                          ? "text-destructive border-destructive/30"
                          : "text-blue-400 border-blue-400/30"
                      )}>
                        {e.transferType?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {e.size ? `${(e.size / 1024).toFixed(1)} KB` : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {e.allowed ? (
                        <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">ALLOWED</Badge>
                      ) : (
                        <Badge className="text-[10px] bg-red-500/10 text-destructive border-red-500/20">BLOCKED</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/60">
        ⚠️ Simulation note: Raw transaction data remains within each simulated bank node and is not transmitted to the central aggregator.
        Only differentially private model weight updates are exchanged.
      </p>
    </div>
  )
}
