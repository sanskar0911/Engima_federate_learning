"use client"

import React, { useState, useEffect } from "react"
import { FIVE_BANKS, BANK_BY_ID } from "@/lib/banks-config"
import { useTasks } from "@/contexts/TaskContext"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  ShieldAlert,
  Layers,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface Transaction {
  id: string
  fromAccount: string
  toAccount: string
  fromBank: string
  toBank: string
  amount: number
  currency: string
  format: string
  isLaundering: boolean
  riskScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  timestamp: string
  reason?: string
  aiRecommendation?: string
}

export default function TransactionsPage() {
  const { analysisPeriod } = useTasks()
  const [bankFilter, setBankFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formatFilter, setFormatFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (bankFilter !== "all") queryParams.append("bankId", bankFilter)

        const res = await fetch(`http://localhost:5000/api/transactions?${queryParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          const mapped: Transaction[] = (data || []).map((d: any, idx: number) => {
            const isLaundering = d.is_fraud === 1 || d.isLaundering === 1 || d.isFraud === true
            const fromB = d.bankId || d.fromBank || "BANK-70"
            const toB = d.toBank || "BANK-10"
            const amt = d.amount || d.amountPaid || 5000

            return {
              id: d.transactionId || `TX-IBM-${fromB}-${idx + 100}`,
              fromAccount: d.senderId || d.accountId || d.fromAccount || "100428660",
              toAccount: d.receiverId || d.toAccount || "800059F50",
              fromBank: fromB,
              toBank: toB,
              amount: amt,
              currency: d.paymentCurrency || "USD",
              format: d.paymentFormat || d.channel || "Cheque",
              isLaundering: isLaundering,
              riskScore: d.fraudScore || (isLaundering ? 94 : d.is_cross_bank ? 48 : 14),
              riskLevel: isLaundering ? "HIGH" : d.is_cross_bank ? "MEDIUM" : "LOW",
              timestamp: d.timestamp || `${analysisPeriod.startDate} 12:${(idx % 59).toString().padStart(2, "0")}`,
              reason: d.reason || (isLaundering ? "Smurfing / Structuring Laundering Cycle Detected" : "Routine Intra-Bank Transfer"),
              aiRecommendation: isLaundering
                ? "Flagged by FraudMLP v2.1.0: Initiate SAR Regulatory Filing & freeze downstream hops."
                : "Pass through automated clearing corridor.",
            }
          })
          setTransactions(mapped)
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [bankFilter, analysisPeriod])

  const filteredTransactions = transactions.filter((txn) => {
    if (bankFilter !== "all" && txn.fromBank !== bankFilter) return false
    if (statusFilter === "laundering" && !txn.isLaundering) return false
    if (statusFilter === "normal" && txn.isLaundering) return false
    if (formatFilter !== "all" && txn.format.toLowerCase() !== formatFilter.toLowerCase()) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !txn.id.toLowerCase().includes(q) &&
        !txn.fromAccount.toLowerCase().includes(q) &&
        !txn.toAccount.toLowerCase().includes(q) &&
        !txn.fromBank.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })

  const totalVolume = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const launderingCount = filteredTransactions.filter((t) => t.isLaundering).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            5-Bank Transaction Surveillance Stream
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every transaction is mapped to its originating institution with full sender/receiver accounts, payment format, and explainable AI risk scoring.
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono bg-blue-500/10 text-blue-400 border-blue-500/20">
          Period: {analysisPeriod.startDate} → {analysisPeriod.endDate}
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Filtered Transactions</div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">
            {filteredTransactions.length.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Across selected nodes</div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Filtered Settlement Value</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${totalVolume >= 1000000 ? `${(totalVolume / 1000000).toFixed(1)}M` : `${(totalVolume / 1000).toFixed(0)}k`}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">USD Multi-currency</div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Laundering / Flagged Cases</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            {launderingCount} cases
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Requires compliance review</div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Active Bank Nodes</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
            5 / 5 Monitored
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Oasis, Laramie, East, Arbor, Japan</div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="border-border bg-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Tx ID, account, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs bg-background"
            />
          </div>

          {/* Bank Filter (All 5) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Bank Node:</span>
            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger className="w-[190px] h-8 text-xs bg-background">
                <SelectValue placeholder="All 5 Banks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 All 5 Banks</SelectItem>
                {FIVE_BANKS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="laundering">Flagged Laundering</SelectItem>
                <SelectItem value="normal">Normal Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Format:</span>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="ach">ACH</SelectItem>
                <SelectItem value="wire">Wire</SelectItem>
                <SelectItem value="reinvestment">Reinvestment</SelectItem>
                <SelectItem value="credit card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Institutional Transaction Records</CardTitle>
            <CardDescription className="text-xs">{filteredTransactions.length} records in active window</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">Loading bank node transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No transactions match the selected filters for {analysisPeriod.startDate} to {analysisPeriod.endDate}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Originating Bank</TableHead>
                    <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                    <TableHead className="text-muted-foreground">Sender → Receiver</TableHead>
                    <TableHead className="text-muted-foreground">Amount (USD)</TableHead>
                    <TableHead className="text-muted-foreground">Payment Format</TableHead>
                    <TableHead className="text-muted-foreground">Risk Score</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Inspection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.slice(0, 50).map((txn) => {
                    const bankConfig = BANK_BY_ID[txn.fromBank] || FIVE_BANKS[0]
                    return (
                      <TableRow key={txn.id} className="border-border hover:bg-muted/30">
                        {/* Originating Bank Badge */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bankConfig.color }} />
                            <span className="font-semibold text-foreground truncate max-w-[130px]">{bankConfig.name}</span>
                            <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                              {bankConfig.id}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Tx ID */}
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{txn.id}</TableCell>

                        {/* Accounts */}
                        <TableCell>
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className="text-foreground">{txn.fromAccount}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{txn.toAccount}</span>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="font-mono font-bold text-foreground">
                          ${txn.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Format */}
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {txn.format}
                          </Badge>
                        </TableCell>

                        {/* Risk Score */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                txn.riskScore >= 70 ? "bg-rose-500" : txn.riskScore >= 40 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                            />
                            <span
                              className={cn(
                                "font-mono font-bold",
                                txn.riskScore >= 70 ? "text-rose-400" : txn.riskScore >= 40 ? "text-amber-400" : "text-emerald-400"
                              )}
                            >
                              {txn.riskScore}%
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {txn.isLaundering ? (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1">
                              <AlertTriangle className="h-3 w-3" /> FLAGGED
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
                              <CheckCircle className="h-3 w-3" /> NORMAL
                            </Badge>
                          )}
                        </TableCell>

                        {/* Inspection Drawer */}
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-blue-400 hover:bg-blue-500/10">
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex justify-between items-center text-sm font-bold">
                                  <span>Transaction Surveillance Detail</span>
                                  <Badge
                                    className={cn(
                                      "text-xs font-mono",
                                      txn.isLaundering ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-400"
                                    )}
                                  >
                                    Risk: {txn.riskScore}% ({txn.riskLevel})
                                  </Badge>
                                </DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4 pt-2 text-xs">
                                {/* Bank Box */}
                                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Originating Bank Node:</span>
                                    <span className="font-bold text-foreground">{bankConfig.name} ({bankConfig.id})</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Region:</span>
                                    <span className="text-foreground">{bankConfig.region}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Settlement Channel:</span>
                                    <span className="font-mono text-foreground">{txn.format}</span>
                                  </div>
                                </div>

                                {/* Flow Details */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-2.5 rounded bg-background border border-border">
                                    <span className="text-[10px] text-muted-foreground font-semibold">Sender Account</span>
                                    <div className="font-mono font-bold text-foreground text-xs mt-0.5">{txn.fromAccount}</div>
                                  </div>
                                  <div className="p-2.5 rounded bg-background border border-border">
                                    <span className="text-[10px] text-muted-foreground font-semibold">Receiver Account</span>
                                    <div className="font-mono font-bold text-foreground text-xs mt-0.5">{txn.toAccount}</div>
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="p-3 rounded-lg bg-background border border-border flex justify-between items-center">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Settled Amount</span>
                                    <div className="text-base font-bold font-mono text-foreground">
                                      ${txn.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {txn.currency}
                                  </Badge>
                                </div>

                                {/* AI Reason */}
                                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 space-y-1 text-xs">
                                  <div className="font-bold text-destructive flex items-center gap-1.5 text-xs">
                                    <AlertTriangle className="h-4 w-4" /> Rule & Model Findings
                                  </div>
                                  <p className="text-muted-foreground">{txn.reason}</p>
                                </div>

                                {/* Recommendation */}
                                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-1 text-xs">
                                  <div className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                                    <Sparkles className="h-4 w-4" /> AI Recommendation
                                  </div>
                                  <p className="text-muted-foreground">{txn.aiRecommendation}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
