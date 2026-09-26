import { BankStatusGrid } from "@/components/federated/BankStatusGrid"
import { FederatedRoundCard } from "@/components/federated/FederatedRoundCard"
import { FederatedNetwork } from "@/components/federated/FederatedNetwork"
import { GlobalModelStatus } from "@/components/federated/GlobalModelStatus"
import { PrivacyMonitor } from "@/components/federated/PrivacyMonitor"
import { FraudPropagationDemo } from "@/components/federated/FraudPropagationDemo"
import { LiveFederatedEvents } from "@/components/federated/LiveFederatedEvents"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function FederatedHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Federation Hub</h1>
        <p className="text-sm text-muted-foreground">
          Orchestrate federated rounds, manage bank nodes, monitor global model versions, and run cross-bank fraud demos.
        </p>
      </div>

      {/* Network + Round side by side */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Federated Network</CardTitle>
            <CardDescription className="text-xs">Live model-update and distribution flows — raw data stays within each bank node</CardDescription>
          </CardHeader>
          <CardContent>
            <FederatedNetwork />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Round Control</CardTitle>
            <CardDescription className="text-xs">Start and monitor federated learning rounds</CardDescription>
          </CardHeader>
          <CardContent>
            <FederatedRoundCard showTimeline={true} />
          </CardContent>
        </Card>
      </div>

      {/* Banks + Live Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Bank Nodes</CardTitle>
            <CardDescription className="text-xs">Connect/disconnect federated participants</CardDescription>
          </CardHeader>
          <CardContent>
            <BankStatusGrid />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Live Events</CardTitle>
            <CardDescription className="text-xs">Real-time federation, privacy, and transaction events</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveFederatedEvents maxHeight="h-64" />
          </CardContent>
        </Card>
      </div>

      {/* Global Model */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Global Model Registry</CardTitle>
          <CardDescription className="text-xs">Aggregated model versions and distribution status</CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalModelStatus />
        </CardContent>
      </Card>

      {/* Demo */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Cross-Bank Fraud Propagation Demo</CardTitle>
          <CardDescription className="text-xs">Inject a fraud pattern and watch it propagate through the federated network</CardDescription>
        </CardHeader>
        <CardContent>
          <FraudPropagationDemo />
        </CardContent>
      </Card>

      {/* Privacy Monitor */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Privacy Monitor</CardTitle>
          <CardDescription className="text-xs">Data transfer audit — raw transaction data remains within each bank node</CardDescription>
        </CardHeader>
        <CardContent>
          <PrivacyMonitor />
        </CardContent>
      </Card>
    </div>
  )
}
