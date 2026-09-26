"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockAccounts, mockAlerts, mockDashboardStats, mockTransactions, type Alert } from "@/lib/mock-data"
import { FileText, Calendar, TrendingUp, AlertTriangle, Users, DollarSign, FileDown, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

const reportTypes = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level overview for leadership",
    icon: TrendingUp,
  },
  {
    id: "suspicious",
    name: "Suspicious Activity Report",
    description: "Detailed SAR documentation",
    icon: AlertTriangle,
  },
  {
    id: "account",
    name: "Account Analysis",
    description: "Individual account risk breakdown",
    icon: Users,
  },
  {
    id: "transaction",
    name: "Transaction Report",
    description: "Transaction flow analysis",
    icon: DollarSign,
  },
]

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  )
}

function ReportsContent() {
  const searchParams = useSearchParams()
  const accountParam = searchParams.get("accountId")

  const [selectedReport, setSelectedReport] = useState("executive")
  const [dateRange, setDateRange] = useState("7d")

  const ALERTS_STORAGE_KEY = "fraudshield_alerts_override_v1"

  const [accountIdInput, setAccountIdInput] = useState("")
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)

  const [alertsOverride, setAlertsOverride] = useState<Alert[]>(mockAlerts)
  const [mounted, setMounted] = useState(false)
  const [reportId, setReportId] = useState("")
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    setMounted(true)
    setReportId(`RPT-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`)
    setGeneratedAt(new Date().toLocaleDateString())
  }, [])

  useEffect(() => {
    if (accountParam) {
      const cleanId = accountParam.trim().toUpperCase()
      setActiveAccountId(cleanId)
      setAccountIdInput(cleanId)
    }
  }, [accountParam])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ALERTS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Alert[]
      if (Array.isArray(parsed) && parsed.length > 0) setAlertsOverride(parsed)
    } catch {
      // ignore
    }
  }, [])

  const suspiciousAccounts = mockAccounts
    .filter((a) => a.isSuspicious)
    .sort((a, b) => b.riskScore - a.riskScore)

  const openAlerts = alertsOverride.filter((a) => a.status === "open")

  const selectedAccount = activeAccountId
    ? mockAccounts.find((a) => a.id.toLowerCase() === activeAccountId.toLowerCase()) || null
    : null

  const accountTransactions = selectedAccount
    ? mockTransactions.filter((t) => t.from === selectedAccount.id || t.to === selectedAccount.id)
    : []

  const accountAlerts = selectedAccount
    ? alertsOverride
        .filter((a) => a.accountId === selectedAccount.id)
        .slice()
        .sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())
    : []

  const accountSuspiciousTransactions = accountTransactions.filter((t) => t.status !== "normal")

  const activeExecutiveStats = selectedAccount
    ? {
        totalTransactions: accountTransactions.length,
        suspiciousTransactions: accountSuspiciousTransactions.length,
        highRiskAccounts: selectedAccount.isSuspicious && selectedAccount.riskScore >= 75 ? 1 : 0,
        fraudAlerts: accountAlerts.length,
        totalVolume: accountTransactions.reduce((sum, t) => sum + t.amount, 0),
        avgRiskScore:
          accountTransactions.length > 0
            ? Math.round(accountTransactions.reduce((sum, t) => sum + t.riskScore, 0) / accountTransactions.length)
            : 0,
      }
    : mockDashboardStats

  const downloadUserReport = (accountId: string) => {
    const account = mockAccounts.find((a) => a.id === accountId)
    if (!account) return
    const transactions = mockTransactions.filter((t) => t.from === accountId || t.to === accountId)
    const alerts = alertsOverride.filter((a) => a.accountId === accountId)
    const lines = [
      `User Report: ${account.name} (${account.id})`,
      `Emails: ${(account.contactEmails || []).join(", ")}`,
      `Risk Score: ${account.riskScore}%`,
      `Suspicious: ${account.isSuspicious ? "Yes" : "No"}`,
      `Total Transactions: ${transactions.length}`,
      `Total Alerts: ${alerts.length}`,
      "",
      "Recent Alerts:",
      ...alerts.slice(0, 5).map((a) => `- ${a.id} | ${a.type} | ${a.riskScore}% | ${a.status}`),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `report-${accountId}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadAnalystReport = () => {
    const lines = [
      `Analyst Daily Operations Report`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Suspicious Accounts: ${suspiciousAccounts.length}`,
      `Total Open Alerts: ${openAlerts.length}`,
      "",
      "--- CRITICAL ESCALATIONS ---",
      ...openAlerts.filter(a => a.riskScore >= 80).map(a => `- ${a.id} | ${a.type} | Risk: ${a.riskScore}%`),
      "",
      "--- PENDING TASKS ---",
      ...openAlerts.filter(a => a.riskScore < 80).map(a => `- ${a.id} | ${a.type} | Risk: ${a.riskScore}%`),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `analyst-daily-ops-${new Date().toISOString().slice(0, 10)}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const printUserReport = (accountId: string) => {
    const account = mockAccounts.find((a) => a.id === accountId)
    if (!account) return
    
    const accountTransactions = mockTransactions.filter((t) => t.from === accountId || t.to === accountId)
    const suspiciousCount = accountTransactions.filter(t => t.status !== "normal").length
    const alerts = alertsOverride.filter((a) => a.accountId === accountId)
    const openAlertsCount = alerts.filter(a => a.status === 'open').length

    const generationDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    const reportRef = `RPT-${Date.now().toString().slice(-8)}`

    const getRiskLevel = (score: number) => {
      if (score >= 80) return { label: 'CRITICAL', color: '#ef4444', bg: '#fee2e2' }
      if (score >= 60) return { label: 'HIGH', color: '#f97316', bg: '#ffedd5' }
      if (score >= 40) return { label: 'MEDIUM', color: '#eab308', bg: '#fef9c3' }
      return { label: 'LOW', color: '#22c55e', bg: '#dcfce7' }
    }

    const accountRisk = getRiskLevel(account.riskScore)

    const alertsHtml = alerts.length === 0 
      ? '<p style="color: #64748b; font-style: italic; font-size: 11px;">No fraud alerts on record for this account.</p>'
      : alerts.map(a => {
          const aRisk = getRiskLevel(a.riskScore);
          return `
          <div class="alert-card ${a.status}">
            <div class="alert-left">
              <div class="alert-title-row">
                <span class="alert-title">${a.type.replace(/_/g, ' ')}</span>
                <span class="badge" style="background: ${aRisk.bg}; color: ${aRisk.color};">${aRisk.label}</span>
                <span class="badge" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; text-transform: capitalize;">${a.status}</span>
              </div>
              <p class="alert-desc">${a.description}</p>
              <p class="alert-meta">#${a.id} &middot; ${a.accountId} &middot; ${new Date(a.timestamp).toLocaleString('en-GB')}</p>
            </div>
            <div class="alert-right">
              <div class="alert-score" style="color: ${aRisk.color}">${a.riskScore}%</div>
              <div class="alert-score-label">Risk Score</div>
            </div>
          </div>
          `;
        }).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Report - ${account.id}</title>
  <style>
    @page { 
      margin: 20mm 18mm; 
      size: A4; 
    }
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      margin: 0; 
      color: #1a1a1a;
      line-height: 1.5;
      font-size: 12px;
    }
    * { box-sizing: border-box; }
    
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 32px; height: 32px; color: #1e3a8a; }
    .brand-name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; }
    .brand-sub { font-size: 10px; font-weight: 600; font-variant: small-caps; color: #64748b; margin: 0; letter-spacing: 1px; }
    .header-right { text-align: right; }
    .header-division { font-size: 11px; font-weight: 700; color: #1e3a8a; margin: 0; letter-spacing: 0.5px; }
    .header-contact { font-size: 10px; color: #64748b; margin: 2px 0 0 0; }

    .banner { background-color: #fef2f2; color: #dc2626; text-align: center; font-weight: 700; font-size: 11px; padding: 6px; border: 1px solid #f87171; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
    
    .id-block { display: flex; justify-content: space-between; background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
    .id-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    .id-sub { font-size: 11px; color: #475569; margin: 0 0 8px 0; }
    .id-subject { font-size: 13px; font-weight: 600; color: #1e40af; margin: 0; }
    .id-meta { text-align: right; font-size: 11px; color: #475569; display: flex; flex-direction: column; gap: 4px; }
    .ref-val { font-family: monospace; font-size: 12px; color: #0f172a; font-weight: 600; }
    
    .section-title { font-size: 14px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 0 0 12px 0; color: #334155; text-transform: capitalize; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
    .stat-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #ffffff; }
    .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .stat-val { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-val.amber { color: #d97706; }
    .stat-val.red { color: #dc2626; }
    
    .verdict-bar { display: flex; justify-content: space-between; align-items: center; background: ${accountRisk.bg}; border: 1px solid ${accountRisk.color}; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
    .verdict-left { font-size: 13px; font-weight: 700; color: ${accountRisk.color}; }
    .verdict-right { font-size: 16px; font-weight: 800; color: ${accountRisk.color}; }

    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; }
    .table th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
    .table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .table tr:nth-child(even) { background: #f8fafc; }
    .mono-cell { font-family: monospace; font-size: 12px; color: #2563eb; font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }

    .alerts-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .alert-card { border: 1px solid #e2e8f0; border-left: 4px solid #94a3b8; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: stretch; background: #fff; }
    .alert-card.open { border-left-color: #ef4444; }
    .alert-card.investigating { border-left-color: #f59e0b; }
    .alert-card.resolved { border-left-color: #10b981; }
    .alert-left { display: flex; flex-direction: column; gap: 4px; }
    .alert-title-row { display: flex; align-items: center; gap: 8px; }
    .alert-title { font-size: 13px; font-weight: 700; color: #0f172a; text-transform: capitalize; }
    .alert-desc { font-size: 11px; color: #64748b; margin: 2px 0 6px 0; }
    .alert-meta { font-size: 10px; color: #94a3b8; font-family: monospace; }
    .alert-right { display: flex; flex-direction: column; justify-content: center; align-items: flex-end; text-align: right; min-width: 80px; }
    .alert-score { font-size: 18px; font-weight: 800; color: #dc2626; line-height: 1; }
    .alert-score-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    .compliance-notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 24px; }
    .comp-cell { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; }
    .comp-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .comp-val { font-size: 11px; font-weight: 600; color: #1e293b; }

    .footer { position: fixed; bottom: 0; left: 0; right: 0; border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; background: #fff; }
    
    @media print {
      .footer { position: fixed; bottom: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  
  <div class="header">
    <div class="header-left">
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      <div>
        <h1 class="brand-name">FraudShield</h1>
        <p class="brand-sub">AI Detection System</p>
      </div>
    </div>
    <div class="header-right">
      <p class="header-division">FRAUD INTELLIGENCE DIVISION</p>
      <p class="header-contact">compliance@fraudshield.ai &nbsp;|&nbsp; +91-22-6700-0000</p>
    </div>
  </div>

  <div class="banner">
    CONFIDENTIAL — For Authorised Personnel Only — Internal Use Only
  </div>

  <div class="id-block">
    <div>
      <h2 class="id-title">Executive Summary</h2>
      <p class="id-sub">Period: Last 7 Days &nbsp;&middot;&nbsp; Generated: ${generationDate}</p>
      <p class="id-subject">Subject Account: ${account.id} — ${account.name}</p>
    </div>
    <div class="id-meta">
      <div>Report Reference: <span class="ref-val">${reportRef}</span></div>
      <div>Prepared by: Alex Chen, Fraud Analyst</div>
    </div>
  </div>

  <h3 class="section-title">01 &mdash; Threat Assessment</h3>
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-label">Total Transactions</div>
      <div class="stat-val">${accountTransactions.length}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Suspicious Activity</div>
      <div class="stat-val amber">${suspiciousCount}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">High-Risk Accounts</div>
      <div class="stat-val red">${account.riskScore >= 75 ? 1 : 0}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Open Fraud Alerts</div>
      <div class="stat-val red">${openAlertsCount}</div>
    </div>
  </div>
  
  <div class="verdict-bar">
    <div class="verdict-left">Overall Assessment &rarr; ${account.riskScore >= 75 ? 'HIGH RISK — IMMEDIATE ACTION REQUIRED' : account.riskScore >= 40 ? 'ELEVATED RISK — ENHANCED MONITORING' : 'LOW RISK — ROUTINE REVIEW'}</div>
    <div class="verdict-right">${account.riskScore}%</div>
  </div>

  <h3 class="section-title">02 &mdash; Account Details</h3>
  <table class="table">
    <thead>
      <tr>
        <th>Account ID</th>
        <th>Name</th>
        <th>Type</th>
        <th>Location</th>
        <th>Risk Score</th>
        <th>Level</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono-cell">${account.id}</td>
        <td>${account.name}</td>
        <td style="text-transform: capitalize;">${account.type || 'Standard'}</td>
        <td>${account.country || 'IN'}</td>
        <td style="color: ${accountRisk.color}; font-weight: 700;">${account.riskScore}%</td>
        <td>
          <span class="badge" style="background: ${accountRisk.bg}; color: ${accountRisk.color}; border: 1px solid ${accountRisk.color};">
            ${accountRisk.label}
          </span>
        </td>
      </tr>
    </tbody>
  </table>

  <h3 class="section-title">03 &mdash; Fraud Alerts Log</h3>
  <div class="alerts-list">
    ${alertsHtml}
  </div>

  <h3 class="section-title">04 &mdash; Compliance Notes</h3>
  <div class="compliance-notes">
    <div class="comp-cell">
      <span class="comp-label">Regulatory Reference</span>
      <span class="comp-val">RBI Circular RBI/2023-24/73</span>
    </div>
    <div class="comp-cell">
      <span class="comp-label">Escalation Threshold</span>
      <span class="comp-val">Risk Score &ge; 80% &rarr; CCO</span>
    </div>
    <div class="comp-cell">
      <span class="comp-label">Response SLA</span>
      <span class="comp-val">48 hours for flagged accounts</span>
    </div>
    <div class="comp-cell">
      <span class="comp-label">Classification</span>
      <span class="comp-val">Confidential — Internal Use Only</span>
    </div>
    <div class="comp-cell">
      <span class="comp-label">Retention Period</span>
      <span class="comp-val">Minimum 5 years (PMLA)</span>
    </div>
    <div class="comp-cell">
      <span class="comp-label">Next Review</span>
      <span class="comp-val">11 April 2026</span>
    </div>
  </div>

  <div class="footer">
    <span>Generated by FraudShield AI Detection System &mdash; ${generationDate}</span>
    <span>Confidential &mdash; Internal Use Only &nbsp;|&nbsp; Page 1 of 1</span>
  </div>

</body>
</html>
    `;
    const popup = window.open("", "_blank", "width=900,height=700")
    if (!popup) return
    popup.document.open()
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    setTimeout(() => popup.print(), 250)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download compliance and analysis reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              selectedReport === report.id && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div
                className={cn(
                  "rounded-lg p-2",
                  selectedReport === report.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <report.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">{report.name}</h3>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Report Configuration</CardTitle>
              <CardDescription>Customize your report parameters</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Input
                value={accountIdInput}
                onChange={(e) => setAccountIdInput(e.target.value)}
                placeholder="Optional: Enter Account ID (e.g., ACC001)"
                className="border-primary/20"
              />
              <Button
                variant="outline"
                onClick={() =>
                  setActiveAccountId(accountIdInput.trim() ? accountIdInput.trim().toUpperCase() : null)
                }
              >
                Generate
              </Button>
            </div>
            <div className="flex gap-4">
              <Button className="gap-2" onClick={() => {
                if (activeAccountId) downloadUserReport(activeAccountId)
                else alert("Please enter an Account ID to download the User Report")
              }}>
                <FileDown className="h-4 w-4" />
                Download User Report
              </Button>
              <Button variant="outline" className="gap-2" onClick={downloadAnalystReport}>
                <FileText className="h-4 w-4" />
                Download Analyst Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">
                {reportTypes.find((r) => r.id === selectedReport)?.name} Preview
              </CardTitle>
            </div>
            <Badge variant="outline">Preview Mode</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-6">
            {/* Report Header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    FraudShield - {reportTypes.find((r) => r.id === selectedReport)?.name}
                    {selectedAccount ? (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        • Account: <span className="font-mono">{selectedAccount.id}</span>
                      </span>
                    ) : activeAccountId ? (
                      <span className="ml-2 text-sm font-normal text-destructive">
                        • Account not found: <span className="font-mono">{activeAccountId}</span>
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    Generated on {mounted ? generatedAt : "Loading..."} | Period: Last{" "}
                    {dateRange === "24h" ? "24 hours" : dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : "90 days"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Report ID</p>
                  <p className="font-mono text-sm" suppressHydrationWarning>{mounted ? reportId : "RPT-XXXXXXXX"}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Executive Summary
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {activeExecutiveStats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                  <p className="text-2xl font-bold text-warning">
                    {activeExecutiveStats.suspiciousTransactions}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">High-Risk Accounts</p>
                  <p className="text-2xl font-bold text-destructive">
                    {activeExecutiveStats.highRiskAccounts}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Open Alerts</p>
                  <p className="text-2xl font-bold text-destructive">
                    {selectedAccount
                      ? accountAlerts.filter((a) => a.status === "open").length
                      : openAlerts.length}
                  </p>
                </div>
              </div>
            </div>

            {/* High Risk Accounts */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                High-Risk Accounts
              </h3>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Account ID
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Country
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Bank
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Location
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Risk Score
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        User Emails
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedAccount ? [selectedAccount] : suspiciousAccounts.slice(0, 5)).map((account) => (
                      <tr key={account.id} className="border-t border-border">
                        <td className="px-4 py-2 font-mono">{account.id}</td>
                        <td className="px-4 py-2">{account.name}</td>
                        <td className="px-4 py-2 capitalize">{account.type}</td>
                        <td className="px-4 py-2">{account.country}</td>
                        <td className="px-4 py-2 text-xs font-medium">{account.bank}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{account.city}, {account.state}</td>
                        <td className="px-4 py-2">
                          <span className="text-destructive font-semibold">{account.riskScore}%</span>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {(account.contactEmails || []).join(", ")}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => downloadUserReport(account.id)}
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => printUserReport(account.id)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Recent Fraud Alerts
              </h3>
              <div className="space-y-3">
                {(selectedAccount ? accountAlerts : alertsOverride.slice(0, 3)).map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg bg-card p-4 border border-border flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-card-foreground">
                          {alert.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Badge
                          variant={
                            alert.status === "open"
                              ? "destructive"
                              : alert.status === "investigating"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            "text-xs",
                            alert.status === "investigating" && "bg-warning text-warning-foreground"
                          )}
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">
                        Risk: {alert.riskScore}%
                      </p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <p>
                This report is generated by FraudShield AI Detection System. For questions, contact
                compliance@fraudshield.ai
              </p>
              <p className="mt-1">
                Confidential - Internal Use Only | Page 1 of 1
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
