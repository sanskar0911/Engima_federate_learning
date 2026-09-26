"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Alert } from "@/app/(dashboard)/alerts/page"
import { AlertTriangle, RefreshCw, CheckCircle2, Clock, ShieldAlert, ShieldCheck, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { io } from "socket.io-client"
import { API_BASE_URL } from "@/lib/api-service"

const alertTypeIcons = {
  circular_transaction: "Circular",
  rapid_transfer: "Rapid",
  structuring: "Structuring",
  velocity: "Velocity",
  dormant_activation: "Dormant",
}

const statusConfig: any = {
  open: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  investigating: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  resolved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  PENDING: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  VERIFIED: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  FRAUD: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
  CLOSED: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  BLOCKED: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
  COMPLETED: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  REQUIRE_MFA: { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10" }
}

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadAlerts = async () => {
      try {
        const { fraudApi } = await import("@/lib/api-service");
        const data: any[] = await fraudApi.getAlerts() as any[];
        const mappedAlerts: Alert[] = data.map((d: any) => ({
          ...d,
          id: d._id || d.id || "unknown",
          type: d.type || "Suspicious Activity",
          riskScore: d.fraudScore ?? d.riskScore ?? 0,
          description: d.reasons?.join(", ") || d.description || "System flagged this activity.",
          timestamp: d.createdAt || d.timestamp || new Date().toISOString(),
          status: d.status || "open"
        }));
        setAlerts(mappedAlerts);
        
        // 🟢 Phase 11: Listen to live socket feed
        const socket = io(API_BASE_URL);
        socket.on("new-alert", (d: any) => {
          setAlerts((prev) => {
             const newAlert = {
               ...d,
               id: d._id || d.id || "unknown",
               type: d.type || "Live Alert",
               riskScore: d.fraudScore ?? d.riskScore ?? 0,
               description: d.reasons?.join(", ") || "System flagged this activity.",
               timestamp: d.createdAt || d.timestamp || new Date().toISOString(),
               status: d.status || "open"
             };
             return [newAlert, ...prev];
          });
        });
        
        return () => { socket.disconnect(); };
      } catch (err) {
        console.error("Failed to fetch recent alerts", err);
      }
    }
    loadAlerts();
  }, [])

  if (!mounted) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Recent Fraud Alerts</CardTitle>
              <CardDescription>Latest detected suspicious activities</CardDescription>
            </div>
            <Badge variant="destructive" className="text-sm">
              --
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full animate-pulse rounded-md bg-muted/40" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent Fraud Alerts</CardTitle>
            <CardDescription>Latest detected suspicious activities</CardDescription>
          </div>
          <Badge variant="destructive" className="text-sm">
            {alerts.filter((a) => a.status === "open").length} Open
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.slice(0, 5).map((alert) => {
            const StatusIcon = statusConfig[alert.status].icon
            return (
              <div
                key={alert.id}
                className="flex items-start justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      statusConfig[alert.status].bg
                    )}
                  >
                    <StatusIcon className={cn("h-5 w-5", statusConfig[alert.status].color)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-card-foreground">
                        {(alertTypeIcons as any)[alert.type] || "Alert"} Transaction Alert
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          alert.riskScore >= 80
                            ? "border-destructive text-destructive"
                            : alert.riskScore >= 60
                            ? "border-warning text-warning"
                            : "border-muted-foreground"
                        )}
                      >
                        Risk: {alert.riskScore}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    {/* 🟢 Phase 11: Risk Explanation Panel */}
                    {alert.risk_breakdown && alert.risk_breakdown.length > 0 && (
                      <div className="mt-2 space-y-1 rounded bg-background p-2 text-xs border border-border">
                        <span className="font-semibold text-muted-foreground block mb-1">Risk Factors:</span>
                        {alert.risk_breakdown.map((r: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-muted-foreground">
                            <span className="capitalize">{r.type}: {r.reason}</span>
                            <span className="font-medium text-destructive">+{r.contribution}pts</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>Account: {alert.accountId}</span>
                      {alert.amount && <span>Amount: ₹{alert.amount.toLocaleString("en-IN")}</span>}
                    </div>
                    <Link href={`/reports?accountId=${alert.accountId}`}>
                      <Button variant="ghost" size="sm" className="gap-1 mt-2 h-7 text-[10px] uppercase font-bold tracking-tight hover:bg-primary/10 hover:text-primary transition-all duration-200">
                        <FileText className="h-3 w-3" />
                        View Account Report
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      alert.status === "open"
                        ? "destructive"
                        : alert.status === "investigating"
                        ? "default"
                        : "secondary"
                    }
                    className={cn(
                      alert.status === "investigating" && "bg-warning text-warning-foreground",
                      alert.status === "resolved" && "bg-success text-success-foreground"
                    )}
                  >
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
