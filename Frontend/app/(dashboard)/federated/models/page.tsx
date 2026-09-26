import { GlobalModelStatus } from "@/components/federated/GlobalModelStatus"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function GlobalModelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Global Models</h1>
        <p className="text-sm text-muted-foreground">
          Federated model version registry — aggregated via FedAvg with Differential Privacy.
          Model weights are shown as metadata only; raw tensors are not exposed.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Model Registry</CardTitle>
          <CardDescription className="text-xs">
            Each version is created from FedAvg aggregation of differentially private bank updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalModelStatus />
        </CardContent>
      </Card>
    </div>
  )
}
