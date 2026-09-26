import { FederatedKPICards } from "@/components/federated/FederatedKPICards"
import { FederatedNetwork } from "@/components/federated/FederatedNetwork"
import { BankStatusGrid } from "@/components/federated/BankStatusGrid"
import { FederatedRoundCard } from "@/components/federated/FederatedRoundCard"
import { LiveFederatedEvents } from "@/components/federated/LiveFederatedEvents"
import { GlobalModelStatus } from "@/components/federated/GlobalModelStatus"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">FedShield Command Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Federated Financial Risk Control — Cross-Institution Privacy-Preserving Detection (DPDP Act Compliant)
        </p>
      </div>

      {/* KPI Row */}
      <FederatedKPICards />

      {/* Network + Round */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Federated Network</CardTitle>
            <CardDescription className="text-xs">Live bank-to-aggregator communication</CardDescription>
          </CardHeader>
          <CardContent>
            <FederatedNetwork />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Active Round</CardTitle>
            <CardDescription className="text-xs">Federated learning round lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <FederatedRoundCard showTimeline={true} />
          </CardContent>
        </Card>
      </div>

      {/* Banks + Model */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Bank Nodes</CardTitle>
            <CardDescription className="text-xs">Federated participants</CardDescription>
          </CardHeader>
          <CardContent>
            <BankStatusGrid />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Global Model</CardTitle>
            <CardDescription className="text-xs">Aggregated federated model versions</CardDescription>
          </CardHeader>
          <CardContent>
            <GlobalModelStatus />
          </CardContent>
        </Card>
      </div>

      {/* Events + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Live System Events</CardTitle>
            <CardDescription className="text-xs">Real-time federated and transaction events</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveFederatedEvents maxHeight="h-72" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RecentAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
