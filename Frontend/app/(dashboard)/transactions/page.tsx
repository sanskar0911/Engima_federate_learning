"use client"

import { useState, useEffect } from "react"
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
import { fraudApi } from "@/lib/api-service"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  type: string;
  status: "normal" | "suspicious" | "flagged" | string;
  riskScore: number;
  timestamp: string;
  reason?: string;
  deviceId?: string;
  location?: string;
  channel?: string;
}

const statusConfig: any = {
  normal: { icon: CheckCircle, label: "Normal", color: "bg-success/10 text-success" },
  LOW: { icon: CheckCircle, label: "Normal", color: "bg-success/10 text-success" },
  COMPLETED: { icon: CheckCircle, label: "Completed", color: "bg-success/10 text-success" },
  PENDING: { icon: CheckCircle, label: "Pending", color: "bg-success/10 text-success" },
  suspicious: { icon: AlertCircle, label: "Suspicious", color: "bg-warning/10 text-warning" },
  MEDIUM: { icon: AlertCircle, label: "Suspicious", color: "bg-warning/10 text-warning" },
  flagged: { icon: AlertTriangle, label: "Flagged", color: "bg-destructive/10 text-destructive" },
  HIGH: { icon: AlertTriangle, label: "Flagged", color: "bg-destructive/10 text-destructive" },
  FAILED: { icon: AlertTriangle, label: "Failed", color: "bg-destructive/10 text-destructive" },
  BLOCKED: { icon: AlertTriangle, label: "Blocked", color: "bg-destructive/10 text-destructive" },
}

const typeLabels: Record<string, string> = {
  UPI: "UPI",
  NEFT: "NEFT",
  IMPS: "IMPS",
  RTGS: "RTGS",
  Card: "Card",
}

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data: any[] = await fraudApi.getTransactions() as any[];
        const mapped: Transaction[] = data.map((d: any) => ({
          id: d.transactionId || d.id || "",
          from: d.senderId || d.from || "",
          to: d.receiverId || d.to || "",
          amount: d.amount || 0,
          type: d.type || "UPI",
          status: d.riskLevel || d.status || "COMPLETED",
          riskScore: d.fraudScore ?? d.riskScore ?? 0,
          timestamp: d.createdAt || d.timestamp || new Date().toISOString(),
          reason: d.reason || d.description || d.fraudType?.replace(/_/g, " ") || "Standard Processing",
          deviceId: d.deviceId || d.fromIP || "Secure Web Portal",
          location: d.location || (d.fromCity ? `${d.fromCity}, ${d.fromCountry}` : "Domestic Routing"),
          channel: d.channel || "Mobile Banking App",
        }));
        setTransactions(mapped);
      } catch (err) {
        console.error("Failed to load transactions", err);
      }
    }
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    if (statusFilter !== "all" && txn.status !== statusFilter) return false
    if (typeFilter !== "all" && txn.type !== typeFilter) return false
    if (
      searchQuery &&
      !txn.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !txn.from.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !txn.to.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const totalVolume = transactions.reduce((sum, txn) => sum + txn.amount, 0)
  const suspiciousCount = transactions.filter((t) => t.status !== "normal" && t.status !== "COMPLETED" && t.status !== "LOW").length
  const avgRisk = transactions.length > 0 ? Math.round(
    transactions.reduce((sum, txn) => sum + txn.riskScore, 0) / transactions.length
  ) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">Monitor and analyze all financial transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold text-card-foreground">
              ₹{totalVolume.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Transaction Count</p>
            <p className="text-2xl font-bold text-card-foreground">
              {transactions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Suspicious/Flagged</p>
            <p className="text-2xl font-bold text-warning">{suspiciousCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            <p className="text-2xl font-bold text-card-foreground">{avgRisk}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, sender, or receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="IMPS">IMPS</SelectItem>
                <SelectItem value="RTGS">RTGS</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Transaction List</CardTitle>
          <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground">From → To</TableHead>
                <TableHead className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Risk Score</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => {
                const config = statusConfig[txn.status] || statusConfig.normal
                const StatusIcon = config.icon
                return (
                  <TableRow key={txn.id} className="border-border">
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-sm">
                        <span>{txn.from}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>{txn.to}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{txn.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[txn.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            txn.riskScore >= 80
                              ? "bg-destructive"
                              : txn.riskScore >= 60
                              ? "bg-warning"
                              : "bg-success"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium",
                            txn.riskScore >= 80
                              ? "text-destructive"
                              : txn.riskScore >= 60
                              ? "text-warning"
                              : "text-foreground"
                          )}
                        >
                          {txn.riskScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(txn.timestamp).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", statusConfig[txn.status].color)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[txn.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex justify-between items-center pr-4">
                              <span>Transaction Insights</span>
                              <Badge variant="outline" className={cn("text-xs font-bold", txn.riskScore >= 75 ? "text-destructive border-destructive" : txn.riskScore >= 40 ? "text-warning border-warning" : "text-success border-success")}>
                                {txn.riskScore}% Risk
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4 pt-2">
                            {/* Summary Box */}
                            <div className="flex bg-muted/50 p-4 rounded-lg justify-between items-center shadow-inner">
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount</span>
                                <span className="text-lg font-bold text-foreground">₹{txn.amount.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
                                <Badge className={cn("gap-1 mt-1", statusConfig[txn.status]?.color || statusConfig.normal.color)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig[txn.status]?.label || "Normal"}
                                </Badge>
                              </div>
                            </div>

                            {/* Timeline Detail */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col px-1">
                                <span className="text-xs text-muted-foreground font-semibold">Sender</span>
                                <span className="font-mono text-sm break-all">{txn.from}</span>
                              </div>
                              <div className="flex flex-col px-1 text-right">
                                <span className="text-xs text-muted-foreground font-semibold">Receiver</span>
                                <span className="font-mono text-sm break-all">{txn.to}</span>
                              </div>
                            </div>

                            {/* Additional Metadata */}
                            <div className="border border-border rounded-lg overflow-hidden flex flex-col text-sm">
                              <div className="flex border-b border-border bg-muted/30">
                                <div className="w-1/3 p-2 font-medium text-muted-foreground border-r border-border">Type</div>
                                <div className="w-2/3 p-2">{typeLabels[txn.type] || txn.type}</div>
                              </div>
                              <div className="flex border-b border-border bg-muted/10">
                                <div className="w-1/3 p-2 font-medium text-muted-foreground border-r border-border">Time</div>
                                <div className="w-2/3 p-2">{new Date(txn.timestamp).toLocaleString()}</div>
                              </div>
                              <div className="flex border-b border-border bg-muted/30">
                                <div className="w-1/3 p-2 font-medium text-muted-foreground border-r border-border">Device ID</div>
                                <div className="w-2/3 p-2 font-mono text-xs">{txn.deviceId}</div>
                              </div>
                              <div className="flex border-b border-border bg-muted/10">
                                <div className="w-1/3 p-2 font-medium text-muted-foreground border-r border-border">Location</div>
                                <div className="w-2/3 p-2">{txn.location}</div>
                              </div>
                              <div className="flex bg-muted/30">
                                <div className="w-1/3 p-2 font-medium text-muted-foreground border-r border-border">Channel</div>
                                <div className="w-2/3 p-2">{txn.channel}</div>
                              </div>
                            </div>

                            {/* Fraud Analysis Box */}
                            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg flex flex-col gap-2">
                               <span className="text-xs font-bold text-destructive uppercase flex items-center gap-2">
                                 <AlertTriangle className="w-4 h-4" /> 
                                  AI Analysis Reason
                               </span>
                               <span className="text-sm font-medium text-foreground">{txn.reason}</span>
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
        </CardContent>
      </Card>
    </div>
  )
}
