"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Shield,
  Database,
  Zap,
  Globe,
  Lock,
  Mail,
  Building2,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function SettingsPage() {
  const [smtpUser, setSmtpUser] = useState("fedshield@gmail.com")
  const [defaultCc, setDefaultCc] = useState("sanskar0912gharal@gmail.com")

  const handleSave = () => {
    toast.success("Settings and compliance parameters saved successfully!")
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">System & Privacy Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure DPDP Act compliance thresholds, 5-bank differential privacy budgets, and automated reporting.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Detection Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-blue-400" />
              Intra-Bank Rule Engine Parameters
            </CardTitle>
            <CardDescription className="text-xs">Deterministic AML threshold rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Smurfing / Structuring Upper Bound ($)</Label>
              <Input type="number" defaultValue="10000" className="h-8 text-xs bg-background" />
              <p className="text-[10px] text-muted-foreground">
                Flags repetitive transactions within $9,000 - $9,999 avoiding CTR filing.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Liquidity Spike Severity ($)</Label>
              <Input type="number" defaultValue="250000" className="h-8 text-xs bg-background" />
              <p className="text-[10px] text-muted-foreground">
                Transactions exceeding this threshold trigger instant high-risk flags.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">Off-Hours Settlement Monitor (00:00 - 05:00)</Label>
                <p className="text-[10px] text-muted-foreground">Flags nocturnal high-velocity batches</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">Cross-Currency Arbitrage Flag</Label>
                <p className="text-[10px] text-muted-foreground">Flags mismatches in sending/receiving currency</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Differential Privacy Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-emerald-400" />
              Differential Privacy Budget (DP-SGD)
            </CardTitle>
            <CardDescription className="text-xs">Opacus privacy amplification parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Epsilon Privacy Loss Budget (ε)</Label>
              <Input type="number" step="0.05" defaultValue="1.25" className="h-8 text-xs bg-background font-mono" />
              <p className="text-[10px] text-muted-foreground">
                Current consortium budget: ε = 1.25 (Rigorous mathematical privacy guarantee).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Delta Privacy Failure Probability (δ)</Label>
              <Input defaultValue="1e-5" disabled className="h-8 text-xs bg-muted/40 font-mono" />
              <p className="text-[10px] text-muted-foreground">
                Strict upper bound ensuring δ &lt; 1/N for sample mass N = 725,964.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">Gaussian Noise Injection (σ = 0.8)</Label>
                <p className="text-[10px] text-muted-foreground">Calibrated noise added to gradient updates</p>
              </div>
              <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">Gradient L2-Norm Clipping (C = 1.0)</Label>
                <p className="text-[10px] text-muted-foreground">Prevents outsized outlier influence on global model</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        {/* Email & Notification Delivery */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4 text-purple-400" />
              Email & Regulatory Dispatch Config
            </CardTitle>
            <CardDescription className="text-xs">Gmail SMTP & Nodemailer Integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">SMTP Sender Account</Label>
              <Input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="h-8 text-xs bg-background font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Configured in Backend/.env via Google App Password.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Central CC Email</Label>
              <Input
                value={defaultCc}
                onChange={(e) => setDefaultCc(e.target.value)}
                className="h-8 text-xs bg-background font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Default regulatory copy recipient for compliance filings.</p>
            </div>
          </CardContent>
        </Card>

        {/* Backend & Node Orchestration */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4 text-indigo-400" />
              5-Bank Partition Orchestration
            </CardTitle>
            <CardDescription className="text-xs">IBM AML Partitioned Client Nodes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-2.5 rounded bg-muted/30 border border-border space-y-1">
              <div className="flex justify-between font-mono">
                <span>Node 1: Oasis Thrift (BANK-70)</span>
                <span className="text-emerald-400">449k txs (62.0%)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Node 2: National Bank of Laramie (BANK-10)</span>
                <span className="text-indigo-400">81k txs (11.2%)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Node 3: National Bank of the East (BANK-12)</span>
                <span className="text-amber-400">79k txs (11.0%)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Node 4: Arbor Savings Bank (BANK-1)</span>
                <span className="text-cyan-400">62k txs (8.6%)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Node 5: Japan Bank #0 (BANK-15)</span>
                <span className="text-purple-400">52k txs (7.2%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button size="sm" variant="outline" className="text-xs">
          Reset to Baseline
        </Button>
        <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4">
          Save Configuration
        </Button>
      </div>
    </div>
  )
}
