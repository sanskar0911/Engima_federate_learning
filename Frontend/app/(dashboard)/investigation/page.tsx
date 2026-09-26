"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RunDemoButton } from "@/components/ui/run-demo-button"
import FraudTrendChart from "@/components/analytics/fraud_trand_chart"
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe2,
  Fingerprint,
  RefreshCw,
  Scale,
  Sparkles,
  Zap,
  SplitSquareVertical
} from "lucide-react"

interface AMLScenario {
  id: string
  title: string
  transactionId: string
  amount: number
  sourceBank: string
  targetBank: string
  hops: number
  pattern: string
  siloedScore: number
  siloedDecision: "LOW RISK / APPROVED" | "MEDIUM RISK"
  siloedReason: string
  federatedScore: number
  federatedDecision: "HIGH RISK / BLOCKED" | "CRITICAL / AUTO-FREEZE"
  federatedReason: string
  crossBankSignatures: string[]
}

const AML_SCENARIOS: AMLScenario[] = [
  {
    id: "aml-1",
    title: "Distributed Smurfing & Layering Ring",
    transactionId: "TXN-FED-9821-X",
    amount: 185000,
    sourceBank: "HDFC Bank (Bank 1)",
    targetBank: "Axis Bank (Bank 4)",
    hops: 5,
    pattern: "Sub-threshold structuring across 5 distinct banking institutions",
    siloedScore: 18,
    siloedDecision: "LOW RISK / APPROVED",
    siloedReason: "Isolated bank sees normal single transaction below individual KYC reporting threshold. Blind to concurrent transfers at 4 other banks.",
    federatedScore: 96,
    federatedDecision: "HIGH RISK / BLOCKED",
    federatedReason: "Federated PyTorch model aggregated weight gradients across 5 banks, detecting distributed multi-hop velocity and rapid liquidity drainage.",
    crossBankSignatures: [
      "Bank 1 -> Bank 2 (₹49,000 within 4 mins)",
      "Bank 2 -> Bank 3 (₹48,500 within 7 mins)",
      "Bank 3 -> Bank 5 (₹49,500 within 12 mins)",
      "Bank 5 -> Target Mule (Total ₹1,85,000 consolidated)"
    ]
  },
  {
    id: "aml-2",
    title: "Cross-Institution Circular Wash Loop",
    transactionId: "TXN-FED-4402-C",
    amount: 320000,
    sourceBank: "ICICI Bank (Bank 2)",
    targetBank: "SBI (Bank 5)",
    hops: 4,
    pattern: "Closed-loop circular credit generation across 3 non-cooperating bank silos",
    siloedScore: 22,
    siloedDecision: "LOW RISK / APPROVED",
    siloedReason: "Single bank sees legitimate outgoing wire with valid balance. No visibility into return conduit via Bank 3 & Bank 5.",
    federatedScore: 94,
    federatedDecision: "HIGH RISK / BLOCKED",
    federatedReason: "Federated weights capture global topological cycle entropy without sharing raw customer PII (DPDP Act compliant).",
    crossBankSignatures: [
      "Origin: Shell Entity A (Bank 2)",
      "Conduit B (Bank 3) -> Conduit C (Bank 5)",
      "Loop closure back to origin account within 2 hours"
    ]
  },
  {
    id: "aml-3",
    title: "High-Velocity Sleeper Account Drainage",
    transactionId: "TXN-FED-7719-D",
    amount: 450000,
    sourceBank: "Kotak Bank (Bank 3)",
    targetBank: "Offshore Entity (Bank 1)",
    hops: 3,
    pattern: "Dormant account sudden reactivation and rapid multi-channel liquidation",
    siloedScore: 28,
    siloedDecision: "LOW RISK / APPROVED",
    siloedReason: "Standard static rules evaluate sufficient ledger balance. Fails to recognize nationwide synthetic identity burst.",
    federatedScore: 98,
    federatedDecision: "CRITICAL / AUTO-FREEZE",
    federatedReason: "Differentially private MLP model identifies correlated synthetic behavioral vectors trained across the collaborative consortium.",
    crossBankSignatures: [
      "Dormant for 340 days prior to transfer",
      "Synthetic device fingerprint matched against global blacklist embeddings",
      "Simultaneous IP burst from flagged proxy cluster"
    ]
  }
]

export default function InvestigationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading Investigation Command Center...</div>}>
      <FederatedInvestigationContent />
    </Suspense>
  )
}

function FederatedInvestigationContent() {
  const [selectedScenario, setSelectedScenario] = useState<AMLScenario>(AML_SCENARIOS[0])
  const [isModelTrained, setIsModelTrained] = useState(true)
  const [activeTab, setActiveTab] = useState<"comparison" | "trend">("comparison")

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <SplitSquareVertical className="h-6 w-6 text-primary" />
              Cross-Institution Financial Risk Control
            </h1>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-mono text-xs">
              DPDP Act Compliant
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Before & After Demonstration: Single-Bank Siloed AI vs. Differentially Private Federated Global Intelligence
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-3">
          <RunDemoButton
            onComplete={() => setIsModelTrained(true)}
            label="Trigger 5-Bank Federated Training"
          />
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-card border border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          AML Test Scenarios:
        </span>
        {AML_SCENARIOS.map((scenario) => (
          <Button
            key={scenario.id}
            variant={selectedScenario.id === scenario.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedScenario(scenario)}
            className={`text-xs font-medium ${
              selectedScenario.id === scenario.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {scenario.title}
          </Button>
        ))}
      </div>

      {/* Real-time Dynamic Convergence Chart Ribbon */}
      <FraudTrendChart height={220} showControls={false} className="border-primary/20 shadow-sm" />

      {/* Split Screen Before & After Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: Thin Siloed Data (Single-Bank Model Failure) */}
        <Card className="border-destructive/30 bg-destructive/[0.02] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
          
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                    Thin Siloed Data
                    <Badge variant="destructive" className="text-[10px] font-mono uppercase">
                      Single-Bank AI
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Isolated local model without cross-bank intelligence
                  </CardDescription>
                </div>
              </div>

              <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10 text-xs">
                False Negative
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Risk Gauge */}
            <div className="p-4 rounded-xl bg-card border border-border/80 text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-500">
                {selectedScenario.siloedScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                {selectedScenario.siloedDecision}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Transaction cleared by local bank rules
              </p>
            </div>

            {/* Transaction Under Inspection */}
            <div className="space-y-2 p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-bold text-foreground">{selectedScenario.transactionId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-foreground">₹{selectedScenario.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Local Institution:</span>
                <span className="text-foreground">{selectedScenario.sourceBank}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Local Visibility:</span>
                <span className="text-amber-500 font-semibold">1 / 5 Banks (20% Context)</span>
              </div>
            </div>

            {/* The Failure Root Cause */}
            <div className="p-3.5 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Siloed AI Blind Spot & Compliance Barrier:
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedScenario.siloedReason}
              </p>
              <div className="text-[11px] text-destructive/80 italic pt-1">
                Under DPDP Act and privacy regulations, Bank 1 cannot pool raw customer transaction tables into a central database.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Federated Cross-Institution Global Intelligence */}
        <Card className="border-emerald-500/40 bg-emerald-500/[0.02] shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-400" />
          
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                    Federated AI Engine
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase">
                      5-Bank Consensus
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    PyTorch MLP + Flower FedAvg + Opacus Differential Privacy
                  </CardDescription>
                </div>
              </div>

              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                True Positive (Blocked)
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Risk Gauge */}
            <div className="p-4 rounded-xl bg-card border border-emerald-500/30 text-center shadow-[0_0_20px_rgba(16,185,129,0.12)]">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-destructive/10 text-destructive mb-2 animate-bounce">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="text-3xl font-extrabold text-destructive">
                {selectedScenario.federatedScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
              </div>
              <p className="text-xs font-semibold text-destructive mt-1 uppercase tracking-wider">
                {selectedScenario.federatedDecision}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Distributed Money Laundering Pattern Flagged Across Consortium
              </p>
            </div>

            {/* Privacy & Cross-Bank Intelligence Signatures */}
            <div className="space-y-2 p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Privacy Protection:</span>
                <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                  Opacus DP-SGD (ε=1.28, δ=10⁻⁵)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Consortium Coverage:</span>
                <span className="font-semibold text-emerald-500">5 Banks Synchronized via FedAvg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Data Transmission:</span>
                <span className="font-mono text-xs text-foreground font-semibold">Zero Raw Data Shared (Weights Only)</span>
              </div>
            </div>

            {/* Cross-Bank Detection Signatures */}
            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Collaborative Threat Intelligence:
                </span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500">
                  DPDP Act Compliant
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedScenario.federatedReason}
              </p>

              <div className="pt-2 border-t border-emerald-500/20">
                <p className="text-[11px] font-semibold text-foreground mb-1">Detected Cross-Bank Signatures:</p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  {selectedScenario.crossBankSignatures.map((sig, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {sig}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Architectural Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              DPDP Act & Privacy Law
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>
              Under Indian DPDP Act 2023 and global privacy standards, customer financial tables cannot leave the banking perimeter.
            </p>
            <p className="text-primary font-medium">
              Federated Learning computes local gradients on-premise; only encrypted DP model weights leave each bank.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-purple-500" />
              Differential Privacy (Opacus)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>
              Opacus DP-SGD applies calibrated Gaussian noise and per-sample gradient clipping during PyTorch training.
            </p>
            <p className="text-purple-500 font-medium">
              Mathematically bounds privacy loss (ε ≤ 1.28), preventing gradient inversion and membership inference attacks.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-500" />
              Collaborative Business Value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>
              Converts a 18% false negative into a 96% high-risk interception for distributed layering schemes.
            </p>
            <p className="text-emerald-500 font-medium">
              Eliminates multi-bank blind spots and saves millions in cross-institution AML leakage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}