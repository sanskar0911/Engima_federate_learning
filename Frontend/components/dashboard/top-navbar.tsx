"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Bell, Search, Moon, Sun, User, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopNavbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const [highRiskAccounts, setHighRiskAccounts] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const loadAlerts = async () => {
      try {
        const { fraudApi } = await import("@/lib/api-service")
        
        // Load Alerts
        const fetchedAlerts = await fraudApi.getAlerts()
        const sortedAlerts = (fetchedAlerts as any[]).sort((a, b) => b.riskScore - a.riskScore).slice(0, 4)
        setAlerts(sortedAlerts)

        // Load High Risk Accounts
        const fetchedAccounts = await fraudApi.getAccounts()
        const filtered = (fetchedAccounts as any[]).filter(acc => acc.riskScore >= 85)
        setHighRiskAccounts(filtered)
      } catch (err) {
        console.error(err)
      }
    }
    loadAlerts()
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search account ID, transaction ID..."
          className="pl-10 bg-muted/50 border-border"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {(alerts.length > 0 || highRiskAccounts.length > 0) && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {alerts.length + highRiskAccounts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
            {highRiskAccounts.length > 0 && (
              <>
                <DropdownMenuLabel className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  High Risk Accounts (≥85%)
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {highRiskAccounts.map((account, idx) => (
                  <div key={`acc-${idx}`} className="px-2 py-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{account.id}</span>
                      <span className="text-xs font-bold text-destructive">Score: {account.riskScore}%</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full h-7 text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => router.push(`/investigation?id=${account.id}`)}
                    >
                      Investigate Account
                    </Button>
                  </div>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel>Highest Risk Alerts</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length > 0 ? alerts.map((alert, idx) => (
              <DropdownMenuItem 
                key={`alert-${idx}`} 
                className="flex flex-col items-start gap-1 cursor-pointer"
                onClick={() => router.push(`/fund-flow?accountId=${alert.accountId}`)}
              >
                <div className="flex w-full justify-between items-center">
                  <span className="font-medium text-destructive">{alert.type || "Suspicious Activity"}</span>
                  <span className="text-xs font-bold text-destructive">Risk: {alert.riskScore}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{alert.description || `Account: ${alert.accountId}`}</span>
              </DropdownMenuItem>
            )) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No active alerts</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary cursor-pointer w-full justify-center" onClick={() => router.push('/alerts')}>
              View all alerts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium">Alex Chen</span>
                <span className="text-xs text-muted-foreground">Fraud Analyst</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
