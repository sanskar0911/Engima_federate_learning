"use client"

import React, { useState, useEffect } from "react"
import { FIVE_BANKS } from "@/lib/banks-config"
import {
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Cpu,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface SystemEvent {
  id: string
  timestamp: string
  source: string
  sourceColor: string
  type: "TRAINING" | "BATCH" | "ALERT" | "FEDERATION" | "PRIVACY" | "REPORT"
  status: "Running" | "Completed" | "Processing" | "Warning" | "Failed"
  description: string
}

const INITIAL_EVENTS: SystemEvent[] = [
  {
    id: "evt-1",
    timestamp: "Just now",
    source: "Oasis Thrift (BANK-70)",
    sourceColor: "#10b981",
    type: "TRAINING",
    status: "Completed",
    description: "Local epoch 3/3 finished on 449,859 records. Local loss: 0.114. Gradient vector prepared.",
  },
  {
    id: "evt-2",
    timestamp: "28s ago",
    source: "FedShield Central Aggregator",
    sourceColor: "#a855f7",
    type: "FEDERATION",
    status: "Processing",
    description: "Collecting encrypted weights from 5 banks for FedAvg Round 5 parameter aggregation.",
  },
  {
    id: "evt-3",
    timestamp: "1m ago",
    source: "Japan Bank #0 (BANK-15)",
    sourceColor: "#a855f7",
    type: "ALERT",
    status: "Warning",
    description: "Cross-currency FX hop detected: USD 148,000 converted to JPY across intermediary accounts.",
  },
  {
    id: "evt-4",
    timestamp: "2m ago",
    source: "National Bank of the East (BANK-12)",
    sourceColor: "#f59e0b",
    type: "PRIVACY",
    status: "Completed",
    description: "DP-SGD differential privacy guarantee verified: ε = 1.25, δ = 1e-5. Raw data on-premise.",
  },
  {
    id: "evt-5",
    timestamp: "3m ago",
    source: "National Bank of Laramie (BANK-10)",
    sourceColor: "#6366f1",
    type: "BATCH",
    status: "Completed",
    description: "Streamed 2,500 ACH transactions into local Rule Engine. 0 smurfing violations.",
  },
  {
    id: "evt-6",
    timestamp: "5m ago",
    source: "Arbor Savings Bank (BANK-1)",
    sourceColor: "#06b6d4",
    type: "TRAINING",
    status: "Running",
    description: "FraudMLP deep learning update in progress (Batch size 512, AdamW lr=1e-3).",
  },
]

export function LiveSystemEventsPanel({ maxEvents = 6 }: { maxEvents?: number }) {
  const [events, setEvents] = useState<SystemEvent[]>(INITIAL_EVENTS)

  // Dynamically stream realistic events
  useEffect(() => {
    const templates = [
      {
        source: "Oasis Thrift (BANK-70)",
        sourceColor: "#10b981",
        type: "TRAINING" as const,
        status: "Completed" as const,
        description: "Local PyTorch FraudMLP training step completed. DP-SGD gradient clipped to norm 1.0.",
      },
      {
        source: "National Bank of the East (BANK-12)",
        sourceColor: "#f59e0b",
        type: "ALERT" as const,
        status: "Warning" as const,
        description: "Structuring alert: 3 successive $9,850 wire settlements flagged in 20-minute window.",
      },
      {
        source: "FedShield Central Aggregator",
        sourceColor: "#a855f7",
        type: "FEDERATION" as const,
        status: "Completed" as const,
        description: "Global weights broadcasted to 5 participating bank perimeters. Model v2.1.0 synchronized.",
      },
      {
        source: "National Bank of Laramie (BANK-10)",
        sourceColor: "#6366f1",
        type: "BATCH" as const,
        status: "Processing" as const,
        description: "Evaluating incoming credit card stream against global FraudMLP inference pipeline.",
      },
      {
        source: "Japan Bank #0 (BANK-15)",
        sourceColor: "#a855f7",
        type: "PRIVACY" as const,
        status: "Completed" as const,
        description: "Zero-knowledge perimeter audit passed. No customer identifiers exported.",
      },
    ]

    const interval = setInterval(() => {
      const template = templates[Math.floor(Math.random() * templates.length)]
      const newEvt: SystemEvent = {
        id: `evt-${Date.now()}`,
        timestamp: "Just now",
        ...template,
      }

      setEvents((prev) => [newEvt, ...prev.slice(0, 15)])
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const statusBadge = (status: SystemEvent["status"]) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Completed</Badge>
      case "Running":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] animate-pulse">Running</Badge>
      case "Processing":
        return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">Processing</Badge>
      case "Warning":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Warning</Badge>
      case "Failed":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Failed</Badge>
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h3 className="font-semibold text-sm text-foreground tracking-tight">Live System Events Stream</h3>
        </div>
        <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
          5 Nodes Active
        </Badge>
      </div>

      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {events.slice(0, maxEvents).map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition flex flex-col gap-1 text-xs"
          >
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: evt.sourceColor }} />
                <span className="font-medium text-foreground">{evt.source}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{evt.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">{evt.timestamp}</span>
                {statusBadge(evt.status)}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pl-3.5 border-l-2 border-border/70 mt-0.5">
              {evt.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
