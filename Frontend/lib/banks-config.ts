/**
 * Centralized 5-Bank Configuration for FedShield Multi-Bank Federated AML Platform.
 * Represents the 5 real partitioned client nodes from the IBM AML Financial Dataset.
 */

export interface BankConfig {
  id: string
  idNum: number
  key: string
  name: string
  shortCode: string
  region: string
  color: string
  borderColor: string
  bgColor: string
  totalTransactions: number
  actualFraudCases: number
  fraudRatePct: string
  avgVolume: number
  federatedWeight: number
  federatedWeightPct: string
  riskScore: number
  primaryChannel: string
  status: "ONLINE" | "TRAINING" | "UPDATING" | "OFFLINE"
  currency: string
  description: string
}

export const FIVE_BANKS: BankConfig[] = [
  {
    id: "BANK-70",
    idNum: 70,
    key: "BANK-70",
    name: "Oasis Thrift",
    shortCode: "OAS",
    region: "US-North Central",
    color: "#10b981", // emerald
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    totalTransactions: 449859,
    actualFraudCases: 633,
    fraudRatePct: "0.141%",
    avgVolume: 124500000,
    federatedWeight: 0.620,
    federatedWeightPct: "62.0%",
    riskScore: 74.2,
    primaryChannel: "Cheque / Cash",
    status: "ONLINE",
    currency: "USD",
    description: "Primary retail and commercial savings bank; acts as the primary liquidity anchor contributing 62% of global gradient mass.",
  },
  {
    id: "BANK-10",
    idNum: 10,
    key: "BANK-10",
    name: "National Bank of Laramie",
    shortCode: "NBL",
    region: "US-Mountain West",
    color: "#6366f1", // indigo
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/10",
    totalTransactions: 81629,
    actualFraudCases: 51,
    fraudRatePct: "0.062%",
    avgVolume: 48900000,
    federatedWeight: 0.112,
    federatedWeightPct: "11.2%",
    riskScore: 61.8,
    primaryChannel: "ACH / Credit Card",
    status: "ONLINE",
    currency: "USD",
    description: "Mountain West regional anchor with high retail ACH volume and fast automated clearing.",
  },
  {
    id: "BANK-12",
    idNum: 12,
    key: "BANK-12",
    name: "National Bank of the East",
    shortCode: "NBE",
    region: "US-Eastern Seaboard",
    color: "#f59e0b", // amber
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    totalTransactions: 79754,
    actualFraudCases: 76,
    fraudRatePct: "0.095%",
    avgVolume: 62100000,
    federatedWeight: 0.110,
    federatedWeightPct: "11.0%",
    riskScore: 68.5,
    primaryChannel: "Wire / Reinvestment",
    status: "ONLINE",
    currency: "USD",
    description: "Eastern Seaboard corridor capturing high-frequency institutional wires and reinvestment cycles.",
  },
  {
    id: "BANK-1",
    idNum: 1,
    key: "BANK-1",
    name: "Arbor Savings Bank",
    shortCode: "ASB",
    region: "US-Great Lakes",
    color: "#06b6d4", // cyan
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/10",
    totalTransactions: 62211,
    actualFraudCases: 50,
    fraudRatePct: "0.080%",
    avgVolume: 31200000,
    federatedWeight: 0.086,
    federatedWeightPct: "8.6%",
    riskScore: 58.4,
    primaryChannel: "Cheque / Wire",
    status: "ONLINE",
    currency: "USD",
    description: "Great Lakes savings collective specializing in Cheque/Wire settlement and cross-county clearing.",
  },
  {
    id: "BANK-15",
    idNum: 15,
    key: "BANK-15",
    name: "Japan Bank #0",
    shortCode: "JB0",
    region: "APAC Corridor",
    color: "#a855f7", // purple
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    totalTransactions: 52511,
    actualFraudCases: 46,
    fraudRatePct: "0.088%",
    avgVolume: 29800000,
    federatedWeight: 0.072,
    federatedWeightPct: "7.2%",
    riskScore: 64.1,
    primaryChannel: "Cross-Currency FX",
    status: "ONLINE",
    currency: "USD / JPY / EUR",
    description: "APAC cross-border corridor capturing offshore currency conversion and rapid foreign exchange jumps.",
  },
]

export const BANK_BY_ID: Record<string, BankConfig> = FIVE_BANKS.reduce((acc, bank) => {
  acc[bank.id] = bank
  acc[String(bank.idNum)] = bank
  return acc
}, {} as Record<string, BankConfig>)

export const GLOBAL_FEDERATED_SUMMARY = {
  totalNodes: 5,
  totalTransactions: 725964,
  totalConfirmedFraud: 856,
  globalFraudRatePct: "0.118%",
  modelName: "FraudMLP (36,289 parameters)",
  aggregationStrategy: "FedAvg with Volume-Proportional Weighting",
  privacyEpsilon: 1.25,
  privacyDelta: "1e-5",
  activeRound: 5,
  modelVersion: "v2.1.0-fedavg",
  aggregationEquation: "W_global = 0.620·W_Oasis + 0.112·W_Laramie + 0.110·W_East + 0.086·W_Arbor + 0.072·W_Japan",
}
