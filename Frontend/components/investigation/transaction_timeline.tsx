"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineTransaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: string
  riskScore: number
  status: "normal" | "suspicious" | "flagged"
  type?: string
  reasons?: string[]
}

interface TransactionTimelineProps {
  transactions: TimelineTransaction[]
  accountId?: string
}

const statusConfig = {
  normal: { icon: CheckCircle, color: "text-success", bg: "bg-success", label: "Normal" },
  suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning", label: "Suspicious" },
  flagged: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive", label: "Flagged" },
}

export default function TransactionTimeline({ transactions, accountId }: TransactionTimelineProps) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const totalIn = transactions
    .filter((t) => t.to === accountId)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = transactions
    .filter((t) => t.from === accountId)
    .reduce((sum, t) => sum + t.amount, 0)

  const flaggedCount = transactions.filter((t) => t.status === "flagged").length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Transaction Timeline
          <Badge variant="outline" className="ml-auto">{transactions.length} total</Badge>
        </CardTitle>

        {/* Summary Row */}
        {accountId && (
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-muted-foreground">In:</span>
              <span className="font-semibold text-success">₹{totalIn.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-destructive" />
              <span className="text-muted-foreground">Out:</span>
              <span className="font-semibold text-destructive">₹{totalOut.toLocaleString("en-IN")}</span>
            </div>
            {flaggedCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-auto">{flaggedCount} flagged</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No transactions to display
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

            {sorted.map((txn, i) => {
              const cfg = statusConfig[txn.status]
              const StatusIcon = cfg.icon
              const isIncoming = txn.to === accountId
              const isOutgoing = txn.from === accountId

              return (
                <div key={txn.id} className="relative flex gap-4 pb-4 last:pb-0">
                  {/* Dot */}
                  <div className={cn("relative z-10 mt-1 h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center", txn.status === "flagged" ? "bg-destructive" : txn.status === "suspicious" ? "bg-warning" : "bg-success")}>
                    <StatusIcon className="h-3 w-3 text-white" />
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-1 rounded-lg border p-3 transition-colors hover:bg-muted/30",
                    txn.status === "flagged" ? "border-destructive/30 bg-destructive/5" :
                    txn.status === "suspicious" ? "border-warning/30 bg-warning/5" :
                    "border-border"
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {/* From → To */}
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <span className={cn(isOutgoing ? "text-destructive font-bold" : "text-muted-foreground")}>{txn.from}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className={cn(isIncoming ? "text-success font-bold" : "text-muted-foreground")}>{txn.to}</span>
                          {txn.type && (
                            <Badge variant="outline" className="ml-1 text-[10px] px-1">{txn.type}</Badge>
                          )}
                        </div>

                        {/* Amount + Time */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-card-foreground">
                            ₹{txn.amount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(txn.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Reasons if flagged */}
                        {txn.reasons && txn.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {txn.reasons.map((r, ri) => (
                              <span key={ri} className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Risk Score */}
                      <div className="text-right flex-shrink-0">
                        <div className={cn("text-sm font-bold", cfg.color)}>{txn.riskScore}%</div>
                        <div className={cn("text-[10px]", cfg.color)}>{cfg.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}