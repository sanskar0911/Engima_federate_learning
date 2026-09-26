"use client"

import React, { useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { FundFlowGraph } from "@/components/graph/fund-flow-graph"
import { FIVE_BANKS, BANK_BY_ID } from "@/lib/banks-config"
import { useTasks } from "@/contexts/TaskContext"
import {
  Network,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Layers,
  Activity,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function FundFlowPage() {
  const { analysisPeriod } = useTasks()
  const [selectedView, setSelectedView] = useState<"individual" | "federated" | "canvas">("individual")
  const [selectedBankId, setSelectedBankId] = useState<string>("BANK-70")

  const selectedBank = FIVE_BANKS.find((b) => b.id === selectedBankId) || FIVE_BANKS[0]

  // Detailed bank fund flow data
  const bankFundFlowDetails: Record<
    string,
    {
      inflow: string
      outflow: string
      netFlow: string
      txCount: string
      majorPaths: Array<{ from: string; to: string; amount: string; channel: string; risk: string }>
      suspiciousPaths: Array<{ from: string; to: string; amount: string; flag: string; risk: number }>
    }
  > = {
    "BANK-70": {
      inflow: "$142.6M",
      outflow: "$124.5M",
      netFlow: "+$18.1M",
      txCount: "449,859 txs",
      majorPaths: [
        { from: "Acct 100428660 (Oasis)", to: "Acct 800059F50 (Laramie)", amount: "$5.1M", channel: "Cheque", risk: "Low" },
        { from: "Acct 100428660 (Oasis)", to: "Acct 800132390 (East)", amount: "$15.5M", channel: "Cheque", risk: "Low" },
        { from: "Acct 100428660 (Oasis)", to: "Acct 800190EB0 (Commercial)", amount: "$19.7M", channel: "Cash", risk: "Low" },
      ],
      suspiciousPaths: [
        { from: "Acct 100428660 (Oasis)", to: "Acct 800199240 (Arbor)", amount: "$24,112", flag: "Structuring Smurf", risk: 94 },
        { from: "Acct 100428660 (Oasis)", to: "Acct 800190EB0 (Japan #0)", amount: "$9,850", flag: "Below Threshold Avoidance", risk: 88 },
        { from: "Acct 100428660 (Oasis)", to: "Acct 800132390 (East)", amount: "$9,920", flag: "Sub-10k Rapid Hop", risk: 85 },
      ],
    },
    "BANK-10": {
      inflow: "$54.2M",
      outflow: "$48.9M",
      netFlow: "+$5.3M",
      txCount: "81,629 txs",
      majorPaths: [
        { from: "Acct 8000EBD30 (Laramie)", to: "Acct 8000EBD30 (Self-Clearing)", amount: "$3.6M", channel: "Reinvestment", risk: "Low" },
        { from: "Acct 80012FD90 (Laramie)", to: "Acct 812ED6380 (East)", amount: "$1.2M", channel: "Credit Card", risk: "Low" },
      ],
      suspiciousPaths: [
        { from: "Acct 80012FEA0 (Laramie)", to: "Acct 800131480 (East)", amount: "$10,020", flag: "Off-Hours Jump (00:11)", risk: 78 },
        { from: "Acct 80012FD90 (Laramie)", to: "Acct 800059F50 (Oasis)", amount: "$9,500", flag: "Smurfing Funnel", risk: 82 },
      ],
    },
    "BANK-12": {
      inflow: "$68.4M",
      outflow: "$62.1M",
      netFlow: "+$6.3M",
      txCount: "79,754 txs",
      majorPaths: [
        { from: "Acct 800132390 (East)", to: "Acct 800059F50 (Oasis)", amount: "$14.2M", channel: "Wire", risk: "Low" },
        { from: "Acct 800190EB0 (East)", to: "Acct 80012FD90 (Laramie)", amount: "$8.9M", channel: "Reinvestment", risk: "Low" },
      ],
      suspiciousPaths: [
        { from: "Acct 800132390 (East)", to: "Acct 800199240 (Japan #0)", amount: "$48,500", flag: "Currency Mismatch (USD→JPY)", risk: 91 },
        { from: "Acct 800190EB0 (East)", to: "Acct 800059F50 (Arbor)", amount: "$9,990", flag: "Threshold Avoidance", risk: 86 },
      ],
    },
    "BANK-1": {
      inflow: "$34.8M",
      outflow: "$31.2M",
      netFlow: "+$3.6M",
      txCount: "62,211 txs",
      majorPaths: [
        { from: "Acct 800199240 (Arbor)", to: "Acct 100428660 (Oasis)", amount: "$6.4M", channel: "Cheque", risk: "Low" },
        { from: "Acct 800199240 (Arbor)", to: "Acct 80012FD90 (Laramie)", amount: "$4.1M", channel: "Wire", risk: "Low" },
      ],
      suspiciousPaths: [
        { from: "Acct 800199240 (Arbor)", to: "Acct 800190EB0 (East)", amount: "$24,112", flag: "Layered Cheque Loop", risk: 89 },
        { from: "Acct 800199240 (Arbor)", to: "Acct 800132390 (Oasis)", amount: "$9,400", flag: "Micro Smurfing", risk: 80 },
      ],
    },
    "BANK-15": {
      inflow: "$32.4M",
      outflow: "$29.8M",
      netFlow: "+$2.6M",
      txCount: "52,511 txs",
      majorPaths: [
        { from: "Acct 800190EB0 (Japan #0)", to: "Acct 100428660 (Oasis)", amount: "$8.2M", channel: "FX USD/JPY", risk: "Low" },
        { from: "Acct 800190EB0 (Japan #0)", to: "Acct 800132390 (East)", amount: "$5.7M", channel: "Cross-Border Wire", risk: "Low" },
      ],
      suspiciousPaths: [
        { from: "Acct 800190EB0 (Japan #0)", to: "Acct 800199240 (Arbor)", amount: "$148,000", flag: "Arbitrage Laundering Loop", risk: 96 },
        { from: "Acct 800190EB0 (Japan #0)", to: "Acct 80012FD90 (Laramie)", amount: "$9,800", flag: "Offshore Avoidance Hop", risk: 87 },
      ],
    },
  }

  const currentFlow = bankFundFlowDetails[selectedBank.id] || bankFundFlowDetails["BANK-70"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Fund Flow & Inter-Bank Money Trails
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Surveillance of institutional fund corridors across all 5 bank nodes and cross-institution laundering loops.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
          <Button
            size="sm"
            variant={selectedView === "individual" ? "default" : "ghost"}
            onClick={() => setSelectedView("individual")}
            className="h-7 text-xs font-medium px-2.5"
          >
            Individual Bank View
          </Button>
          <Button
            size="sm"
            variant={selectedView === "federated" ? "default" : "ghost"}
            onClick={() => setSelectedView("federated")}
            className="h-7 text-xs font-medium px-2.5"
          >
            All-Banks Federated View
          </Button>
          <Button
            size="sm"
            variant={selectedView === "canvas" ? "default" : "ghost"}
            onClick={() => setSelectedView("canvas")}
            className="h-7 text-xs font-medium px-2.5"
          >
            Interactive Graph Canvas
          </Button>
        </div>
      </div>

      {/* VIEW 1: Individual Bank View */}
      {selectedView === "individual" && (
        <div className="space-y-5">
          {/* Bank Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {FIVE_BANKS.map((b) => {
              const isSelected = selectedBankId === b.id
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBankId(b.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition text-xs flex flex-col justify-between space-y-1",
                    isSelected ? b.borderColor + " " + b.bgColor + " ring-1 ring-blue-500/40" : "border-border/60 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{b.name}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{b.id} ({b.federatedWeightPct})</span>
                </div>
              )
            })}
          </div>

          {/* Selected Bank Flow Overview Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBank.color }} />
                <h2 className="text-base font-bold text-foreground">
                  {selectedBank.name} ({selectedBank.id}) Fund Flow Profile
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  {selectedBank.region}
                </Badge>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Period: {analysisPeriod.startDate} → {analysisPeriod.endDate}
              </span>
            </div>

            {/* Inflow vs Outflow KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase">
                  <ArrowDownLeft className="h-3.5 w-3.5" /> Total Inflow
                </div>
                <div className="text-lg font-bold font-mono text-foreground mt-1">{currentFlow.inflow}</div>
                <span className="text-[10px] text-muted-foreground">Received from network</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold uppercase">
                  <ArrowUpRight className="h-3.5 w-3.5" /> Total Outflow
                </div>
                <div className="text-lg font-bold font-mono text-foreground mt-1">{currentFlow.outflow}</div>
                <span className="text-[10px] text-muted-foreground">Dispatched liquidity</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">Net Position</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{currentFlow.netFlow}</div>
                <span className="text-[10px] text-muted-foreground">Positive balance</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">Transaction Density</div>
                <div className="text-lg font-bold font-mono text-foreground mt-1">{currentFlow.txCount}</div>
                <span className="text-[10px] text-muted-foreground">{selectedBank.primaryChannel}</span>
              </div>
            </div>

            {/* Major Paths vs Suspicious Paths (2 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              {/* Major Paths */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Dominant Clearing Corridors
                </h3>
                <div className="space-y-2">
                  {currentFlow.majorPaths.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/60 bg-background text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono font-semibold">
                        <span className="text-foreground">{p.from}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{p.to}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <span>Settled: <strong className="text-foreground font-mono">{p.amount}</strong></span>
                        <Badge variant="secondary" className="text-[10px]">{p.channel}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suspicious Paths */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Flagged Suspicious Money Trails (FraudMLP AI)
                </h3>
                <div className="space-y-2">
                  {currentFlow.suspiciousPaths.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono font-semibold">
                        <span className="text-foreground">{p.from}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-rose-400" />
                        <span className="text-foreground">{p.to}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-destructive/20">
                        <span>Amount: <strong className="text-destructive font-mono">{p.amount}</strong></span>
                        <span className="text-[10px] text-rose-300 font-medium">{p.flag} ({p.risk}% Risk)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: All-Banks Federated Hop Matrix */}
      {selectedView === "federated" && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground">Cross-Bank Inter-Institutional Matrix</h2>
            <p className="text-xs text-muted-foreground">
              Mapping liquidity movement and mule jump probabilities across the 5 bank perimeters
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/70 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">From Institution (Origin)</th>
                  <th className="p-3">Oasis (70)</th>
                  <th className="p-3">Laramie (10)</th>
                  <th className="p-3">East (12)</th>
                  <th className="p-3">Arbor (1)</th>
                  <th className="p-3">Japan #0 (15)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {FIVE_BANKS.map((fromB) => (
                  <tr key={fromB.id} className="hover:bg-muted/30">
                    <td className="p-3 font-bold text-foreground font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fromB.color }} />
                        {fromB.name} ({fromB.id})
                      </div>
                    </td>
                    {FIVE_BANKS.map((toB) => {
                      const isSelf = fromB.id === toB.id
                      return (
                        <td key={toB.id} className="p-3">
                          {isSelf ? (
                            <span className="text-muted-foreground/60 font-sans">Intra-Bank Clearing</span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-foreground font-bold font-mono">
                                ${(Math.abs(fromB.idNum * 17 - toB.idNum * 13) % 25 + 5).toFixed(1)}M
                              </span>
                              <div className="text-[10px] text-amber-400">
                                {Math.abs(fromB.idNum - toB.idNum) % 15 + 2} flagged jumps
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Interactive Graph Canvas */}
      {selectedView === "canvas" && (
        <ReactFlowProvider>
          <FundFlowGraph />
        </ReactFlowProvider>
      )}
    </div>
  )
}