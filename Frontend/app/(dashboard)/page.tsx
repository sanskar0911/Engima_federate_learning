import { StatsCards } from "@/components/dashboard/stats-cards"
import { TransactionChart, RiskDistributionChart, FraudPieChart } from "@/components/dashboard/dashboard-charts"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import FraudTrendChart from "@/components/analytics/fraud_trand_chart"
import FraudChatbot from "@/components/chat/fraud-chatbot"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Federated Risk Command Center</h1>
          <p className="text-muted-foreground">Cross-institution privacy-preserving financial risk control (DPDP Act compliant)</p>
        </div>
      </div>
      <StatsCards />
      <FraudTrendChart />
      <div className="grid gap-6 lg:grid-cols-4">
        <TransactionChart />
        <RiskDistributionChart />
        <FraudPieChart />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAlerts />
        </div>
        <div className="lg:col-span-1">
          <FraudChatbot />
        </div>
      </div>
    </div>
  )
}

