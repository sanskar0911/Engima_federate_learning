"use client"

import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionHistoryProps {
  transactions: any[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card/50">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">No transactions yet</h3>
        <p className="text-sm text-muted-foreground">Start sending money to see your history here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn, i) => (
        <div 
          key={i} 
          className="group flex items-center justify-between p-4 rounded-2xl bg-card/50 border border-border/40 hover:bg-accent transition-all hover:border-primary/20 backdrop-blur-sm cursor-pointer shadow-sm hover:shadow-md animate-in fade-in slide-in-from-left-4 duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-inner",
              txn.from === "ACC001" 
                ? "bg-primary/5 text-primary" 
                : "bg-emerald-500/5 text-emerald-500"
            )}>
              {txn.from === "ACC001" ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">
                  {txn.from === "ACC001" ? `To: ${txn.to}` : `From: ${txn.from}`}
                </span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  txn.status === "normal" ? "bg-emerald-500/10 text-emerald-500" :
                  txn.status === "suspicious" ? "bg-amber-500/10 text-amber-500" :
                  "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                  {txn.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(txn.timestamp).toLocaleDateString()} at {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="opacity-30">•</span>
                <span>{txn.type} Payment</span>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className={cn(
              "text-lg font-black tracking-tight",
              txn.from === "ACC001" ? "text-foreground" : "text-emerald-500"
            )}>
              {txn.from === "ACC001" ? "-" : "+"}₹{txn.amount.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-end gap-1.5">
               <span className="text-[10px] text-muted-foreground font-medium">Risk Score:</span>
               <span className={cn(
                 "text-[10px] font-bold px-1 rounded-sm",
                 txn.riskScore < 30 ? "text-emerald-500 bg-emerald-500/5" :
                 txn.riskScore < 70 ? "text-amber-500 bg-amber-500/5" :
                 "text-destructive bg-destructive/5"
               )}>
                 {txn.riskScore}%
               </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
