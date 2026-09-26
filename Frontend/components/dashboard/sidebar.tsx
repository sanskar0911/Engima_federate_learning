"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Network,
  AlertTriangle,
  Search,
  FileText,
  Settings,
  Shield,
  Activity,
  Database,
  Lock,
  Cpu,
  Zap,
  BarChart2,
  ListChecks,
  HeartPulse,
  Building2,
  Layers,
  UploadCloud,
  Mail,
} from "lucide-react"

import { useFederatedSocket } from "@/hooks/useFederatedSocket"
import { useBankStatus } from "@/hooks/useFederated"
import { cn as cx } from "@/lib/utils"

const navItems = [
  { href: "/",                 label: "Dashboard",             icon: LayoutDashboard, group: "main" },
  { href: "/tasks",            label: "User Analysis Tasks",   icon: Layers,          group: "main" },
  { href: "/transactions",     label: "Transactions",          icon: ArrowLeftRight,  group: "main" },
  { href: "/fund-flow",        label: "Fund Flow (5 Banks)",   icon: Network,         group: "main" },
  { href: "/banks",            label: "5 Bank Node Profiles",  icon: Building2,       group: "main" },
  { href: "/intra-bank-risk",   label: "Intra-Bank Risk (IBM)", icon: Building2,       group: "main" },
  { href: "/alerts",           label: "Alerts",                icon: AlertTriangle,   group: "main" },
  { href: "/investigation",    label: "Investigation",         icon: Search,          group: "main" },

  { href: "/federated",             label: "Federation Hub",         icon: Activity, group: "fed" },
  { href: "/federated/cross-bank",  label: "Cross-Bank Model (5 Wt)",icon: Cpu,      group: "fed" },
  { href: "/live-events",           label: "Live System Events",     icon: Activity, group: "fed" },
  { href: "/federated/rounds",      label: "Rounds",                 icon: Layers,   group: "fed" },
  { href: "/federated/privacy",     label: "Privacy Center (DPDP)",  icon: Lock,     group: "fed" },
  { href: "/simulation",            label: "Live Attack Stream",     icon: Zap,      group: "fed" },

  { href: "/import",        label: "Dataset Ingestion",  icon: UploadCloud, group: "ops" },
  { href: "/reports",       label: "Compliance Reports", icon: FileText,    group: "ops" },
  { href: "/email-reports", label: "Email Dispatcher",   icon: Mail,        group: "ops" },
  { href: "/analytics",     label: "Analytics & Telemetry",icon: BarChart2, group: "ops" },
  { href: "/audit",         label: "Audit Trail",        icon: ListChecks,  group: "ops" },
  { href: "/health",        label: "System Health",      icon: HeartPulse,  group: "ops" },
  { href: "/settings",      label: "Settings",           icon: Settings,    group: "ops" },
  { href: "/login",         label: "Switch Account",     icon: Shield,      group: "ops" },
]

const GROUPS = [
  { key: "main", label: "Operations & Tasks" },
  { key: "fed",  label: "Federated Learning" },
  { key: "ops",  label: "System & Ingestion" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { connected } = useFederatedSocket()
  const { banks } = useBankStatus()
  const onlineCount = banks.filter((b) => b.status !== "OFFLINE" && b.status !== "ERROR").length

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight">FedShield</span>
            <span className="text-[10px] text-muted-foreground">Federated Risk Control</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {GROUPS.map((group) => {
            const groupItems = navItems.filter((n) => n.group === group.key)
            return (
              <div key={group.key}>
                <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {groupItems.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Footer status */}
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-sidebar-accent p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-emerald-400 animate-pulse" : "bg-zinc-500")} />
                <span className="text-muted-foreground">{connected ? "WebSocket Live" : "Offline"}</span>
              </div>
              <span className="text-muted-foreground font-mono">{onlineCount}/{banks.length} banks</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
