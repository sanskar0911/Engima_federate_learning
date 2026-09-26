"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ShieldAlert,
  Building2,
  Cpu,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Coins,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  FileSearch,
} from "lucide-react"

interface BankIntraRisk {
  bankKey: string
  bankIdNum: number
  bankName: string
  region: string
  datasetFile: string
  federatedWeight: number
  federatedWeightPct: string
  totalTransactions: number
  actualFraudCases: number
  actualFraudRatePct: string
  ruleEngineRiskScore: number
  ruleDistribution: {
    RULE_STRUCTURING: number
    RULE_LARGE_SPIKE: number
    RULE_CURRENCY_MISMATCH: number
    RULE_OFF_HOURS: number
    RULE_HIGH_RISK_CHANNEL: number
  }
  topHighRiskRules: Array<{ rule: string; count: number; weight: string }>
  sampleEvaluations: Array<any>
}

export default function IntraBankRiskPage() {
  const [bankData, setBankData] = useState<Record<string, BankIntraRisk>>({})
  const [selectedBankKey, setSelectedBankKey] = useState<string>("BANK-70")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIntraRisk() {
      try {
        const res = await fetch("http://localhost:5000/api/federated/intra-bank-risk")
        const json = await res.json()
        if (json.success && json.data) {
          setBankData(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch intra-bank risk:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchIntraRisk()
  }, [])

  const currentBank = bankData[selectedBankKey] || Object.values(bankData)[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-1">
            <Building2 className="h-3 w-3" />
            <span>Stage 1: Intra-Bank Deterministic Risk Analysis</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Individual Bank Risk Profiling (IBM AML Dataset)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Internal rule-based screening engine evaluating transactions within each of the 5 institutional nodes before cross-bank federated aggregation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/federated/cross-bank" className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span>Proceed to Federated Cross-Bank</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 5 Banks Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(bankData).map(([key, bank]) => {
          const isSelected = selectedBankKey === key
          return (
            <Card
              key={key}
              onClick={() => setSelectedBankKey(key)}
              className={`cursor-pointer transition-all border ${
                isSelected
                  ? "border-primary ring-1 ring-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border hover:border-border/80 hover:bg-card/80"
              }`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isSelected ? "default" : "outline"} className="text-[10px]">
                    Bank ID: {bank.bankIdNum}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">{bank.federatedWeightPct} Wt</span>
                </div>
                <CardTitle className="text-sm font-semibold mt-1 truncate">{bank.bankName}</CardTitle>
                <CardDescription className="text-xs truncate">{bank.region}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-medium font-mono">{bank.totalTransactions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Intra-Risk:</span>
                  <span
                    className={`font-semibold font-mono ${
                      bank.ruleEngineRiskScore > 70
                        ? "text-red-400"
                        : bank.ruleEngineRiskScore > 60
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {bank.ruleEngineRiskScore} / 100
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {currentBank && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Deep Bank Rule Evaluation */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-amber-400" />
                      <span>{currentBank.bankName} — Intra-Bank Rule Engine Summary</span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Source Node File: <span className="font-mono text-foreground">{currentBank.datasetFile}</span> | Region: {currentBank.region}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="px-3 py-1 font-mono text-sm border-amber-500/30 bg-amber-500/10 text-amber-400"
                  >
                    Risk Index: {currentBank.ruleEngineRiskScore}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-[11px] text-muted-foreground">Monitored Records</span>
                    <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                      {currentBank.totalTransactions.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-[11px] text-muted-foreground">Confirmed Fraud Cases</span>
                    <p className="text-lg font-bold font-mono text-red-400 mt-0.5">
                      {currentBank.actualFraudCases.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-[11px] text-muted-foreground">Laundering Ratio</span>
                    <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                      {currentBank.actualFraudRatePct}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-[11px] text-muted-foreground">Federated Sample Weight</span>
                    <p className="text-lg font-bold font-mono text-blue-400 mt-0.5">
                      {currentBank.federatedWeightPct}
                    </p>
                  </div>
                </div>

                {/* Rule Breakdown Bars */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Intra-Bank Rule Violation Breakdown
                  </h4>
                  <div className="space-y-3">
                    {currentBank.topHighRiskRules.map((ruleItem, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                            {ruleItem.rule}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {ruleItem.count.toLocaleString()} triggers ({ruleItem.weight})
                          </span>
                        </div>
                        <Progress value={Math.min(100, (ruleItem.count / (currentBank.totalTransactions * 0.2)) * 100)} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Sample Transaction Evaluations */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span>Recent IBM AML Transactions Scanned (Intra-Bank Rule Inspector)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Real Dataset Samples</span>
                  </h4>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground sticky top-0">
                          <tr>
                            <th className="p-2.5">Timestamp</th>
                            <th className="p-2.5">Account</th>
                            <th className="p-2.5">Amount Paid</th>
                            <th className="p-2.5">Channel</th>
                            <th className="p-2.5">Rule Score</th>
                            <th className="p-2.5">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-mono text-[11px]">
                          {currentBank.sampleEvaluations && currentBank.sampleEvaluations.length > 0 ? (
                            currentBank.sampleEvaluations.map((tx, idx) => (
                              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className="p-2.5 text-muted-foreground whitespace-nowrap">{tx.Timestamp || "2022/09/01"}</td>
                                <td className="p-2.5 text-foreground">{tx.Account || "8000EBD30"}</td>
                                <td className="p-2.5 font-bold text-foreground">
                                  ${parseFloat(tx["Amount Paid"] || 0).toLocaleString()} {tx["Payment Currency"]}
                                </td>
                                <td className="p-2.5 text-muted-foreground">{tx["Payment Format"] || "ACH"}</td>
                                <td className="p-2.5 font-bold">
                                  <span className={tx.riskScore > 60 ? "text-red-400" : tx.riskScore > 30 ? "text-amber-400" : "text-emerald-400"}>
                                    {tx.riskScore || 25}/100
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] px-1.5 py-0.5 ${
                                      tx.riskLevel === "CRITICAL"
                                        ? "border-red-500/40 bg-red-500/10 text-red-400"
                                        : tx.riskLevel === "ELEVATED"
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    }`}
                                  >
                                    {tx.riskLevel || "LOW"}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                Loading dataset transactions...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Two-Stage Pipeline Flow */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  <span>Two-Stage Detection Flow</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Deterministic Rule Engine vs Federated Deep Learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-blue-400">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span>Stage 1: Intra-Bank Screening (Active)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Operates strictly inside <strong>{currentBank.bankName}</strong>'s private firewall using the Backend Rule Engine. Catches immediate structuring, velocity spikes, and known threshold violations with zero data sharing.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="h-6 w-0.5 bg-border" />
                </div>

                <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-purple-400">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Stage 2: Feature Engineering & Federated Learning</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Transforms transactions into 12 normalized dimensions, trains local <strong>FraudMLP</strong> models (~36.3k params), and aggregates cross-bank gradients into a global model via <strong>FedAvg</strong> with <strong>DP-SGD</strong>.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" asChild>
                  <Link href="/federated/cross-bank" className="flex items-center justify-center gap-2">
                    <span>Explore Cross-Bank Model Execution</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Federated Network Participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Node Client ID:</span>
                  <span className="font-mono font-bold text-foreground">BANK-{currentBank.bankIdNum}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Aggregation Weight (w_k):</span>
                  <span className="font-mono font-bold text-purple-400">{currentBank.federatedWeightPct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Privacy Protection:</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                    (ε=1.25, δ=1e-5) DPDP Act
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Model Parameters:</span>
                  <span className="font-mono text-muted-foreground">36,289 trainable weights</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
