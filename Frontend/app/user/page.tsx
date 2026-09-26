"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  ShieldCheck, 
  History,
  TrendingUp,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentForm } from "@/components/user/payment-form"
import { TransactionHistory } from "@/components/user/transaction-history"
import { fraudApi } from "@/lib/api-service"

export default function UserDashboard() {
  const [balance, setBalance] = useState(2450000) // Mock balance for Ravi Kumar
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const txns = await fraudApi.getAccountTransactions("ACC001")
        setRecentTransactions(txns.slice(0, 5))
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Ravi. Your accounts are secure.</p>
        </div>
        <Button 
          size="lg" 
          className="gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95"
          onClick={() => setIsPaymentModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Send Money
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Total Balance</CardDescription>
            <CardTitle className="text-4xl font-bold">₹{(balance).toLocaleString('en-IN')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-emerald-500 font-medium gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.4% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Recent Spending</CardDescription>
            <CardTitle className="text-2xl font-bold">₹42,500</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <ArrowUpRight className="h-3 w-3" />
              12 transactions this week
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="font-medium">Security Status</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary">Active</CardTitle>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              AI-powered fraud protection is enabled
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Transactions
            </h2>
            <Button variant="ghost" size="sm" className="text-sm font-medium text-primary">
              View All
            </Button>
          </div>
          <TransactionHistory transactions={recentTransactions} />
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Saved Accounts
          </h2>
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4 space-y-4">
              {[
                { name: "Priya Sharma", acc: "...2345", bank: "HDFC" },
                { name: "Amit Singh", acc: "...4567", bank: "Axis" },
                { name: "Neha Gupta", acc: "...5678", bank: "Kotak" }
              ].map((contact, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">{contact.name}</div>
                      <div className="text-[10px] text-muted-foreground">{contact.bank} • {contact.acc}</div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed dashed mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add New Recipient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentForm 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={(amount: number) => {
          setBalance(prev => prev - amount)
          // Refresh transactions would go here
        }}
      />
    </div>
  )
}
