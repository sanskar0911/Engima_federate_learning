"use client"

import React, { useState, useMemo } from "react"
import { FIVE_BANKS } from "@/lib/banks-config"
import { useTasks } from "@/contexts/TaskContext"
import {
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  DollarSign,
  ShieldAlert,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MetricType = "volume" | "amount" | "fraud" | "risk" | "fedLoss"

export function FiveBankAnalyticsGraph() {
  const { analysisPeriod } = useTasks()
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("volume")
  const [visibleBanks, setVisibleBanks] = useState<Record<string, boolean>>({
    "BANK-70": true,
    "BANK-10": true,
    "BANK-12": true,
    "BANK-1": true,
    "BANK-15": true,
  })

  const toggleBank = (bankId: string) => {
    setVisibleBanks((prev) => ({ ...prev, [bankId]: !prev[bankId] }))
  }

  // Generate 14 day intervals across the selected period for the 5 banks
  const timelineData = useMemo(() => {
    const dates = [
      "Sep 01", "Sep 03", "Sep 06", "Sep 09", "Sep 12", "Sep 15",
      "Sep 18", "Sep 21", "Sep 24", "Sep 27", "Sep 30"
    ]

    return dates.map((date, idx) => {
      const multiplier = 1 + Math.sin(idx * 0.7) * 0.25
      return {
        date,
        "BANK-70": {
          volume: Math.round(14900 * multiplier + idx * 250),
          amount: Math.round(4120000 * multiplier),
          fraud: Math.round(21 * multiplier + (idx % 3 === 0 ? 15 : 2)),
          risk: 74 + Math.round(Math.sin(idx) * 4),
          fedLoss: parseFloat((0.48 - idx * 0.035).toFixed(3)),
        },
        "BANK-10": {
          volume: Math.round(2720 * multiplier),
          amount: Math.round(1630000 * multiplier),
          fraud: Math.round(2 * multiplier + (idx === 4 ? 6 : 0)),
          risk: 61 + Math.round(Math.cos(idx) * 3),
          fedLoss: parseFloat((0.52 - idx * 0.038).toFixed(3)),
        },
        "BANK-12": {
          volume: Math.round(2650 * multiplier),
          amount: Math.round(2070000 * multiplier),
          fraud: Math.round(3 * multiplier + (idx % 4 === 0 ? 8 : 1)),
          risk: 68 + Math.round(Math.sin(idx * 1.2) * 5),
          fedLoss: parseFloat((0.50 - idx * 0.036).toFixed(3)),
        },
        "BANK-1": {
          volume: Math.round(2070 * multiplier),
          amount: Math.round(1040000 * multiplier),
          fraud: Math.round(2 * multiplier + (idx === 7 ? 5 : 0)),
          risk: 58 + Math.round(Math.cos(idx * 0.8) * 4),
          fedLoss: parseFloat((0.55 - idx * 0.040).toFixed(3)),
        },
        "BANK-15": {
          volume: Math.round(1750 * multiplier),
          amount: Math.round(990000 * multiplier),
          fraud: Math.round(2 * multiplier + (idx === 3 || idx === 8 ? 7 : 0)),
          risk: 64 + Math.round(Math.sin(idx) * 6),
          fedLoss: parseFloat((0.58 - idx * 0.042).toFixed(3)),
        },
      }
    })
  }, [])

  // Calculate highest metric value for scaling
  const maxValue = useMemo(() => {
    let max = 0
    timelineData.forEach((d) => {
      FIVE_BANKS.forEach((b) => {
        if (visibleBanks[b.id]) {
          const val = (d as any)[b.id][selectedMetric]
          if (val > max) max = val
        }
      })
    })
    return max || 1
  }, [timelineData, selectedMetric, visibleBanks])

  const metricLabels: Record<MetricType, { label: string; unit: string; desc: string }> = {
    volume: { label: "Transaction Volume", unit: "txs / interval", desc: "Monitored transaction density per node" },
    amount: { label: "Settlement Amount (USD)", unit: "$ USD", desc: "Cumulative value of outgoing funds" },
    fraud: { label: "Confirmed Laundering Flags", unit: "cases", desc: "Flagged high-risk structuring & smurfing hops" },
    risk: { label: "Intra-Risk Index", unit: "Score (0-100)", desc: "Rule Engine severity assessment" },
    fedLoss: { label: "Federated Model Loss", unit: "BCE Loss", desc: "DP-SGD training error across Flower rounds" },
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Header with Metric Tabs & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-base text-foreground tracking-tight">
              5-Bank Comparative Analytics ({metricLabels[selectedMetric].label})
            </h3>
            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">
              {analysisPeriod.startDate} → {analysisPeriod.endDate}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{metricLabels[selectedMetric].desc}</p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap bg-muted/60 p-1 rounded-lg border border-border/50">
          <Button
            size="sm"
            variant={selectedMetric === "volume" ? "default" : "ghost"}
            onClick={() => setSelectedMetric("volume")}
            className="h-7 text-xs px-2.5 font-medium"
          >
            Volume
          </Button>
          <Button
            size="sm"
            variant={selectedMetric === "amount" ? "default" : "ghost"}
            onClick={() => setSelectedMetric("amount")}
            className="h-7 text-xs px-2.5 font-medium"
          >
            Amount ($)
          </Button>
          <Button
            size="sm"
            variant={selectedMetric === "fraud" ? "default" : "ghost"}
            onClick={() => setSelectedMetric("fraud")}
            className="h-7 text-xs px-2.5 font-medium"
          >
            Laundering
          </Button>
          <Button
            size="sm"
            variant={selectedMetric === "risk" ? "default" : "ghost"}
            onClick={() => setSelectedMetric("risk")}
            className="h-7 text-xs px-2.5 font-medium"
          >
            Risk Index
          </Button>
          <Button
            size="sm"
            variant={selectedMetric === "fedLoss" ? "default" : "ghost"}
            onClick={() => setSelectedMetric("fedLoss")}
            className="h-7 text-xs px-2.5 font-medium"
          >
            Model Loss
          </Button>
        </div>
      </div>

      {/* Interactive Bank Visibility Toggles (Legend) */}
      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
        <span className="text-muted-foreground text-[11px] font-medium mr-1 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Toggle Nodes:
        </span>
        {FIVE_BANKS.map((b) => {
          const isVis = visibleBanks[b.id]
          return (
            <button
              key={b.id}
              onClick={() => toggleBank(b.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all font-medium",
                isVis ? b.borderColor + " " + b.bgColor : "border-border/40 text-muted-foreground/50 opacity-60 line-through"
              )}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              <span>{b.name}</span>
              <span className="text-[10px] opacity-70 font-mono">({b.federatedWeightPct})</span>
              {isVis ? <Eye className="h-3 w-3 opacity-60 ml-0.5" /> : <EyeOff className="h-3 w-3 opacity-40 ml-0.5" />}
            </button>
          )
        })}
      </div>

      {/* Graph Area */}
      <div className="h-64 w-full pt-4 flex flex-col justify-end">
        <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {timelineData.map((slot, sIdx) => {
            return (
              <div key={sIdx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col gap-1 p-2.5 bg-popover/95 backdrop-blur border border-border rounded-lg shadow-xl text-[11px] z-30 pointer-events-none min-w-[200px]">
                  <div className="font-bold border-b border-border/50 pb-1 text-foreground flex justify-between">
                    <span>{slot.date}</span>
                    <span className="text-muted-foreground">{metricLabels[selectedMetric].unit}</span>
                  </div>
                  {FIVE_BANKS.filter((b) => visibleBanks[b.id]).map((b) => {
                    const val = (slot as any)[b.id][selectedMetric]
                    return (
                      <div key={b.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                          <span className="text-muted-foreground truncate max-w-[110px]">{b.name}</span>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {selectedMetric === "amount" ? `$${(val / 1000).toFixed(0)}k` : val.toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Bars group for visible banks */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-[85%]">
                  {FIVE_BANKS.map((b) => {
                    if (!visibleBanks[b.id]) return null
                    const rawVal = (slot as any)[b.id][selectedMetric]
                    const heightPct = Math.max(8, Math.min(100, (rawVal / maxValue) * 100))

                    return (
                      <div
                        key={b.id}
                        className="w-full max-w-[12px] sm:max-w-[16px] rounded-t transition-all duration-300 hover:brightness-125"
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: b.color,
                        }}
                      />
                    )
                  })}
                </div>

                {/* X Axis Label */}
                <span className="text-[10px] font-mono text-muted-foreground/80 mt-1 whitespace-nowrap">
                  {slot.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
