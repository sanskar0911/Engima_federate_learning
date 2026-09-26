"use client"

import React, { useState } from "react"
import { useTasks, AnalysisTask } from "@/contexts/TaskContext"
import { useAuth } from "@/contexts/AuthContext"
import { FIVE_BANKS } from "@/lib/banks-config"
import {
  Play,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Calendar,
  Layers,
  Shield,
  Activity,
  User,
  Terminal,
  FileText,
  Building2,
  CheckSquare,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function TasksPage() {
  const { userTasks, createAnalysisTask, deleteTask, retryTask, analysisPeriod } = useTasks()
  const { user } = useAuth()

  // Modal / Form state
  const [showModal, setShowModal] = useState(false)
  const [taskName, setTaskName] = useState("")
  const [startDate, setStartDate] = useState(analysisPeriod.startDate)
  const [endDate, setEndDate] = useState(analysisPeriod.endDate)
  const [taskType, setTaskType] = useState("Full 5-Bank Federated AML Audit")
  const [selectedBanks, setSelectedBanks] = useState<string[]>([
    "BANK-70", "BANK-10", "BANK-12", "BANK-1", "BANK-15"
  ])
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<AnalysisTask | null>(null)

  const toggleBank = (bankId: string) => {
    if (selectedBanks.includes(bankId)) {
      if (selectedBanks.length === 1) {
        toast.error("At least one bank node must be selected")
        return
      }
      setSelectedBanks(selectedBanks.filter((b) => b !== bankId))
    } else {
      setSelectedBanks([...selectedBanks, bankId])
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) {
      toast.error("Please provide a name for this analysis task")
      return
    }

    try {
      const task = await createAnalysisTask({
        name: taskName,
        startDate,
        endDate,
        type: taskType,
        selectedBanks,
      })
      toast.success(`Analysis task "${task.name}" started!`)
      setShowModal(false)
      setTaskName("")
      setSelectedTaskDetails(task)
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate task")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                User Analysis Tasks & Federated Execution
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authenticated task workspace — tasks and analysis results are strictly isolated per user account.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Isolation Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card text-xs">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Session:</span>
            <span className="font-semibold text-foreground">{user?.name || "Guest Officer"}</span>
            <Badge variant="secondary" className="text-[10px]">
              {userTasks.length} {userTasks.length === 1 ? "task" : "tasks"}
            </Badge>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs h-9 px-3.5 shadow-md gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Analysis Task
          </Button>
        </div>
      </div>

      {/* Main Grid: Task List + Active Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task History List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Task History ({userTasks.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Isolated workspace for <strong className="text-foreground">{user?.email || "Current User"}</strong>
            </span>
          </div>

          {userTasks.length === 0 ? (
            <div className="p-12 border border-dashed rounded-xl text-center space-y-3 bg-card/40">
              <Layers className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
              <div className="text-sm font-semibold text-foreground">No analysis tasks created yet</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Schedule your first federated AML audit across the 5 bank nodes to evaluate local models and aggregate weights.
              </p>
              <Button size="sm" onClick={() => setShowModal(true)} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Task Now
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {userTasks.map((t) => {
                const isSelected = selectedTaskDetails?.id === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskDetails(t)}
                    className={cn(
                      "p-4 rounded-xl border bg-card cursor-pointer transition-all hover:border-border hover:shadow-sm space-y-3",
                      isSelected ? "border-blue-500/50 bg-blue-500/5 shadow-sm" : "border-border/80"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">{t.name}</h3>
                          <Badge
                            className={cn(
                              "text-[10px]",
                              t.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : t.status === "Running"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{t.type}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground font-mono">
                          {t.startDate} → {t.endDate}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTask(t.id)
                            toast.info("Task removed from workspace")
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Execution Progress</span>
                        <span className="font-mono font-semibold">{t.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer tags */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px]">Nodes:</span>
                        {t.selectedBanks.map((bId) => (
                          <span key={bId} className="px-1.5 py-0.5 rounded bg-muted/60 font-mono text-[10px]">
                            {bId}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px]">Created {new Date(t.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Execution Logs & Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
            <Terminal className="h-4 w-4 text-purple-400" />
            Live Execution Logs & Results
          </h2>

          {selectedTaskDetails ? (
            <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{selectedTaskDetails.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedTaskDetails.id}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Target Period: <strong className="text-foreground">{selectedTaskDetails.startDate} → {selectedTaskDetails.endDate}</strong>
                </div>
              </div>

              {/* Summary Stats if completed */}
              {selectedTaskDetails.summary && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-2 text-xs">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Audit Findings Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded bg-background border border-border/50">
                      <div className="text-[10px] text-muted-foreground">Transactions</div>
                      <div className="text-sm font-bold font-mono text-foreground">
                        {selectedTaskDetails.summary.totalTransactionsAnalyzed.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-background border border-border/50">
                      <div className="text-[10px] text-muted-foreground">Laundering Flags</div>
                      <div className="text-sm font-bold font-mono text-destructive">
                        {selectedTaskDetails.summary.suspiciousFlagsCount} cases
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <strong>Action:</strong> {selectedTaskDetails.summary.recommendation}
                  </div>
                </div>
              )}

              {/* Log Output Terminal */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Console Output Stream
                </span>
                <div className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-300 space-y-1 max-h-56 overflow-y-auto border border-zinc-800">
                  {selectedTaskDetails.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-blue-400 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTaskDetails.status === "Completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => retryTask(selectedTaskDetails.id)}
                  className="w-full text-xs gap-1.5 border-border"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-Execute Analysis Task
                </Button>
              )}
            </div>
          ) : (
            <div className="p-8 border border-dashed rounded-xl text-center text-xs text-muted-foreground bg-card/30">
              Select a task from the list on the left to inspect logs and findings.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Analysis Task */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-base text-foreground">Configure New Analysis Task</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Task Name */}
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Task Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 2022 5-Bank Smurfing Recon"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Analysis Period */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-input bg-background text-foreground font-mono text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-input bg-background text-foreground font-mono text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Analysis Type */}
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Analysis Workflow</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none"
                >
                  <option value="Full 5-Bank Federated AML Audit">Full 5-Bank Federated AML Audit (FedAvg)</option>
                  <option value="Intra-Bank Smurfing & Velocity Scan">Intra-Bank Smurfing & Velocity Scan</option>
                  <option value="Cross-Bank Mule Jump Recon">Cross-Bank Mule Jump Recon</option>
                  <option value="DP-SGD Model Parameter Retrain">DP-SGD Model Parameter Retrain (ε=1.25)</option>
                </select>
              </div>

              {/* Bank Scope Selector */}
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Participating Bank Nodes (5 Available)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {FIVE_BANKS.map((b) => {
                    const isChecked = selectedBanks.includes(b.id)
                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleBank(b.id)}
                        className={cn(
                          "p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition",
                          isChecked ? b.borderColor + " " + b.bgColor : "border-border/50 text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                          <span className="font-medium text-foreground">{b.name}</span>
                        </div>
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4">
                  <Play className="h-3.5 w-3.5 mr-1" /> Initiate Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
