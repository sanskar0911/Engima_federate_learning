"use client"

import React, { useState } from "react"
import { FIVE_BANKS } from "@/lib/banks-config"
import { useTasks } from "@/contexts/TaskContext"
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  Lock,
  FileText,
  Activity,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function BanksPage() {
  const { analysisPeriod } = useTasks()
  const [selectedBankId, setSelectedBankId] = useState("BANK-70")

  const selectedBank = FIVE_BANKS.find((b) => b.id === selectedBankId) || FIVE_BANKS[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Federated Bank Nodes (5 Client Perimeters)
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect isolated institution profiles, local transaction volumes, fraud density, and FedAvg gradient contributions.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-xs font-mono bg-blue-500/10 text-blue-400 border-blue-500/20">
          Period: {analysisPeriod.startDate} → {analysisPeriod.endDate}
        </Badge>
      </div>

      {/* Bank Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {FIVE_BANKS.map((b) => {
          const isSelected = selectedBankId === b.id
          return (
            <div
              key={b.id}
              onClick={() => setSelectedBankId(b.id)}
              className={cn(
                "p-4 rounded-xl border bg-card cursor-pointer transition-all hover:border-border hover:shadow-md space-y-3",
                isSelected ? b.borderColor + " " + b.bgColor + " ring-1 ring-blue-500/40 shadow-sm" : "border-border/80"
              )}
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono" style={{ borderColor: b.color, color: b.color }}>
                  {b.id}
                </Badge>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {b.status}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-foreground">{b.name}</h3>
                <span className="text-[11px] text-muted-foreground">{b.region}</span>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/40 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions:</span>
                  <span className="font-mono font-medium">{b.totalTransactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fed Weight:</span>
                  <span className="font-mono font-bold" style={{ color: b.color }}>
                    {b.federatedWeightPct}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Bank Deep-Dive View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Profile (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBank.color }} />
                <h2 className="text-base font-bold text-foreground">{selectedBank.name} ({selectedBank.id})</h2>
                <Badge variant="outline" className="text-[10px]">
                  ID #{selectedBank.idNum}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedBank.description}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Federated Weight (w_k)</span>
              <div className="text-xl font-bold font-mono" style={{ color: selectedBank.color }}>
                {selectedBank.federatedWeightPct}
              </div>
            </div>
          </div>

          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Monitored Volume</span>
              <div className="text-base font-bold font-mono text-foreground mt-1">
                {selectedBank.totalTransactions.toLocaleString()}
              </div>
              <span className="text-[10px] text-muted-foreground">Transactions</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Confirmed Fraud</span>
              <div className="text-base font-bold font-mono text-rose-400 mt-1">
                {selectedBank.actualFraudCases} cases
              </div>
              <span className="text-[10px] text-muted-foreground">{selectedBank.fraudRatePct} of volume</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Intra-Risk Index</span>
              <div className="text-base font-bold font-mono text-amber-400 mt-1">
                {selectedBank.riskScore} / 100
              </div>
              <span className="text-[10px] text-muted-foreground">Elevated</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Settlement Channel</span>
              <div className="text-xs font-bold text-foreground mt-1 truncate">
                {selectedBank.primaryChannel}
              </div>
              <span className="text-[10px] text-muted-foreground">{selectedBank.currency}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              size="sm"
              onClick={() => (window.location.href = `/fund-flow?bank=${selectedBank.id}`)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              View {selectedBank.shortCode} Fund Flow
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = `/transactions?bank=${selectedBank.id}`)}
              className="text-xs"
            >
              Browse Transactions ({selectedBank.id})
            </Button>
          </div>
        </div>

        {/* Right Column: Privacy Perimeter & Security Guarantee (1 col) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            Perimeter Security & Privacy
          </h3>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              On-Premise DP-SGD Guarantee
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-200/90">
              Raw customer accounts and timestamps for <strong>{selectedBank.name}</strong> never exit the perimeter. Only DP-SGD sanitized model gradients (ε=1.25) are transmitted.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Privacy Epsilon (ε):</span>
              <span className="font-mono font-bold text-foreground">1.25</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Privacy Delta (δ):</span>
              <span className="font-mono font-bold text-foreground">1e-5</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Noise Multiplier (σ):</span>
              <span className="font-mono font-bold text-foreground">0.8</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Compliance:</span>
              <span className="font-mono font-bold text-blue-400">DPDP Act 2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
