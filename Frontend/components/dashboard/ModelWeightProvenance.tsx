"use client"

import React, { useState } from "react"
import { FIVE_BANKS, GLOBAL_FEDERATED_SUMMARY } from "@/lib/banks-config"
import {
  Cpu,
  ShieldCheck,
  Lock,
  ArrowDown,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Database,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ModelWeightProvenance() {
  const [showFullFormula, setShowFullFormula] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground tracking-tight">
                Federated Learning & Model Weight Provenance
              </h3>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-mono">
                {GLOBAL_FEDERATED_SUMMARY.modelVersion}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Mathematical gradient aggregation verifying zero raw transaction exposure across bank perimeters
            </p>
          </div>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1 py-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          DP-SGD Privacy Verified (ε=1.25)
        </Badge>
      </div>

      {/* Visual Architectural Flow */}
      <div className="bg-muted/40 border border-border/80 rounded-xl p-4 space-y-4">
        {/* Tier 1: 5 Local Bank Models */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              1. Isolated Bank On-Premise Training (Local Parameters)
            </span>
            <Badge variant="secondary" className="text-[10px]">
              5 Nodes
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {FIVE_BANKS.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "p-3 rounded-lg border bg-background flex flex-col justify-between transition-all hover:border-border",
                  b.borderColor
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-foreground">{b.name}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{b.region}</span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Local Mass (N):</span>
                    <span className="font-mono font-medium">{b.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Weight (w_k):</span>
                    <span className="font-mono font-bold" style={{ color: b.color }}>
                      {b.federatedWeightPct}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Down Arrow connector */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
          <ArrowDown className="h-4 w-4 text-purple-400 animate-bounce" />
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-background border border-purple-500/20 text-purple-300">
            Encrypted Gradient Vectors + Calibrated Gaussian Noise (σ = 0.8)
          </span>
          <ArrowDown className="h-4 w-4 text-purple-400 animate-bounce" />
        </div>

        {/* Tier 2: Federated Aggregator & Global Equation */}
        <div className="bg-background border border-purple-500/30 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span className="font-semibold text-xs text-foreground">
                2. Federated Coordinator Aggregation Equation:
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Raw Transaction Data Transferred: 0 Bytes
            </span>
          </div>

          <div className="p-2.5 rounded bg-zinc-950 font-mono text-xs text-purple-300 border border-purple-900/40 overflow-x-auto">
            {GLOBAL_FEDERATED_SUMMARY.aggregationEquation}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="text-muted-foreground">
              Parameters: <span className="font-mono text-foreground font-bold">36,289</span>
            </div>
            <div className="text-muted-foreground">
              Architecture: <span className="font-mono text-foreground font-bold">12-192-128-64-1</span>
            </div>
            <div className="text-muted-foreground">
              Optimizer: <span className="font-mono text-foreground font-bold">DP-SGD / FedAvg</span>
            </div>
            <div className="text-muted-foreground">
              Global AUC: <span className="font-mono text-emerald-400 font-bold">0.962 (96.2%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
