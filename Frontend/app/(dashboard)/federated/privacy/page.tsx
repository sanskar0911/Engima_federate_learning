import { PrivacyMonitor } from "@/components/federated/PrivacyMonitor"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PrivacyCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Privacy Center</h1>
        <p className="text-sm text-muted-foreground">
          All data transfers monitored in real time. Raw transaction data and PII remain within each bank node —
          only differentially private model weight updates are transmitted.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Privacy Monitor</CardTitle>
          <CardDescription className="text-xs">
            Transfer log showing allowed vs. blocked data movements (DPDP Act compliance simulation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrivacyMonitor />
        </CardContent>
      </Card>
    </div>
  )
}
