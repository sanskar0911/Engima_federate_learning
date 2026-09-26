"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PathStep {
  from: string
  to: string
  amount: number
  reason: string
  riskScore: number
}

interface PathTracerProps {
  steps?: PathStep[]
  onStepChange?: (step: PathStep) => void
}

const DEFAULT_STEPS: PathStep[] = [
  { from: "ACC001", to: "ACC002", amount: 150000, reason: "Initial suspicious transfer", riskScore: 72 },
  { from: "ACC002", to: "ACC003", amount: 148000, reason: "Layering — rapid forwarding within 2 min", riskScore: 85 },
  { from: "ACC003", to: "ACC004", amount: 145000, reason: "Shell company — Virgin Islands jurisdiction", riskScore: 91 },
  { from: "ACC004", to: "ACC001", amount: 143000, reason: "Circular return — money laundering confirmed", riskScore: 97 },
]

export default function PathTracer({ steps = DEFAULT_STEPS, onStepChange }: PathTracerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1)
    }, 1200)
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, steps.length])

  useEffect(() => {
    if (steps[currentStep] && onStepChange) {
      onStepChange(steps[currentStep])
    }
  }, [currentStep])

  const reset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const current = steps[currentStep]

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-destructive"
    if (score >= 60) return "text-warning"
    return "text-success"
  }

  const getRiskBg = (score: number) => {
    if (score >= 80) return "bg-destructive/10 border-destructive/30"
    if (score >= 60) return "bg-warning/10 border-warning/30"
    return "bg-success/10 border-success/30"
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Fund Flow Path Tracer
          <Badge variant="outline" className="ml-auto text-xs">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Path Steps Overview */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { setCurrentStep(i); setIsPlaying(false) }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-all",
                  i === currentStep
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : i < currentStep
                    ? "bg-destructive/20 border-destructive text-destructive"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {i + 1}
              </button>
              {i < steps.length - 1 && (
                <ArrowRight className={cn("h-3 w-3", i < currentStep ? "text-destructive" : "text-muted-foreground")} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Detail */}
        <div className={cn("rounded-lg border p-4 space-y-3", getRiskBg(current.riskScore))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm font-bold">
              <span className="text-primary">{current.from}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="text-primary">{current.to}</span>
            </div>
            <span className={cn("text-lg font-bold", getRiskColor(current.riskScore))}>
              {current.riskScore}%
            </span>
          </div>

          <div className="text-xl font-bold text-card-foreground">
            ₹{current.amount.toLocaleString("en-IN")}
          </div>

          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive flex-shrink-0" />
            <span className="text-card-foreground">{current.reason}</span>
          </div>
        </div>

        {/* All Steps Timeline */}
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={i}
              onClick={() => { setCurrentStep(i); setIsPlaying(false) }}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors text-xs",
                i === currentStep ? "bg-primary/10 border border-primary/30" : "hover:bg-muted border border-transparent"
              )}
            >
              <div className="flex items-center gap-2 font-mono">
                <span className={cn("h-2 w-2 rounded-full", i <= currentStep ? "bg-destructive" : "bg-muted-foreground")} />
                {step.from} → {step.to}
              </div>
              <span className="text-muted-foreground">₹{step.amount.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => setCurrentStep((p) => Math.max(0, p - 1))} disabled={currentStep === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" className="flex-1" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "▶ Auto Play"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))} disabled={currentStep === steps.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}