import { mockAccounts, mockTransactions, mockAlerts, DashboardStats } from "./mock-data"

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "")

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
}

class FraudDetectionAPI {
  private baseUrl: string
  private apiKey?: string

  constructor(config?: Partial<ApiConfig>) {
    this.baseUrl = config?.baseUrl || API_BASE_URL
    this.apiKey = config?.apiKey
  }

  // Health Check
  async healthCheck() {
    return { status: "healthy", timestamp: new Date().toISOString() }
  }

  // Accounts
  async getAccounts() {
    return [...mockAccounts]
  }

  async getAccount(accountId: string) {
    const account = mockAccounts.find(a => a.id === accountId)
    if (!account) throw new Error("Account not found")
    return account
  }

  async getAccountTransactions(accountId: string) {
    return mockTransactions.filter(t => t.from === accountId || t.to === accountId)
  }

  // Transactions
  async getTransactions(params?: {
    status?: string
    risk_min?: number
  }) {
    let filtered = [...mockTransactions]
    if (params?.status) {
      filtered = filtered.filter(t => t.status === params.status)
    }
    if (params?.risk_min) {
      filtered = filtered.filter(t => t.riskScore >= params.risk_min!)
    }
    return filtered
  }

  // Alerts
  async getAlerts() {
    return [...mockAlerts]
  }

  async createAlert(data: {
    type: string
    accountId: string
    riskScore: number
    description: string
    amount?: number
  }) {
    const newAlert = {
      id: `ALT${String(mockAlerts.length + 1).padStart(3, "0")}`,
      status: "open" as const,
      timestamp: new Date().toISOString(),
      ...data
    }
    return newAlert
  }

  async updateAlertStatus(
    alertId: string,
    status: "open" | "investigating" | "resolved"
  ) {
    const alert = mockAlerts.find(a => a.id === alertId)
    if (!alert) throw new Error("Alert not found")
    return { ...alert, status }
  }

  // Statistics
  async getStats() {
    const suspiciousTransactions = mockTransactions.filter(t => t.status !== "normal").length
    const highRiskAccounts = mockAccounts.filter(a => a.isSuspicious).length
    const openAlerts = mockAlerts.filter(a => a.status === "open").length
    const totalVolume = mockTransactions.reduce((sum, t) => sum + t.amount, 0)
    const avgRiskScore = Math.round(mockTransactions.reduce((sum, t) => sum + t.riskScore, 0) / mockTransactions.length)
    
    return {
      totalTransactions: mockTransactions.length,
      suspiciousTransactions,
      highRiskAccounts,
      fraudAlerts: openAlerts,
      totalVolume,
      avgRiskScore
    }
  }

  // Graph Data (if needed separately)
  async getGraphNodes() {
    return mockAccounts.map((acc, i) => ({
      id: acc.id,
      position: { x: (i % 3) * 250 + 100, y: Math.floor(i / 3) * 200 + 100 },
      data: { label: acc.name, account: acc },
      type: "accountNode"
    }))
  }

  async getGraphEdges() {
    const edges: any[] = []
    const seen = new Set()
    
    mockTransactions.slice(0, 20).forEach(txn => {
      const edgeKey = `${txn.from}-${txn.to}`
      if (!seen.has(edgeKey)) {
        seen.add(edgeKey)
        const isSuspicious = txn.riskScore > 60
        edges.push({
          id: `e-${edgeKey}`,
          source: txn.from,
          target: txn.to,
          animated: isSuspicious,
          style: { stroke: isSuspicious ? "#ef4444" : "#22c55e" },
          data: { amount: txn.amount, suspicious: isSuspicious }
        })
      }
    })
    return edges
  }

  // 🔥 FINAL FIX: MATCH BACKEND ROUTE
  async investigateAccount(accountId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/graph/${accountId}`);
      if (!res.ok) throw new Error("Failed to fetch graph data");
      return await res.json();
    } catch(err) {
      console.error(err);
      return { nodes: [], edges: [] };
    }
  }

  // AI Detection
  async detectCircularTransactions() {
    return { patterns: [] }
  }

  // Pre-Transaction Risk Check
  async preCheckTransaction(data: {
    sourceAccountId: string
    targetAccountId: string
    amount: number
    type?: string
    location?: string
    deviceId?: string
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions/pre-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Pre-check failed")
      return await response.json()
    } catch (error) {
      console.error("Risk engine pre-check error:", error)
      // Fallback for demo if backend is down
      const score = data.amount > 100000 ? 85 : 15
      return {
        success: true,
        score: score,
        decision: score > 80 ? "BLOCK" : "APPROVE",
        factors: score > 80 ? [{ type: "amount", reason: "Unusually high transaction volume detected" }] : []
      }
    }
  }

  // Create Transaction
  async createTransaction(data: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Transaction creation failed")
      return await response.json()
    } catch (error) {
      console.error("Create transaction error:", error)
      return { success: true, transactionId: `TXN${Math.floor(Math.random() * 10000)}` }
    }
  }
}

// ✅ Singleton instance
export const fraudApi = new FraudDetectionAPI()

export { FraudDetectionAPI }

const fallbackFundFlow = {
  nodes: [
    {
      id: "A1",
      type: "accountNode",
      position: { x: 120, y: 120 },
      data: {
        label: "Anchor Account A1",
        account: {
          id: "A1",
          riskScore: 88,
          isSuspicious: true,
          balance: 420000,
          type: "shell",
          country: "IN",
        },
      },
    },
    {
      id: "B1",
      type: "accountNode",
      position: { x: 360, y: 90 },
      data: {
        label: "Mule Account B1",
        account: {
          id: "B1",
          riskScore: 74,
          isSuspicious: true,
          balance: 195000,
          type: "business",
          country: "IN",
        },
      },
    },
    {
      id: "C1",
      type: "accountNode",
      position: { x: 560, y: 230 },
      data: {
        label: "Layering Account C1",
        account: {
          id: "C1",
          riskScore: 83,
          isSuspicious: true,
          balance: 305000,
          type: "shell",
          country: "CY",
        },
      },
    },
    {
      id: "D1",
      type: "accountNode",
      position: { x: 260, y: 280 },
      data: {
        label: "Collector Account D1",
        account: {
          id: "D1",
          riskScore: 67,
          isSuspicious: true,
          balance: 255000,
          type: "individual",
          country: "IN",
        },
      },
    },
  ],
  edges: [
    {
      id: "e-a1-b1",
      source: "A1",
      target: "B1",
      label: "₹52,000",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 },
    },
    {
      id: "e-b1-c1",
      source: "B1",
      target: "C1",
      label: "₹49,500",
      animated: true,
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "e-c1-d1",
      source: "C1",
      target: "D1",
      label: "₹48,700",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 },
    },
    {
      id: "e-d1-a1",
      source: "D1",
      target: "A1",
      label: "₹47,900",
      animated: true,
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
  ],
}

export const getFundFlow = async (accountId: string) => {
  try {
    const response = await fraudApi.investigateAccount(accountId)
    const data =
      (response as any)?.nodes && (response as any)?.edges
        ? (response as any)
        : (response as any)?.data?.nodes && (response as any)?.data?.edges
        ? (response as any).data
        : null

    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges) || data.nodes.length === 0) {
      return fallbackFundFlow
    }

    return { nodes: data.nodes, edges: data.edges }
  } catch (error) {
    console.error("Fund Flow API Error. Using fallback graph.", error)
    return fallbackFundFlow
  }
}