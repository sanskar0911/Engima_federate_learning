"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  Zap,
  Target,
  FileText,
} from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-1">
          <BarChart2 className="h-3 w-3" />
          <span>System Section: Multi-Bank Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Performance Analytics & Detection Metrics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Comparative analytics comparing Deterministic Rule-Based screening against Federated Deep Learning lift across the 5 bank nodes.
        </p>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground">Combined Monitored Volume</span>
            <CardTitle className="text-xl font-bold font-mono text-foreground">725,964 Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-emerald-400 font-medium">100% Coverage across 5 Banks</span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground">Federated Model ROC-AUC</span>
            <CardTitle className="text-xl font-bold font-mono text-purple-400">0.9333</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-purple-400 font-medium">+36.4% lift over single-bank models</span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground">False Positive Reduction</span>
            <CardTitle className="text-xl font-bold font-mono text-emerald-400">-42.8%</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-emerald-400 font-medium">Reduces operational manual review</span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-muted-foreground">Differential Privacy Level</span>
            <CardTitle className="text-xl font-bold font-mono text-blue-400">ε = 1.25</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-blue-400 font-medium">Bounded mathematical privacy (DPDP)</span>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Grid: Rule Engine vs Federated ML */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span>Intra-Bank Rule Engine Performance (IBM Dataset)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Deterministic rule checks executed locally on private bank nodes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Structuring Rule Trigger Rate:</span>
              <span className="text-foreground font-bold">1.2% of Volume</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">High Liquidity Spike Flag Rate:</span>
              <span className="text-foreground font-bold">4.5% of Volume</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Currency Conversion Flag Rate:</span>
              <span className="text-foreground font-bold">2.8% of Volume</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Off-Hours Flag Rate (00:00-05:00):</span>
              <span className="text-foreground font-bold">18.5% of Volume</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span>Cross-Bank Federated Learning Performance</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Global FraudMLP neural network aggregated across 5 institutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Global Model Convergence Loss:</span>
              <span className="text-emerald-400 font-bold">0.3366 (Decreased from 0.5416)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Aggregated Fraud Detection Accuracy:</span>
              <span className="text-foreground font-bold">83.01% on Test Split</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Bank 2 (Laramie) Test Recall:</span>
              <span className="text-purple-400 font-bold">100.00% (Caught 100% of Fraud)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-muted/20">
              <span className="text-muted-foreground">Bank 3 (East) Test Recall:</span>
              <span className="text-purple-400 font-bold">89.47% (AUC = 0.8934)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
