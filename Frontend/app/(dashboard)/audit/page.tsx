"use client"

import { useAuditLog } from "@/hooks/useFederated"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, ListChecks } from "lucide-react"
import { useState } from "react"

const SEVERITY_CONFIG: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LOW:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const STATUS_CONFIG: Record<string, string> = {
  SUCCESS: "text-emerald-400",
  FAILURE: "text-destructive",
  WARNING: "text-amber-400",
  INFO:    "text-blue-400",
}

export default function AuditPage() {
  const [search, setSearch] = useState("")
  const { logs, pagination, loading } = useAuditLog({ limit: "100" })

  const filtered = logs.filter((l) =>
    !search ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.bankId?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Complete chronological record of all federated system events — rounds, models, banks, privacy, and investigations
        </p>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search events, banks, descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        {pagination && (
          <p className="flex items-center text-sm text-muted-foreground">{pagination.total} total events</p>
        )}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Event Log</CardTitle>
          <CardDescription className="text-xs">{filtered.length} events shown</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center gap-2 py-8 px-4 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading audit log...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <ListChecks className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No audit events yet. Run a federated round to generate events.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Time</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Action</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Bank</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Round</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-medium">Description</th>
                    <th className="px-4 py-2.5 text-center text-muted-foreground font-medium">Severity</th>
                    <th className="px-4 py-2.5 text-center text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => (
                    <tr key={log._id || i} className="border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp || log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-medium text-foreground text-[10px]">
                          {log.action?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-sky-400">{log.bankId || "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{log.roundId ? log.roundId.slice(0, 16) + "…" : "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground max-w-xs truncate">{log.description || "—"}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge className={cn("text-[10px] border", SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.LOW)}>
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn("font-medium", STATUS_CONFIG[log.status] || "text-muted-foreground")}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
