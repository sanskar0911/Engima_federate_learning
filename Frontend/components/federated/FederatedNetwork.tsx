"use client"

import { useEffect, useRef, useState } from "react"
import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { useBankStatus } from "@/hooks/useFederated"
import { cn } from "@/lib/utils"

type NodePos = { x: number; y: number }
type FlowLine = { from: NodePos; to: NodePos; active: boolean; color: string; id: string }

const AGGREGATOR: NodePos = { x: 400, y: 90 }
const BANK_POSITIONS: Record<string, NodePos> = {
  "BANK-70": { x: 90,  y: 280 },
  "BANK-10": { x: 245, y: 310 },
  "BANK-12": { x: 400, y: 320 },
  "BANK-1":  { x: 555, y: 310 },
  "BANK-15": { x: 710, y: 280 },
  // Backward compatibility aliases
  "BANK-A":  { x: 90,  y: 280 },
  "BANK-B":  { x: 245, y: 310 },
  "BANK-C":  { x: 400, y: 320 },
}

const STATUS_COLORS: Record<string, string> = {
  ONLINE:      "#22c55e",
  OFFLINE:     "#71717a",
  TRAINING:    "#3b82f6",
  UPLOADING:   "#8b5cf6",
  AGGREGATING: "#f59e0b",
  UPDATING:    "#0ea5e9",
  ERROR:       "#ef4444",
}

const STATUS_GLOW: Record<string, string> = {
  TRAINING:    "drop-shadow(0 0 8px #3b82f6)",
  UPLOADING:   "drop-shadow(0 0 8px #8b5cf6)",
  AGGREGATING: "drop-shadow(0 0 8px #f59e0b)",
  UPDATING:    "drop-shadow(0 0 8px #0ea5e9)",
  ERROR:       "drop-shadow(0 0 8px #ef4444)",
}

function AnimatedLine({ from, to, color, active }: { from: NodePos; to: NodePos; color: string; active: boolean }) {
  return (
    <line
      x1={from.x} y1={from.y}
      x2={to.x} y2={to.y}
      stroke={color}
      strokeWidth={active ? 2 : 1}
      strokeOpacity={active ? 1 : 0.25}
      strokeDasharray={active ? "6 4" : "none"}
      style={active ? { animation: "dashMove 1.5s linear infinite" } : undefined}
    />
  )
}

function AggregatorNode({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.ONLINE
  return (
    <g>
      <circle cx={AGGREGATOR.x} cy={AGGREGATOR.y} r={46} fill="#1e1e2e" stroke={color} strokeWidth={2} />
      <circle cx={AGGREGATOR.x} cy={AGGREGATOR.y} r={38} fill="#13131f" />
      <text x={AGGREGATOR.x} y={AGGREGATOR.y - 8} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">FEDERATED</text>
      <text x={AGGREGATOR.x} y={AGGREGATOR.y + 6} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontFamily="monospace" fontWeight="bold">AGGREGATOR</text>
      <circle cx={AGGREGATOR.x + 30} cy={AGGREGATOR.y - 30} r={6} fill={color} />
    </g>
  )
}

function BankNode({ bankId, pos, status, modelVersion }: { bankId: string; pos: NodePos; status: string; modelVersion?: string }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.ONLINE
  const glow = STATUS_GLOW[status] || ""
  return (
    <g style={glow ? { filter: glow } : undefined}>
      <rect x={pos.x - 44} y={pos.y - 26} width={88} height={52} rx={8} fill="#1e1e2e" stroke={color} strokeWidth={1.5} />
      <text x={pos.x} y={pos.y - 6} textAnchor="middle" fill={color} fontSize={11} fontFamily="monospace" fontWeight="bold">{bankId}</text>
      <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill="#71717a" fontSize={8} fontFamily="monospace">{status}</text>
      {modelVersion && (
        <text x={pos.x} y={pos.y + 18} textAnchor="middle" fill="#3f3f56" fontSize={7} fontFamily="monospace">{modelVersion}</text>
      )}
    </g>
  )
}

export function FederatedNetwork() {
  const { banks } = useBankStatus()
  const { on } = useFederatedSocket()
  const [activeFlows, setActiveFlows] = useState<Record<string, "up" | "down" | null>>({})
  const [aggregatorStatus, setAggregatorStatus] = useState<"IDLE" | "AGGREGATING" | "DISTRIBUTING">("IDLE")

  const bankMap: Record<string, any> = {}
  banks.forEach((b) => { bankMap[b.bankId] = b })

  const realBanks = ["BANK-70", "BANK-10", "BANK-12", "BANK-1", "BANK-15"]

  useEffect(() => {
    const offs = [
      on("federated:bank_training", (d: any) => {
        setActiveFlows((prev) => ({ ...prev, [d.bankId]: null }))
      }),
      on("federated:update_received", (d: any) => {
        setActiveFlows((prev) => ({ ...prev, [d.bankId]: "up" }))
        setTimeout(() => setActiveFlows((prev) => ({ ...prev, [d.bankId]: null })), 3000)
      }),
      on("federated:aggregation_started", () => {
        setAggregatorStatus("AGGREGATING")
      }),
      on("federated:aggregation_completed", () => {
        setAggregatorStatus("DISTRIBUTING")
      }),
      on("federated:model_distribution_started", () => {
        setAggregatorStatus("DISTRIBUTING")
        realBanks.forEach((b, i) => {
          setTimeout(() => setActiveFlows((prev) => ({ ...prev, [b]: "down" })), i * 300)
          setTimeout(() => setActiveFlows((prev) => ({ ...prev, [b]: null })), i * 300 + 2200)
        })
      }),
      on("federated:round_completed", () => {
        setAggregatorStatus("IDLE")
        setActiveFlows({})
      }),
      on("federated:round_failed", () => {
        setAggregatorStatus("IDLE")
        setActiveFlows({})
      }),
    ]
    return () => offs.forEach((off) => off())
  }, [on])

  return (
    <div className="w-full overflow-x-auto">
      <style>{`@keyframes dashMove { to { stroke-dashoffset: -20; } }`}</style>
      <svg viewBox="0 0 800 390" className="w-full max-w-3xl mx-auto" style={{ minWidth: 520 }}>
        {/* Connection lines */}
        {realBanks.map((bankId) => {
          const pos = BANK_POSITIONS[bankId]
          if (!pos) return null
          const flow = activeFlows[bankId]
          const isUp = flow === "up"
          const isDown = flow === "down"
          return (
            <g key={bankId}>
              {isDown ? (
                <AnimatedLine from={AGGREGATOR} to={pos} color="#0ea5e9" active={true} />
              ) : (
                <AnimatedLine from={pos} to={AGGREGATOR} color="#8b5cf6" active={isUp} />
              )}
            </g>
          )
        })}

        {/* Aggregator node */}
        <AggregatorNode status={aggregatorStatus === "AGGREGATING" ? "AGGREGATING" : aggregatorStatus === "DISTRIBUTING" ? "UPDATING" : "ONLINE"} />

        {/* Bank nodes */}
        {realBanks.map((bankId) => {
          const pos = BANK_POSITIONS[bankId]
          if (!pos) return null
          const b = bankMap[bankId]
          const status = b?.status || "ONLINE"
          return (
            <BankNode
              key={bankId}
              bankId={bankId}
              pos={pos}
              status={status}
              modelVersion={b?.currentModelVersion || "v2.1.0-fedavg"}
            />
          )
        })}
      </svg>
    </div>
  )
}
