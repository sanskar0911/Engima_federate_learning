"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react"

type Step = {
  from: string
  to: string
  reason: string
}

export default function InvestigatorPanel({
  steps = [],
  highlightPath,
}: {
  steps: Step[]
  highlightPath: (step: Step) => void
}) {
  const [currentStep, setCurrentStep] = useState(0)

  // 🔥 NEXT STEP
  const nextStep = () => {
    setCurrentStep((prev) =>
      prev < steps.length - 1 ? prev + 1 : prev
    )
  }

  // 🔥 PREVIOUS STEP
  const prevStep = () => {
    setCurrentStep((prev) =>
      prev > 0 ? prev - 1 : prev
    )
  }

  // 🔥 RESET
  const resetSteps = () => {
    setCurrentStep(0)
  }

  // 🔥 AUTO HIGHLIGHT
  useEffect(() => {
    if (steps[currentStep]) {
      highlightPath(steps[currentStep])
    }
  }, [currentStep, steps, highlightPath])

  if (!steps.length) {
    return (
      <div className="p-4 text-sm text-gray-400">
        No investigation steps available
      </div>
    )
  }

  const current = steps[currentStep]

  return (
    <Card className="w-full max-w-md bg-gray-900 border border-gray-700">
      <CardHeader>
        <CardTitle className="text-sm">
          🔍 Investigation Timeline
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* STEP INFO */}
        <div className="p-3 bg-gray-800 rounded">
          <p className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </p>

          <p className="text-sm mt-1">
            <span className="text-blue-400">{current.from}</span>
            {" → "}
            <span className="text-purple-400">{current.to}</span>
          </p>

          <p className="text-xs text-red-400 mt-2">
            {current.reason}
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>

          <Button
            size="sm"
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <Button size="sm" variant="outline" onClick={resetSteps}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}