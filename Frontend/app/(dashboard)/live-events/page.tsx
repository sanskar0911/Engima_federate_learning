"use client"

import React from "react"
import { LiveSystemEventsPanel } from "@/components/dashboard/LiveSystemEventsPanel"
import { Activity, ShieldCheck, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function LiveEventsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Live System Events & Federated Telemetry
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time operational event stream across all 5 bank node partitions, training epochs, and FedAvg aggregations.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Event Bus Active
        </Badge>
      </div>

      <LiveSystemEventsPanel maxEvents={20} />
    </div>
  )
}
