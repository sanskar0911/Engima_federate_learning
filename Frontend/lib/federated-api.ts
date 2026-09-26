/**
 * FedShield API Service
 * All backend calls for the federated system, banks, rounds, models, privacy, demo, audit.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "")

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || err.message || res.statusText)
  }
  return res.json()
}

// ─── Banks ────────────────────────────────────────────────────────────────────

export const getBanks = () => apiFetch("/api/federated/banks")
export const getBankById = (bankId: string) => apiFetch(`/api/federated/banks/${bankId}`)
export const connectBank = (bankId: string) => apiFetch(`/api/federated/banks/${bankId}/connect`, { method: "POST" })
export const disconnectBank = (bankId: string) => apiFetch(`/api/federated/banks/${bankId}/disconnect`, { method: "POST" })
export const connectAllBanks = () => apiFetch("/api/federated/banks/connect-all", { method: "POST" })

// ─── Rounds ───────────────────────────────────────────────────────────────────

export const getRounds = (limit = 20) => apiFetch(`/api/federated/rounds?limit=${limit}`)
export const getCurrentRound = () => apiFetch("/api/federated/rounds/current")
export const startRound = (opts?: object) => apiFetch("/api/federated/rounds/start", { method: "POST", body: JSON.stringify(opts || {}) })
export const stopRound = (roundId: string) => apiFetch(`/api/federated/rounds/${roundId}/stop`, { method: "POST" })
export const getRoundById = (roundId: string) => apiFetch(`/api/federated/rounds/${roundId}`)

// ─── Model Updates ────────────────────────────────────────────────────────────

export const getModelUpdates = (params?: Record<string, string>) => {
  const q = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiFetch(`/api/federated/updates${q}`)
}
export const getModelUpdatesByRound = (roundId: string) => apiFetch(`/api/federated/updates/${roundId}`)

// ─── Global Models ────────────────────────────────────────────────────────────

export const getGlobalModels = () => apiFetch("/api/federated/models")
export const getCurrentGlobalModel = () => apiFetch("/api/federated/models/current")
export const getGlobalModelByVersion = (version: string) => apiFetch(`/api/federated/models/${version}`)
export const getModelDistribution = (version: string) => apiFetch(`/api/federated/models/${version}/distribution`)

// ─── Privacy ─────────────────────────────────────────────────────────────────

export const getPrivacySummary = () => apiFetch("/api/federated/privacy")
export const getPrivacyEvents = (limit = 50) => apiFetch(`/api/federated/privacy/transfers?limit=${limit}`)
export const getPrivacyEventsByRound = (roundId: string) => apiFetch(`/api/federated/privacy/${roundId}`)

// ─── Dataset ─────────────────────────────────────────────────────────────────

export const getDatasetSummary = () => apiFetch("/api/federated/dataset")
export const getDatasetSample = (bankId = "BANK-A", count = 20, isFraud?: boolean) => {
  const q = isFraud !== undefined ? `&isFraud=${isFraud}` : ""
  return apiFetch(`/api/federated/dataset/sample?bankId=${bankId}&count=${count}${q}`)
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export const getAvailablePatterns = () => apiFetch("/api/federated/demo/patterns")
export const getDemoStatus = () => apiFetch("/api/federated/demo/status")
export const getDemoResults = () => apiFetch("/api/federated/demo/results")
export const injectFraudPattern = (patternName: string, sourceBank = "BANK-A", affectedBanks = ["BANK-B", "BANK-C"]) =>
  apiFetch("/api/federated/demo/inject-pattern", {
    method: "POST",
    body: JSON.stringify({ patternName, sourceBank, affectedBanks }),
  })
export const runFullDemo = (patternName = "CROSS_BANK_FRAUD") =>
  apiFetch("/api/federated/demo/run-full", {
    method: "POST",
    body: JSON.stringify({ patternName }),
  })
export const resetDemo = () => apiFetch("/api/federated/demo/reset", { method: "POST" })

// ─── System Health ────────────────────────────────────────────────────────────

export const getHealth = () => apiFetch("/api/health")
export const getHealthServices = () => apiFetch("/api/health/services")

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const getAuditLogs = (params?: Record<string, string>) => {
  const q = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiFetch(`/api/audit${q}`)
}
export const getAuditStats = () => apiFetch("/api/audit/stats")
export const getAuditActions = () => apiFetch("/api/audit/actions")

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getStats = () => apiFetch("/api/stats")

// ─── Simulation ───────────────────────────────────────────────────────────────

export const startSimulation = () => apiFetch("/api/simulation/start", { method: "POST" })
export const stopSimulation = () => apiFetch("/api/simulation/stop", { method: "POST" })

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = (params?: Record<string, string>) => {
  const q = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiFetch(`/api/transactions${q}`)
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const getAlerts = () => apiFetch("/api/alerts")
