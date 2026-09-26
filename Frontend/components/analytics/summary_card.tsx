"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, AlertTriangle, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"

type Stats = {
  total: number
  frauds: number
  highRisk: number
}

// 🔥 Animated counter hook
function useCountUp(value: number, duration = 800) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = value / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, duration])

  return count
}

export default function SummaryCards({ stats }: { stats: Stats }) {
  const total = useCountUp(stats?.total ?? 0)
  const frauds = useCountUp(stats?.frauds ?? 0)
  const highRisk = useCountUp(stats?.highRisk ?? 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* TOTAL TRANSACTIONS */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-lg">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Transactions</p>
            <h2 className="text-2xl font-bold">{total}</h2>
          </div>
          <Activity className="text-blue-400" size={28} />
        </CardContent>
      </Card>

      {/* FRAUD DETECTED */}
      <Card className="bg-gradient-to-br from-red-900 to-red-800 border border-red-700 shadow-lg">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-red-300">Frauds Detected</p>
            <h2 className="text-2xl font-bold text-red-100">{frauds}</h2>
          </div>
          <AlertTriangle className="text-red-400" size={28} />
        </CardContent>
      </Card>

      {/* HIGH RISK */}
      <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border border-yellow-700 shadow-lg">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-300">High Risk Accounts</p>
            <h2 className="text-2xl font-bold text-yellow-100">{highRisk}</h2>
          </div>
          <ShieldAlert className="text-yellow-400" size={28} />
        </CardContent>
      </Card>

    </div>
  )
}