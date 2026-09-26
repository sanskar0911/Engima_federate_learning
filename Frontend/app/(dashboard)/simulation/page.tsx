"use client"

import { useState } from "react"
import { BankStatusGrid } from "@/components/federated/BankStatusGrid"
import { FraudPropagationDemo } from "@/components/federated/FraudPropagationDemo"
import { FederatedRoundCard } from "@/components/federated/FederatedRoundCard"
import { LiveFederatedEvents } from "@/components/federated/LiveFederatedEvents"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { startSimulation, stopSimulation, runFullDemo } from "@/lib/federated-api"
import { Loader2, Play, Square, Zap } from "lucide-react"
import { toast } from "sonner"

export default function SimulationPage() {
  const [simRunning, setSimRunning] = useState(false)
  const [demoRunning, setDemoRunning] = useState(false)

  const handleStartSim = async () => {
    try {
      await startSimulation()
      setSimRunning(true)
      toast.success("Transaction simulation started")
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleStopSim = async () => {
    try {
      await stopSimulation()
      setSimRunning(false)
      toast.success("Simulation stopped")
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleFullDemo = async () => {
    setDemoRunning(true)
    try {
      await runFullDemo("CROSS_BANK_FRAUD")
      toast.success("Full demo sequence initiated — watch the events panel")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setTimeout(() => setDemoRunning(false), 15000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Simulation Center</h1>
          <p className="text-sm text-muted-foreground">
            Control the live transaction stream, trigger federated rounds, and run cross-bank fraud demos
          </p>
        </div>
        <Badge className="border border-border text-muted-foreground text-xs">DEMO MODE</Badge>
      </div>

      {/* Master controls */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">System Controls</CardTitle>
          <CardDescription className="text-xs">Start/stop the transaction stream and run the full hackathon demo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleStartSim}
              disabled={simRunning}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Play className="h-4 w-4" /> Start Transaction Stream
            </Button>
            <Button
              onClick={handleStopSim}
              disabled={!simRunning}
              variant="outline"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Square className="h-4 w-4" /> Stop Stream
            </Button>
            <Button
              onClick={handleFullDemo}
              disabled={demoRunning}
              className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90"
            >
              {demoRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {demoRunning ? "Running Demo..." : "▶ Full Hackathon Demo"}
            </Button>
          </div>
          {demoRunning && (
            <p className="text-xs text-blue-400 mt-3">
              Demo sequence running: Connect banks → Start round → Collect updates → Aggregate → Distribute → Inject fraud → Before/After comparison
            </p>
          )}
        </CardContent>
      </Card>

      {/* Banks + Round */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Bank Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <BankStatusGrid />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Federated Round</CardTitle>
          </CardHeader>
          <CardContent>
            <FederatedRoundCard showTimeline={true} />
          </CardContent>
        </Card>
      </div>

      {/* Demo */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Fraud Pattern Injection</CardTitle>
          <CardDescription className="text-xs">
            Select a pattern, inject into a source bank, watch it propagate through federation, and see the before/after detection comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FraudPropagationDemo />
        </CardContent>
      </Card>

      {/* Live Events */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Live Event Stream</CardTitle>
          <CardDescription className="text-xs">All federated, transaction, and privacy events</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveFederatedEvents maxHeight="h-96" />
        </CardContent>
      </Card>
    </div>
  )
}
