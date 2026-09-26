"use client"

import React from "react"
import { AnalysisPeriodBar } from "@/components/dashboard/AnalysisPeriodBar"
import { TopInfoSnippets } from "@/components/dashboard/TopInfoSnippets"
import { FiveBankAnalyticsGraph } from "@/components/dashboard/FiveBankAnalyticsGraph"
import { ModelWeightProvenance } from "@/components/dashboard/ModelWeightProvenance"
import { LiveSystemEventsPanel } from "@/components/dashboard/LiveSystemEventsPanel"
import { FederatedNetwork } from "@/components/federated/FederatedNetwork"
import { FederatedRoundCard } from "@/components/federated/FederatedRoundCard"
import { BankStatusGrid } from "@/components/federated/BankStatusGrid"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Sparkles, AlertTriangle, ArrowRight, Layers, Cpu, Activity } from "lucide-react"
import { FIVE_BANKS } from "@/lib/banks-config"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              FedShield Multi-Bank Command Center
            </h1>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
              5-Bank Consortium
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Decentralized AML Surveillance · Differential Privacy DP-SGD (ε=1.25, δ=1e-5) · DPDP Act 2023 Compliant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30 gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            5 Nodes Synchronized
          </Badge>
        </div>
      </div>

      {/* 2. Analysis Period Selector Bar */}
      <AnalysisPeriodBar onTriggerNewTask={() => (window.location.href = "/tasks")} />

      {/* 3. Top Information Snippets */}
      <TopInfoSnippets />

      {/* 4. Main 5-Bank Graph */}
      <FiveBankAnalyticsGraph />

      {/* 5. Federated Learning Model Weight Provenance */}
      <ModelWeightProvenance />

      {/* 6. Federated Network Visualizer & Round Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Live Federated Gradient Bus (5 Nodes)
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time PyTorch weight parameter distribution & gradient aggregation
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                FedAvg / DP-SGD
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FederatedNetwork />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Active Training Round
            </CardTitle>
            <CardDescription className="text-xs">Consortium round lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <FederatedRoundCard showTimeline={true} />
          </CardContent>
        </Card>
      </div>

      {/* 7. Live System Events + Recent Alerts + AI Recommendations */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Live System Events (7 cols) */}
        <div className="lg:col-span-7">
          <LiveSystemEventsPanel maxEvents={7} />
        </div>

        {/* Recent Laundering Alerts & AI Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Recent High-Risk Alerts
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                  856 Total Cases
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RecentAlerts />
            </CardContent>
          </Card>

          {/* AI Recommendation Box */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-400">
              <Sparkles className="h-4 w-4 text-blue-400" />
              AI Consortium Recommendation
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Global model <strong className="text-foreground">FraudMLP v2.1.0</strong> identified a 633-case structuring loop originating from <strong>Oasis Thrift (BANK-70)</strong> and jumping to <strong>National Bank of the East (BANK-12)</strong>. Throttling and SAR filing recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
