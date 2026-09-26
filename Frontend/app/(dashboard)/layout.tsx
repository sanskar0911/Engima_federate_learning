import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <TopNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
