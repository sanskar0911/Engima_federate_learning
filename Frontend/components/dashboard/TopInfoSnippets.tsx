"use client"

import React from "react"
import { FIVE_BANKS, GLOBAL_FEDERATED_SUMMARY } from "@/lib/banks-config"
import { useTasks } from "@/contexts/TaskContext"
import {
  ArrowLeftRight,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  Activity,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function TopInfoSnippets() {
  const { analysisPeriod } = useTasks()

  const snippets = [
    {
      title: "Total Transactions",
      value: "725,964",
      subtext: "Across 5 bank partitions",
      icon: ArrowLeftRight,
      trend: "+14.2% vs Q2",
      trendPositive: true,
      color: "text-blue-400",
      bgGradient: "from-blue-500/10 to-transparent",
    },
    {
      title: "Monitored Liquidity",
      value: "$296.8M",
      subtext: "Multi-currency settlement",
      icon: DollarSign,
      trend: "US Dollar & FX",
      trendPositive: true,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Laundering Flags",
      value: "856 cases",
      subtext: "0.118% smurfing rate",
      icon: AlertTriangle,
      trend: "633 in Oasis Thrift",
      trendPositive: false,
      color: "text-rose-400",
      bgGradient: "from-rose-500/10 to-transparent",
    },
    {
      title: "Intra-Risk Index",
      value: "71.5 / 100",
      subtext: "Elevated Cross-Bank Risk",
      icon: Activity,
      trend: "Rule Engine + ML",
      trendPositive: false,
      color: "text-amber-400",
      bgGradient: "from-amber-500/10 to-transparent",
    },
    {
      title: "Active Bank Nodes",
      value: "5 / 5 Online",
      subtext: "Oasis, Laramie, East, Arbor, Japan",
      icon: Building2,
      trend: "100% Participating",
      trendPositive: true,
      color: "text-indigo-400",
      bgGradient: "from-indigo-500/10 to-transparent",
    },
    {
      title: "Federated Round",
      value: `Round ${GLOBAL_FEDERATED_SUMMARY.activeRound}`,
      subtext: "FedAvg DP-SGD (ε=1.25)",
      icon: Layers,
      trend: "Loss: 0.118",
      trendPositive: true,
      color: "text-purple-400",
      bgGradient: "from-purple-500/10 to-transparent",
    },
    {
      title: "Global Model",
      value: GLOBAL_FEDERATED_SUMMARY.modelVersion,
      subtext: "FraudMLP (36.3k weights)",
      icon: Cpu,
      trend: "96.2% Test AUC",
      trendPositive: true,
      color: "text-cyan-400",
      bgGradient: "from-cyan-500/10 to-transparent",
    },
    {
      title: "Privacy Standard",
      value: "DPDP Act 2023",
      subtext: "Zero raw banking sharing",
      icon: ShieldCheck,
      trend: "PMLA Certified",
      trendPositive: true,
      color: "text-teal-400",
      bgGradient: "from-teal-500/10 to-transparent",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {snippets.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "relative overflow-hidden rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border hover:shadow-md",
            "bg-gradient-to-b",
            item.bgGradient
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{item.title}</span>
            <div className={cn("p-1.5 rounded-lg bg-background/80 border border-border/60", item.color)}>
              <item.icon className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-xl font-bold font-mono tracking-tight text-foreground">{item.value}</div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
              <span className="truncate pr-1">{item.subtext}</span>
              <span
                className={cn(
                  "font-medium text-[10px] px-1.5 py-0.5 rounded-full",
                  item.trendPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}
              >
                {item.trend}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
