"use client"

import { useState } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Search, 
  ArrowRight, 
  AlertTriangle,
  Info,
  ShieldAlert,
  SendHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { fraudApi } from "@/lib/api-service"
import { cn } from "@/lib/utils"

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (amount: number) => void
}

type Step = "input" | "analyzing" | "result"

export function PaymentForm({ isOpen, onClose, onSuccess }: PaymentFormProps) {
  const [step, setStep] = useState<Step>("input")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [riskResult, setRiskResult] = useState<any>(null)

  const handleNext = async () => {
    if (!recipient || !amount) return
    
    setStep("analyzing")
    
    try {
      // Small artificial delay for "AI scanning" aesthetic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const res = await fraudApi.preCheckTransaction({
        sourceAccountId: "ACC001",
        targetAccountId: "ACC003", // Hardcoded for demo
        amount: parseFloat(amount),
        type: "NEFT",
        location: "Mumbai",
        deviceId: "DESKTOP-RKV"
      })
      
      setRiskResult(res)
      
      // Override logic: if score > 80, the button for confirming will be blocked or auto-failed
      // For this demo, we'll go straight to the result step
      setStep("result")
      
      if (res.score <= 80) {
        // If it's successful, we'd actually call createTransaction here in a real app
        // For now, we'll just show the success screen
        // fraudApi.createTransaction({...})
        onSuccess(parseFloat(amount))
      }
    } catch (err) {
      console.error(err)
      setStep("input")
    }
  }

  const reset = () => {
    setStep("input")
    setRecipient("")
    setAmount("")
    setRiskResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <SendHorizontal className="h-6 w-6 text-primary" />
              Send Money Securely
            </DialogTitle>
            <DialogDescription>
              Your transaction is protected by AI-powered real-time fraud detection.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8">
            {step === "input" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Account ID / UPI ID</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="recipient" 
                      placeholder="e.g. ACC003 or user@upi" 
                      className="pl-10 h-11 border-border/50 focus:border-primary"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    className="h-11 border-border/50 text-lg font-semibold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Daily limit remaining: ₹5,00,000</p>
                </div>

                <div className="pt-2">
                  <Button 
                    className="w-full h-11 text-base font-semibold group transition-all" 
                    onClick={handleNext}
                    disabled={!recipient || !amount || parseFloat(amount) <= 0}
                  >
                    Proceed to Verify
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === "analyzing" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Securing Transaction...</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    Our AI is scanning behavioral patterns and network risks to ensure your safety.
                  </p>
                </div>
                <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary animate-progress-fast" />
                </div>
              </div>
            )}

            {step === "result" && riskResult && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                {riskResult.score > 80 ? (
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border-4 border-destructive/20 scale-110 animate-bounce">
                      <ShieldAlert className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-destructive">Transaction Blocked</h3>
                      <p className="text-sm text-muted-foreground">
                        Our fraud detection engine has flagged this transaction as high risk.
                      </p>
                    </div>

                    <Card className="w-full border-destructive/20 bg-destructive/5 overflow-hidden">
                      <CardHeader className="py-3 bg-destructive/10">
                        <div className="flex items-center gap-2 text-xs font-bold text-destructive uppercase tracking-widest">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Factors Detected
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 text-left">
                         <div className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center text-[10px] font-bold mt-0.5">!</div>
                            <div>
                               <div className="text-sm font-semibold">High-Risk Pattern</div>
                               <div className="text-xs text-muted-foreground">The transaction score ({riskResult.score}%) exceeds the safety threshold of 80%.</div>
                            </div>
                         </div>
                         {riskResult.factors && riskResult.factors.map((f: any, i: number) => (
                           <div key={i} className="flex items-start gap-3 mt-3">
                              <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold mt-0.5 text-destructive">•</div>
                              <div className="text-xs text-muted-foreground italic">"{f.reason}"</div>
                           </div>
                         ))}
                      </CardContent>
                    </Card>

                    <div className="w-full space-y-3 pt-2">
                      <Button variant="outline" className="w-full" onClick={reset}>Go Back</Button>
                      <Button variant="ghost" className="w-full text-xs text-muted-foreground">Contact Support</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border-4 border-emerald-500/20 scale-110 animate-in zoom-in duration-500">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-emerald-500">Payment Successful</h3>
                      <p className="text-sm text-muted-foreground">
                        Transaction of <span className="font-bold text-foreground">₹{parseFloat(amount).toLocaleString('en-IN')}</span> has been processed.
                      </p>
                    </div>

                    <div className="w-full p-4 rounded-xl bg-muted/50 border border-border/50 text-left space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Risk Score</span>
                          <span className="font-bold text-emerald-500">{riskResult.score}% (Secure)</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Transaction ID</span>
                          <span className="font-mono">TXN-7392-81BK</span>
                       </div>
                    </div>

                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={reset}>Done</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar for aesthetic */}
        <div className="h-1 w-full bg-muted mt-auto">
          <div 
             className={cn(
               "h-full transition-all duration-500 bg-primary",
               step === "input" ? "w-1/3" : step === "analyzing" ? "w-2/3" : "w-full"
             )} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
