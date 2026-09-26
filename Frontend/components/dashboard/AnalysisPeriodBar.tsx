"use client"

import React, { useState } from "react"
import { useTasks } from "@/contexts/TaskContext"
import { useAuth } from "@/contexts/AuthContext"
import { Calendar, AlertCircle, CheckCircle2, Clock, Play, Plus, RefreshCw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function AnalysisPeriodBar({ onTriggerNewTask }: { onTriggerNewTask?: () => void }) {
  const { analysisPeriod, periodError, setAnalysisPeriod } = useTasks()
  const { user } = useAuth()
  const [startInput, setStartInput] = useState(analysisPeriod.startDate)
  const [endInput, setEndInput] = useState(analysisPeriod.endDate)
  const [isEditing, setIsEditing] = useState(false)

  const handleApply = () => {
    const success = setAnalysisPeriod({ startDate: startInput, endDate: endInput })
    if (success) {
      setIsEditing(false)
      toast.success(`Analysis window updated: ${startInput} → ${endInput}`)
    } else {
      toast.error(periodError || "Invalid date range")
    }
  }

  const applyPreset = (days: number, label: string) => {
    const end = new Date("2022-09-30")
    const start = new Date("2022-09-30")
    start.setDate(end.getDate() - days)

    const sStr = start.toISOString().split("T")[0]
    const eStr = end.toISOString().split("T")[0]
    setStartInput(sStr)
    setEndInput(eStr)
    setAnalysisPeriod({ startDate: sStr, endDate: eStr })
    toast.info(`Preset applied: ${label} (${sStr} to ${eStr})`)
  }

  return (
    <div className="w-full bg-card/60 backdrop-blur border border-border/80 rounded-xl p-3.5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Active Period Badge & Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>Analysis Period:</span>
            <span className="font-mono text-foreground font-bold">
              {analysisPeriod.startDate} &nbsp;→&nbsp; {analysisPeriod.endDate}
            </span>
          </div>

          <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 py-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            IBM Q3 Verified Dataset
          </Badge>

          {/* Quick Presets */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-[11px] mr-1 text-muted-foreground/70">Presets:</span>
            <button
              onClick={() => applyPreset(7, "Last 7 Days")}
              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-medium transition"
            >
              7D
            </button>
            <button
              onClick={() => applyPreset(14, "Last 14 Days")}
              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-medium transition"
            >
              14D
            </button>
            <button
              onClick={() => applyPreset(30, "Full Month")}
              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-medium transition"
            >
              Full Q3 (30D)
            </button>
          </div>
        </div>

        {/* Right: Date Inputs & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1 text-xs">
            <span className="text-muted-foreground text-[10px] font-medium uppercase">Start</span>
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="bg-transparent border-none text-xs font-mono text-foreground focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1 text-xs">
            <span className="text-muted-foreground text-[10px] font-medium uppercase">End</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="bg-transparent border-none text-xs font-mono text-foreground focus:outline-none"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            className="h-8 text-xs px-2.5 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            Apply Filter
          </Button>

          {onTriggerNewTask && (
            <Button
              size="sm"
              onClick={onTriggerNewTask}
              className="h-8 text-xs px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Analysis Task
            </Button>
          )}
        </div>
      </div>

      {periodError && (
        <div className="mt-2 text-xs text-destructive flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{periodError}</span>
        </div>
      )}
    </div>
  )
}
