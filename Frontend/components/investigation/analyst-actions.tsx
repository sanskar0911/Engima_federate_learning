"use client"

import { Button } from "@/components/ui/button"
import axios from "axios"

export default function AnalystActions({ transactionId }: { transactionId: any }) {

  const sendFeedback = async (decision: string) => {
    await axios.post("http://localhost:5000/api/feedback", {
      transactionId,
      decision,
      reason: "Manual analyst review",
    })
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button
        className="bg-green-600"
        onClick={() => sendFeedback("safe")}
      >
        ✅ Mark Safe
      </Button>

      <Button
        className="bg-red-600"
        onClick={() => sendFeedback("fraud")}
      >
        ❌ Mark Fraud
      </Button>
    </div>
  )
}