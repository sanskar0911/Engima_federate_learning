"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

// ✅ Make Account flexible (backend-safe)
interface AccountNodeData extends Record<string, unknown> {
  label?: string
  account?: any
}

function AccountNodeComponent({
  data,
  selected,
}: any) {
  const account = data?.account || {}

  // 🛡 SAFE DEFAULTS (CRITICAL FIX 🔥)
  const id = account.id || "Unknown"
  const riskScore = account.riskScore ?? 0
  const isSuspicious = account.isSuspicious ?? false
  const type = account.type || "User"
  const country = account.country || "Unknown"
  const balance = account.balance ?? 0

  const riskLevel: "critical" | "high" | "medium" | "low" =
    riskScore >= 75
      ? "critical"
      : riskScore >= 50
      ? "high"
      : riskScore >= 25
      ? "medium"
      : "low"

  const riskColors = {
    critical: "border-destructive bg-destructive/10 text-destructive",
    high: "border-warning bg-warning/10 text-warning",
    medium: "border-chart-5 bg-chart-5/10 text-chart-5",
    low: "border-success bg-success/10 text-success",
  }

  const nodeColors = {
    critical: "bg-destructive/20 border-destructive",
    high: "bg-warning/20 border-warning",
    medium: "bg-muted border-border",
    low: "bg-success/20 border-success",
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 px-4 py-3 shadow-lg transition-all",
        nodeColors[riskLevel],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",

        // 🔥 Suspicious highlight
        isSuspicious && "animate-pulse border-red-500"
      )}
      style={{ minWidth: 160 }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-primary !h-3 !w-3"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !h-3 !w-3"
      />

      <div className="flex flex-col gap-1">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {id}
          </span>

          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              riskColors[riskLevel]
            )}
          >
            {riskScore}%
          </span>
        </div>

        {/* Label */}
        <span className="font-medium text-sm text-foreground truncate">
          {data?.label || "Account"}
        </span>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{type}</span>
          <span>•</span>
          <span>{country}</span>
        </div>

        {/* Balance */}
        <div className="mt-1 text-xs">
          <span className="text-muted-foreground">Balance: </span>
          <span className="font-medium text-foreground">
            ₹{balance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

// ✅ KEEP MEMO (your optimization intact)
export const AccountNode = memo(AccountNodeComponent)