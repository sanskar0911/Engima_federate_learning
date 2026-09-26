"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { FIVE_BANKS, GLOBAL_FEDERATED_SUMMARY } from "@/lib/banks-config"

export type TaskStatus = "Pending" | "Running" | "Completed" | "Failed"

export interface AnalysisPeriod {
  startDate: string
  endDate: string
}

export interface AnalysisTask {
  id: string
  name: string
  userId: string
  userName: string
  userEmail: string
  startDate: string
  endDate: string
  status: TaskStatus
  createdAt: string
  completedAt?: string
  progress: number // 0 to 100
  type: string
  selectedBanks: string[]
  logs: string[]
  summary?: {
    totalTransactionsAnalyzed: number
    suspiciousFlagsCount: number
    riskScore: number
    federatedWeightApplied: string
    recommendation: string
  }
}

interface TaskContextType {
  analysisPeriod: AnalysisPeriod
  periodError: string | null
  setAnalysisPeriod: (period: AnalysisPeriod) => boolean
  tasks: AnalysisTask[]
  userTasks: AnalysisTask[]
  activeTask: AnalysisTask | null
  createAnalysisTask: (params: {
    name: string
    startDate?: string
    endDate?: string
    type?: string
    selectedBanks?: string[]
  }) => Promise<AnalysisTask>
  deleteTask: (taskId: string) => void
  retryTask: (taskId: string) => void
}

const DEFAULT_PERIOD: AnalysisPeriod = {
  startDate: "2022-09-01",
  endDate: "2022-09-30",
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

const STORAGE_KEY = "fedshield_user_tasks_v2"
const PERIOD_STORAGE_KEY = "fedshield_analysis_period_v2"

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [analysisPeriod, setPeriodState] = useState<AnalysisPeriod>(DEFAULT_PERIOD)
  const [periodError, setPeriodError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<AnalysisTask[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPeriod = localStorage.getItem(PERIOD_STORAGE_KEY)
      if (savedPeriod) {
        setPeriodState(JSON.parse(savedPeriod))
      }
      const savedTasks = localStorage.getItem(STORAGE_KEY)
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      } else {
        // Populate initial baseline tasks for demo personas if empty
        const initialTasks: AnalysisTask[] = [
          {
            id: "task-init-101",
            name: "Q3 2022 Multi-Bank Cross-Border AML Recon",
            userId: "user-fed-admin",
            userName: "Alex Chen",
            userEmail: "admin@fedshield.io",
            startDate: "2022-09-01",
            endDate: "2022-09-30",
            status: "Completed",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            completedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
            progress: 100,
            type: "Full 5-Bank Federated AML Audit",
            selectedBanks: ["BANK-70", "BANK-10", "BANK-12", "BANK-1", "BANK-15"],
            logs: [
              "Initialized secure federated perimeter across 5 bank nodes",
              "Dispatched FraudMLP v2.1.0 local training rounds",
              "Aggregated 36,289 parameters with DP-SGD (ε=1.25, δ=1e-5)",
              "Audit completed: 725,964 transactions monitored, 856 laundering loops flagged",
            ],
            summary: {
              totalTransactionsAnalyzed: 725964,
              suspiciousFlagsCount: 856,
              riskScore: 74.2,
              federatedWeightApplied: GLOBAL_FEDERATED_SUMMARY.aggregationEquation,
              recommendation: "Submit SAR filing for Oasis Thrift (BANK-70) cluster and quarantine cross-border hops to Japan Bank #0.",
            },
          },
          {
            id: "task-init-102",
            name: "Intra-Bank Smurfing & Velocity Scan (BANK-70)",
            userId: "user-bank-70",
            userName: "Dr. Marcus Vance",
            userEmail: "compliance@oasisthrift.bank",
            startDate: "2022-09-01",
            endDate: "2022-09-15",
            status: "Completed",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            completedAt: new Date(Date.now() - 3600000 * 1.9).toISOString(),
            progress: 100,
            type: "Intra-Bank Rule Engine Evaluation",
            selectedBanks: ["BANK-70"],
            logs: [
              "Loaded 449,859 Oasis Thrift transactions from local partition",
              "Rule evaluation: 5,398 structuring violations ($9k-$10k) identified",
              "Generated local model gradient update (w_1 = 0.620)",
            ],
            summary: {
              totalTransactionsAnalyzed: 449859,
              suspiciousFlagsCount: 633,
              riskScore: 74.2,
              federatedWeightApplied: "w_Oasis = 62.0%",
              recommendation: "Deploy real-time transaction throttling on accounts exhibiting > 3 structuring hops/hour.",
            },
          },
        ]
        setTasks(initialTasks)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks))
      }
    } catch (_) {}
  }, [])

  // Sync to localStorage
  useEffect(() => {
    try {
      if (tasks.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      }
    } catch (_) {}
  }, [tasks])

  const setAnalysisPeriod = useCallback((period: AnalysisPeriod): boolean => {
    if (!period.startDate || !period.endDate) {
      setPeriodError("Analysis start date and end date are required.")
      return false
    }
    const start = new Date(period.startDate).getTime()
    const end = new Date(period.endDate).getTime()

    if (isNaN(start) || isNaN(end)) {
      setPeriodError("Invalid date format provided.")
      return false
    }
    if (end < start) {
      setPeriodError("End date cannot be prior to start date.")
      return false
    }

    setPeriodError(null)
    setPeriodState(period)
    try {
      localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(period))
    } catch (_) {}
    return true
  }, [])

  // Filter tasks strictly by current authenticated user
  const currentUserId = user?.id || "user-guest"
  const userTasks = tasks.filter((t) => t.userId === currentUserId)
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null

  const createAnalysisTask = async ({
    name,
    startDate,
    endDate,
    type = "Full 5-Bank Federated AML Audit",
    selectedBanks = ["BANK-70", "BANK-10", "BANK-12", "BANK-1", "BANK-15"],
  }: {
    name: string
    startDate?: string
    endDate?: string
    type?: string
    selectedBanks?: string[]
  }): Promise<AnalysisTask> => {
    const sDate = startDate || analysisPeriod.startDate
    const eDate = endDate || analysisPeriod.endDate

    const newTask: AnalysisTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim() || `AML Analysis Task ${new Date().toLocaleDateString()}`,
      userId: user?.id || "user-guest",
      userName: user?.name || "Guest Officer",
      userEmail: user?.email || "guest@bank.local",
      startDate: sDate,
      endDate: eDate,
      status: "Running",
      createdAt: new Date().toISOString(),
      progress: 5,
      type,
      selectedBanks,
      logs: [
        `[${new Date().toLocaleTimeString()}] Task scheduled by ${user?.name || "User"}`,
        `[${new Date().toLocaleTimeString()}] Target period: ${sDate} to ${eDate}`,
        `[${new Date().toLocaleTimeString()}] Querying on-premise partitions for ${selectedBanks.length} bank nodes...`,
      ],
    }

    // Add to state immediately
    setTasks((prev) => [newTask, ...prev])
    setActiveTaskId(newTask.id)

    // Simulate progressive execution steps
    const stepInterval = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== newTask.id) return t

          const currentP = t.progress
          if (currentP < 25) {
            return {
              ...t,
              progress: 25,
              logs: [...t.logs, `[${new Date().toLocaleTimeString()}] Partitioning local transaction streams for selected nodes...`],
            }
          } else if (currentP < 60) {
            return {
              ...t,
              progress: 60,
              logs: [...t.logs, `[${new Date().toLocaleTimeString()}] Running FraudMLP PyTorch deep learning weights + DP-SGD calibration (ε=1.25)...`],
            }
          } else if (currentP < 85) {
            return {
              ...t,
              progress: 85,
              logs: [...t.logs, `[${new Date().toLocaleTimeString()}] Aggregating FedAvg gradient matrices into global model v2.1.0...`],
            }
          } else {
            clearInterval(stepInterval)
            return {
              ...t,
              progress: 100,
              status: "Completed",
              completedAt: new Date().toISOString(),
              logs: [
                ...t.logs,
                `[${new Date().toLocaleTimeString()}] Cross-bank risk assessment complete. Model weights aggregated successfully.`,
              ],
              summary: {
                totalTransactionsAnalyzed: 725964,
                suspiciousFlagsCount: 856,
                riskScore: 71.5,
                federatedWeightApplied: GLOBAL_FEDERATED_SUMMARY.aggregationEquation,
                recommendation: "Flagged high-risk inter-bank velocity between Oasis Thrift (BANK-70) and National Bank of the East (BANK-12).",
              },
            }
          }
        })
      )
    }, 1200)

    return newTask
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    if (activeTaskId === taskId) setActiveTaskId(null)
  }

  const retryTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          status: "Running",
          progress: 10,
          logs: [...t.logs, `[${new Date().toLocaleTimeString()}] Task re-triggered. Processing node datasets...`],
        }
      })
    )
  }

  return (
    <TaskContext.Provider
      value={{
        analysisPeriod,
        periodError,
        setAnalysisPeriod,
        tasks,
        userTasks,
        activeTask,
        createAnalysisTask,
        deleteTask,
        retryTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
