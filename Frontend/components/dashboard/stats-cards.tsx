"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ElementType
  variant?: "default" | "warning" | "danger" | "success"
}

function StatCard({ title, value, change, changeLabel, icon: Icon, variant = "default" }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "number" ? value : parseInt(value.replace(/[^0-9]/g, ""))
  const isCurrency = /volume|amount|balance|value/i.test(title)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = numericValue / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericValue])

  const variantStyles = {
    default: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
    success: "text-success",
  }

  const iconBgStyles = {
    default: "bg-primary/10",
    warning: "bg-warning/10",
    danger: "bg-destructive/10",
    success: "bg-success/10",
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">
              {isCurrency
                ? `₹${displayValue.toLocaleString("en-IN")}`
                : displayValue.toLocaleString("en-IN")}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
                <span className={change >= 0 ? "text-success" : "text-destructive"}>
                  {Math.abs(change)}%
                </span>
                <span className="text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-lg p-3", iconBgStyles[variant])}>
            <Icon className={cn("h-6 w-6", variantStyles[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Transactions"
        value={15847}
        change={12.5}
        changeLabel="vs last week"
        icon={Activity}
        variant="default"
      />
      <StatCard
        title="Suspicious Transactions"
        value={234}
        change={-8.2}
        changeLabel="vs last week"
        icon={AlertTriangle}
        variant="warning"
      />
      <StatCard
        title="High-Risk Accounts"
        value={8}
        change={25}
        changeLabel="vs last week"
        icon={Users}
        variant="danger"
      />
      <StatCard
        title="Fraud Alerts"
        value={12}
        change={-15.3}
        changeLabel="vs last week"
        icon={TrendingUp}
        variant="danger"
      />
    </div>
  )
}
