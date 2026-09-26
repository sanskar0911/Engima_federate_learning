"use client"

import React, { useState } from "react"
import { FIVE_BANKS } from "@/lib/banks-config"
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  ArrowRight,
  Database,
  FileText,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ImportPage() {
  const [selectedBankId, setSelectedBankId] = useState("BANK-70")
  const [dataName, setDataName] = useState("Oasis_Q3_Settlement_Feed.csv")
  const [fileSelected, setFileSelected] = useState<string | null>("bank_1_node.csv (40.3 MB)")
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const selectedBank = FIVE_BANKS.find((b) => b.id === selectedBankId) || FIVE_BANKS[0]

  // Mock preview records representative of IBM dataset structure
  const samplePreviewData = [
    {
      timestamp: "2022/09/01 00:25",
      fromBank: selectedBank.idNum,
      fromAccount: "100428660",
      toBank: "10",
      toAccount: "800059F50",
      amountPaid: "$5,105.92",
      currency: "US Dollar",
      format: "Cheque",
      isLaundering: 0,
    },
    {
      timestamp: "2022/09/01 00:16",
      fromBank: selectedBank.idNum,
      fromAccount: "100428660",
      toBank: "220",
      toAccount: "800132390",
      amountPaid: "$15,509,630.09",
      currency: "US Dollar",
      format: "Cheque",
      isLaundering: 0,
    },
    {
      timestamp: "2022/09/01 00:03",
      fromBank: selectedBank.idNum,
      fromAccount: "100428660",
      toBank: "220",
      toAccount: "800132390",
      amountPaid: "$19,780,972.52",
      currency: "US Dollar",
      format: "Cash",
      isLaundering: 0,
    },
    {
      timestamp: "2022/09/01 00:05",
      fromBank: selectedBank.idNum,
      fromAccount: "100428660",
      toBank: "1",
      toAccount: "800199240",
      amountPaid: "$24,112.46",
      currency: "US Dollar",
      format: "Cheque",
      isLaundering: 1,
    },
  ]

  const handleValidate = () => {
    if (!dataName.trim()) {
      toast.error("Please enter a Data/File Name")
      return
    }
    setIsValidating(true)
    setTimeout(() => {
      setIsValidating(false)
      setStep(2)
      toast.success("Dataset schema validated successfully against IBM AML standard!")
    }, 900)
  }

  const handleConfirmImport = () => {
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setStep(3)
      setImportSuccess(true)
      toast.success(`Successfully imported dataset into ${selectedBank.name} partition!`)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Bank Node Dataset Ingestion & Partitioning
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ingest raw transaction CSV batches into an isolated on-premise bank partition without cross-institutional leak.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div
          className={cn(
            "p-3 rounded-lg border text-center transition font-medium",
            step >= 1 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-card border-border text-muted-foreground"
          )}
        >
          1. Select Bank & Dataset
        </div>
        <div
          className={cn(
            "p-3 rounded-lg border text-center transition font-medium",
            step >= 2 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-card border-border text-muted-foreground"
          )}
        >
          2. Validate & Preview Schema
        </div>
        <div
          className={cn(
            "p-3 rounded-lg border text-center transition font-medium",
            step === 3 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-card border-border text-muted-foreground"
          )}
        >
          3. Partitioning & Ingestion Complete
        </div>
      </div>

      {/* Step 1: Configuration & File Selection */}
      {step === 1 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-foreground tracking-tight">Step 1: Ingestion Target & File Metadata</h2>

          {/* 1. Select Bank */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Target Bank Node (5 Available)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {FIVE_BANKS.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBankId(b.id)
                    setDataName(`${b.name.replace(/\s+/g, "_")}_Q3_Feed.csv`)
                  }}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition text-xs flex items-center justify-between",
                    selectedBankId === b.id ? b.borderColor + " " + b.bgColor : "border-border/60 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    <div>
                      <div className="font-bold text-foreground">{b.name}</div>
                      <div className="text-[10px] text-muted-foreground">{b.region}</div>
                    </div>
                  </div>
                  {selectedBankId === b.id && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Data Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Data / File Identifier Name</label>
            <input
              type="text"
              value={dataName}
              onChange={(e) => setDataName(e.target.value)}
              placeholder="e.g. Oasis_Q3_Settlement_Feed.csv"
              className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* 3. Drag & Drop / File Select */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-2 bg-muted/20">
            <FileSpreadsheet className="h-8 w-8 text-blue-400 mx-auto" />
            <div className="text-xs font-medium text-foreground">
              {fileSelected || "Drag & Drop transaction CSV file here or click to browse"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Required columns: Timestamp, From Bank, Account, To Bank, Account.1, Amount Paid, Payment Format, Is Laundering
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleValidate}
              disabled={isValidating}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 gap-1.5"
            >
              {isValidating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              Validate & Preview Schema
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Validate & Preview Data */}
      {step === 2 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">Step 2: Schema Validation & Preview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target Node: <strong className="text-foreground">{selectedBank.name} ({selectedBank.id})</strong> · File: <strong className="text-foreground">{dataName}</strong>
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Schema Validated (8/8 Columns)
            </Badge>
          </div>

          {/* Preview Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">Preview Sample Rows (First 4 Transactions):</span>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">From Bank</th>
                    <th className="p-2.5">Account</th>
                    <th className="p-2.5">To Bank</th>
                    <th className="p-2.5">Amount Paid</th>
                    <th className="p-2.5">Format</th>
                    <th className="p-2.5">Laundering</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {samplePreviewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="p-2.5">{row.timestamp}</td>
                      <td className="p-2.5">{row.fromBank}</td>
                      <td className="p-2.5">{row.fromAccount}</td>
                      <td className="p-2.5">{row.toBank}</td>
                      <td className="p-2.5 font-bold text-foreground">{row.amountPaid}</td>
                      <td className="p-2.5">{row.format}</td>
                      <td className="p-2.5">
                        {row.isLaundering === 1 ? (
                          <span className="text-destructive font-bold">1 (FLAGGED)</span>
                        ) : (
                          <span className="text-emerald-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <Button size="sm" variant="outline" onClick={() => setStep(1)} className="text-xs">
              Back to Configuration
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 gap-1.5"
            >
              {isImporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
              Confirm Ingestion & Partition
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Success State */}
      {step === 3 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Dataset Successfully Ingested!</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              The dataset <strong className="text-foreground">{dataName}</strong> has been isolated within the{" "}
              <strong className="text-foreground">{selectedBank.name}</strong> on-premise partition and indexed for federated training.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs pt-2">
            <div className="p-2.5 rounded bg-background border border-border">
              <div className="text-[10px] text-muted-foreground">Bank Partition</div>
              <div className="font-bold text-foreground">{selectedBank.name}</div>
            </div>
            <div className="p-2.5 rounded bg-background border border-border">
              <div className="text-[10px] text-muted-foreground">Privacy Scope</div>
              <div className="font-bold text-emerald-400">LOCAL (Isolated)</div>
            </div>
            <div className="p-2.5 rounded bg-background border border-border">
              <div className="text-[10px] text-muted-foreground">Status</div>
              <div className="font-bold text-foreground">Ready for FedAvg</div>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setStep(1)} className="text-xs">
              Import Another Dataset
            </Button>
            <Button
              size="sm"
              onClick={() => (window.location.href = "/tasks")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
            >
              Run Analysis on Ingested Data
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
