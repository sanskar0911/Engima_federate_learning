"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as api from "@/lib/federated-api"
import { useFederatedSocket } from "./useFederatedSocket"

// ─── Bank Status Hook ─────────────────────────────────────────────────────────

export function useBankStatus() {
  const [banks, setBanks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { on } = useFederatedSocket()

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getBanks()
      setBanks(res.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanks()
    const interval = setInterval(fetchBanks, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [fetchBanks])

  useEffect(() => {
    const handlers = [
      on("federated:bank_connected", (d: any) => {
        setBanks((prev) => prev.map((b) => (b.bankId === d.bankId ? { ...b, status: "ONLINE" } : b)))
      }),
      on("federated:bank_disconnected", (d: any) => {
        setBanks((prev) => prev.map((b) => (b.bankId === d.bankId ? { ...b, status: "OFFLINE" } : b)))
      }),
      on("federated:bank_status_changed", (d: any) => {
        setBanks((prev) =>
          prev.map((b) => (b.bankId === d.bankId ? { ...b, status: d.status, trainingStatus: d.trainingStatus } : b))
        )
      }),
      on("federated:bank_training", (d: any) => {
        setBanks((prev) => prev.map((b) => (b.bankId === d.bankId ? { ...b, status: "TRAINING" } : b)))
      }),
      on("federated:model_received", (d: any) => {
        setBanks((prev) =>
          prev.map((b) => (b.bankId === d.bankId ? { ...b, status: "ONLINE", currentModelVersion: d.globalModelVersion } : b))
        )
      }),
    ]
    return () => handlers.forEach((off) => off())
  }, [on])

  const connectBank = async (bankId: string) => {
    await api.connectBank(bankId)
    await fetchBanks()
  }

  const disconnectBank = async (bankId: string) => {
    await api.disconnectBank(bankId)
    await fetchBanks()
  }

  const connectAll = async () => {
    await api.connectAllBanks()
    await fetchBanks()
  }

  const onlineBanks = banks.filter((b) => b.status !== "OFFLINE" && b.status !== "ERROR")

  return { banks, loading, error, onlineBanks, connectBank, disconnectBank, connectAll, refresh: fetchBanks }
}

// ─── Federated Rounds Hook ────────────────────────────────────────────────────

export function useFederatedRounds() {
  const [rounds, setRounds] = useState<any[]>([])
  const [currentRound, setCurrentRound] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { on } = useFederatedSocket()

  const fetchRounds = useCallback(async () => {
    try {
      setLoading(true)
      const [roundsRes, currentRes] = await Promise.all([api.getRounds(10), api.getCurrentRound()])
      setRounds(roundsRes.data || [])
      setCurrentRound(currentRes.data || null)
    } catch (_) {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  useEffect(() => {
    const offs = [
      on("federated:round_started", (d: any) => {
        setCurrentRound(d)
        setRounds((prev) => [d, ...prev.slice(0, 9)])
      }),
      on("federated:round_status_changed", (d: any) => {
        setCurrentRound((prev: any) => prev?.roundId === d.roundId ? { ...prev, status: d.status } : prev)
        setRounds((prev) => prev.map((r) => r.roundId === d.roundId ? { ...r, status: d.status } : r))
      }),
      on("federated:round_completed", (d: any) => {
        setCurrentRound(null)
        setRounds((prev) => prev.map((r) => r.roundId === d.roundId ? { ...r, ...d, status: "COMPLETED" } : r))
        fetchRounds()
      }),
      on("federated:round_failed", () => {
        setCurrentRound(null)
        fetchRounds()
      }),
    ]
    return () => offs.forEach((off) => off())
  }, [on, fetchRounds])

  const startRound = async () => {
    const res = await api.startRound()
    return res.data
  }

  return { rounds, currentRound, loading, startRound, refresh: fetchRounds }
}

// ─── Global Model Hook ────────────────────────────────────────────────────────

export function useGlobalModel() {
  const [models, setModels] = useState<any[]>([])
  const [currentModel, setCurrentModel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { on } = useFederatedSocket()

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true)
      const [modelsRes, currentRes] = await Promise.all([api.getGlobalModels(), api.getCurrentGlobalModel()])
      setModels(modelsRes.data || [])
      setCurrentModel(currentRes.data || null)
    } catch (_) {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  useEffect(() => {
    const offs = [
      on("federated:model_created", (d: any) => {
        setCurrentModel(d)
        fetchModels()
      }),
      on("federated:aggregation_completed", (d: any) => {
        setCurrentModel((prev: any) => ({ ...prev, ...d }))
      }),
    ]
    return () => offs.forEach((off) => off())
  }, [on, fetchModels])

  return { models, currentModel, loading, refresh: fetchModels }
}

// ─── Privacy Summary Hook ─────────────────────────────────────────────────────

export function usePrivacy() {
  const [summary, setSummary] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { on } = useFederatedSocket()

  const fetchPrivacy = useCallback(async () => {
    try {
      setLoading(true)
      const [sumRes, eventsRes] = await Promise.all([api.getPrivacySummary(), api.getPrivacyEvents(50)])
      setSummary(sumRes.data || null)
      setEvents(eventsRes.data || [])
    } catch (_) {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPrivacy() }, [fetchPrivacy])

  useEffect(() => {
    const off = on("privacy:transfer_event", (d: any) => {
      setEvents((prev) => [d, ...prev].slice(0, 100))
      setSummary((prev: any) => prev ? {
        ...prev,
        privacyEventsTotal: (prev.privacyEventsTotal || 0) + 1,
        blockedTransfers: d.allowed ? prev.blockedTransfers : (prev.blockedTransfers || 0) + 1,
        allowedTransfers: d.allowed ? (prev.allowedTransfers || 0) + 1 : prev.allowedTransfers,
      } : prev)
    })
    return () => off()
  }, [on])

  return { summary, events, loading, refresh: fetchPrivacy }
}

// ─── Federated Demo Hook ──────────────────────────────────────────────────────

export function useFederatedDemo() {
  const [demoState, setDemoState] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [running, setRunning] = useState(false)
  const { on } = useFederatedSocket()

  useEffect(() => {
    const offs = [
      on("federated:demo_started", (d: any) => {
        setRunning(true)
        setDemoState(d)
        setTimeline([])
      }),
      on("federated:demo_timeline_event", (d: any) => {
        setTimeline((prev) => [...prev, d])
      }),
      on("federated:demo_completed", (d: any) => {
        setRunning(false)
        setDemoState(d)
      }),
      on("federated:demo_reset", () => {
        setRunning(false)
        setDemoState(null)
        setTimeline([])
      }),
      on("federated:demo_before_detection", (d: any) => {
        setDemoState((prev: any) => ({ ...prev, ...d }))
      }),
    ]
    return () => offs.forEach((off) => off())
  }, [on])

  const injectPattern = async (patternName: string, sourceBank = "BANK-A", affectedBanks = ["BANK-B", "BANK-C"]) => {
    setRunning(true)
    await api.injectFraudPattern(patternName, sourceBank, affectedBanks)
  }

  const runFullDemo = async (patternName = "CROSS_BANK_FRAUD") => {
    setRunning(true)
    setTimeline([])
    await api.runFullDemo(patternName)
  }

  const reset = async () => {
    setRunning(false)
    await api.resetDemo()
    setDemoState(null)
    setTimeline([])
  }

  return { demoState, timeline, running, injectPattern, runFullDemo, reset }
}

// ─── System Health Hook ───────────────────────────────────────────────────────

export function useSystemHealth() {
  const [health, setHealth] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHealth = useCallback(async () => {
    try {
      const [healthRes, servicesRes] = await Promise.all([api.getHealth(), api.getHealthServices()])
      setHealth(healthRes.data || null)
      setServices(servicesRes.data || [])
    } catch (_) {} finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [fetchHealth])

  return { health, services, loading, refresh: fetchHealth }
}

// ─── Audit Log Hook ────────────────────────────────────────────────────────────

export function useAuditLog(params?: Record<string, string>) {
  const [logs, setLogs] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getAuditLogs(params)
      setLogs(res.data || [])
      setPagination(res.pagination || null)
    } catch (_) {} finally { setLoading(false) }
  }, [JSON.stringify(params)])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return { logs, pagination, loading, refresh: fetchLogs }
}
