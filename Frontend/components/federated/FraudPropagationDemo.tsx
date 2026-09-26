"use client"

import { useState } from "react"
import { useFederatedDemo } from "@/hooks/useFederated"
import { useBankStatus } from "@/hooks/useFederated"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Zap, RefreshCw, CheckCircle2, XCircle, Loader2, PlayCircle,
  ChevronRight, AlertTriangle, ShieldCheck,
} from "lucide-react"

const PATTERNS = [
  { key: "CROSS_BANK_FRAUD",         label: "Cross-Bank Fraud Ring",       desc: "Coordinated fraud across multiple institutions" },
  { key: "RAPID_MULTI_HOP",          label: "Rapid Multi-Hop Transfer",    desc: "Funds split across intermediary accounts at speed" },
  { key: "TRANSACTION_STRUCTURING",  label: "Transaction Structuring",     desc: "Breaking large amounts into sub-threshold transfers" },
  { key: "ACCOUNT_TAKEOVER_BURST",   label: "Account Takeover Burst",      desc: "Sudden high-velocity transactions from dormant accounts" },
  { key: "CIRCULAR_FUND_FLOW",       label: "Circular Fund Flow",          desc: "Money cycles across accounts to simulate legitimacy" },
]

const BANKS = ["BANK-70", "BANK-10", "BANK-12", "BANK-1", "BANK-15"]

function DetectionResult({ label, data }: { label: string; data: Record<string, any> }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      {Object.entries(data).map(([bankId, result]: [string, any]) => (
        <div
          key={bankId}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 text-xs",
            result.detected
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
          )}
        >
          <div className="flex items-center gap-2">
            {result.detected ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className="font-mono font-semibold">{bankId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Score: <span className="font-mono text-foreground">{result.score}</span></span>
            <Badge className={cn(
              "text-[10px] border",
              result.detected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-destructive border-red-500/20"
            )}>
              {result.detected ? "DETECTED" : "MISSED"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineItem({ event }: { event: any }) {
  const isError = event.status === "FAILURE"
  return (
    <div className="flex items-start gap-2 text-xs">
      <div className={cn("mt-1 h-2 w-2 rounded-full flex-shrink-0", isError ? "bg-destructive" : "bg-blue-400")} />
      <div className="flex-1">
        <span className="text-foreground">{event.description}</span>
        {event.bank && event.bank !== "FEDERATION" && (
          <span className="ml-1 text-muted-foreground">— {event.bank}</span>
        )}
      </div>
      <span className="text-muted-foreground/60 flex-shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
    </div>
  )
}

export function FraudPropagationDemo() {
  const { demoState, timeline, running, injectPattern, runFullDemo, reset } = useFederatedDemo()
  const { onlineBanks } = useBankStatus()
  const [selectedPattern, setSelectedPattern] = useState("CROSS_BANK_FRAUD")
  const [sourceBank, setSourceBank] = useState("BANK-A")

  const handleRun = async () => {
    await injectPattern(selectedPattern, sourceBank, BANKS.filter((b) => b !== sourceBank))
  }

  const handleFullDemo = async () => {
    await runFullDemo(selectedPattern)
  }

  return (
    <div className="space-y-5">
      {/* Pattern selector */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Fraud Pattern</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPattern(p.key)}
              disabled={running}
              className={cn(
                "rounded-lg border p-3 text-left transition-all duration-150 text-xs",
                selectedPattern === p.key
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                  : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/30"
              )}
            >
              <p className="font-semibold">{p.label}</p>
              <p className="mt-0.5 opacity-70">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Source bank selector */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground flex-shrink-0">Source Bank:</p>
        <div className="flex gap-2">
          {BANKS.map((b) => (
            <button
              key={b}
              onClick={() => setSourceBank(b)}
              disabled={running}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-mono transition-all",
                sourceBank === b
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                  : "border-border text-muted-foreground hover:bg-muted/30"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleRun}
          disabled={running || onlineBanks.length === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-500"
          size="sm"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {running ? "Running Demo..." : "Inject & Propagate"}
        </Button>

        <Button
          onClick={handleFullDemo}
          disabled={running}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <PlayCircle className="h-4 w-4" /> Full Demo Sequence
        </Button>

        {demoState && (
          <Button
            onClick={reset}
            disabled={running}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </Button>
        )}
      </div>

      {onlineBanks.length === 0 && (
        <p className="text-xs text-amber-400">⚠ Connect at least one bank before running the demo.</p>
      )}

      {/* Live timeline */}
      {(running || timeline.length > 0) && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            {running && <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />}
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {running ? "Live Demo Progress" : "Demo Timeline"}
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {timeline.map((e, i) => <TimelineItem key={i} event={e} />)}
          </div>
        </div>
      )}

      {/* Before / After comparison */}
      {demoState?.beforeDetection && demoState?.afterDetection && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Before vs After Federation</span>
            <Badge className="text-[10px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 ml-auto">
              SIMULATION RESULT
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetectionResult
              label="Before (Siloed Model — no cross-bank intelligence)"
              data={
                demoState.beforeDetection instanceof Map
                  ? Object.fromEntries(demoState.beforeDetection)
                  : demoState.beforeDetection
              }
            />
            <DetectionResult
              label="After (Global Federated Model — cross-bank aware)"
              data={
                demoState.afterDetection instanceof Map
                  ? Object.fromEntries(demoState.afterDetection)
                  : demoState.afterDetection
              }
            />
          </div>

          <p className="text-[10px] text-muted-foreground/60">
            Demo simulation: detection scores are derived from the federated orchestration pipeline.
            The global federated model aggregates cross-bank behavioral patterns without sharing raw transaction data.
          </p>
        </div>
      )}
    </div>
  )
}
