export type FraudType =
  | "circular_transaction"
  | "structuring"
  | "rapid_transfer"
  | "velocity"
  | "dormant_activation"
  | "impossible_travel"
  | "fan_out"

export type TransactionStatus = "normal" | "suspicious" | "flagged"

export type TransactionType = "UPI" | "NEFT" | "IMPS" | "RTGS" | "Card"

export type AlertType =
  | "circular_transaction"
  | "rapid_transfer"
  | "structuring"
  | "velocity"
  | "dormant_activation"

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: string
  riskScore: number
  status: TransactionStatus
  type: TransactionType
  fromCity?: string
  toCity?: string
  fromCountry?: string
  toCountry?: string
  fraudType?: FraudType
}

export interface Account {
  id: string
  name: string
  type: "individual" | "business" | "shell"
  bank: string
  ifsc: string
  city: string
  state: string
  pan: string
  phone: string
  ipAddress: string
  country: string
  balance: number
  createdAt: string
  transactionCount: number
  riskScore: number
  isSuspicious: boolean
  lastLoginCity?: string
  lastLoginIP?: string
  lastActive?: string
  fraudType?: FraudType
  contactEmails?: string[]
}

export interface Alert {
  id: string
  type: AlertType
  accountId: string
  riskScore: number
  timestamp: string
  status: "open" | "investigating" | "resolved"
  description: string
  amount?: number
  reasons?: string[]
  fraudType?: FraudType
}

export interface DashboardStats {
  totalTransactions: number
  suspiciousTransactions: number
  highRiskAccounts: number
  fraudAlerts: number
  totalVolume: number
  avgRiskScore: number
}

const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`

const defaultContactEmails = [
  "sanskar0912gharal@gmail.com",
  "gudulkarpranay@gmail.com",
]

const baseMockAccounts: Account[] = [
  {
    id: "ACC001",
    name: "Ravi Kumar",
    type: "individual",
    bank: "SBI",
    ifsc: "SBIN0001234",
    city: "Mumbai",
    state: "Maharashtra",
    pan: "ABCDE1234F",
    phone: "+919876543210",
    ipAddress: "203.0.113.17",
    country: "IN",
    balance: 2450000,
    createdAt: "2025-06-12T09:10:00.000Z",
    transactionCount: 118,
    riskScore: 92,
    isSuspicious: true,
    lastLoginCity: "Guwahati",
    lastLoginIP: "203.0.113.210",
    lastActive: "2026-03-29T14:22:10.000Z",
    fraudType: "impossible_travel",
  },
  {
    id: "ACC002",
    name: "Priya Sharma",
    type: "individual",
    bank: "HDFC",
    ifsc: "HDFC0002345",
    city: "Delhi",
    state: "Delhi",
    pan: "FGHIJ2345K",
    phone: "+918765432109",
    ipAddress: "203.0.113.22",
    country: "IN",
    balance: 980000,
    createdAt: "2025-01-21T11:05:00.000Z",
    transactionCount: 73,
    riskScore: 34,
    isSuspicious: false,
  },
  {
    id: "ACC003",
    name: "Tech Solutions Pvt Ltd",
    type: "business",
    bank: "ICICI",
    ifsc: "ICIC0003456",
    city: "Bengaluru",
    state: "Karnataka",
    pan: "KLMNO9012P",
    phone: "+917654321098",
    ipAddress: "198.51.100.15",
    country: "IN",
    balance: 5200000,
    createdAt: "2024-10-15T08:40:00.000Z",
    transactionCount: 242,
    riskScore: 81,
    isSuspicious: true,
    lastLoginCity: "Bengaluru",
    lastLoginIP: "198.51.100.33",
    lastActive: "2026-03-30T09:15:20.000Z",
    fraudType: "circular_transaction",
  },
  {
    id: "ACC004",
    name: "Amit Singh",
    type: "individual",
    bank: "Axis",
    ifsc: "UTIB0004567",
    city: "Hyderabad",
    state: "Telangana",
    pan: "PQRST3456U",
    phone: "+916543210987",
    ipAddress: "192.0.2.5",
    country: "IN",
    balance: 430000,
    createdAt: "2025-03-03T12:00:00.000Z",
    transactionCount: 39,
    riskScore: 19,
    isSuspicious: false,
  },
  {
    id: "ACC005",
    name: "Neha Gupta",
    type: "individual",
    bank: "Kotak",
    ifsc: "KKBK0005678",
    city: "Pune",
    state: "Maharashtra",
    pan: "UVWXY7890Z",
    phone: "+919988776655",
    ipAddress: "203.0.113.98",
    country: "IN",
    balance: 612000,
    createdAt: "2025-09-01T07:25:00.000Z",
    transactionCount: 61,
    riskScore: 47,
    isSuspicious: false,
    lastActive: "2026-03-27T16:05:00.000Z",
  },
  {
    id: "ACC006",
    name: "Global Logistics",
    type: "business",
    bank: "PNB",
    ifsc: "PUNB0006789",
    city: "Chennai",
    state: "Tamil Nadu",
    pan: "ZYXWV1234A",
    phone: "+918877665544",
    ipAddress: "198.51.100.44",
    country: "IN",
    balance: 7600000,
    createdAt: "2024-02-10T05:10:00.000Z",
    transactionCount: 310,
    riskScore: 85,
    isSuspicious: true,
    lastLoginCity: "Kolkata",
    lastLoginIP: "198.51.100.201",
    lastActive: "2026-03-28T10:33:40.000Z",
    fraudType: "dormant_activation",
  },
  {
    id: "ACC007",
    name: "Suresh Patel",
    type: "individual",
    bank: "Bank of Baroda",
    ifsc: "BARB0007890",
    city: "Ahmedabad",
    state: "Gujarat",
    pan: "BCDEF5678G",
    phone: "+917766554433",
    ipAddress: "203.0.113.76",
    country: "IN",
    balance: 210000,
    createdAt: "2023-12-20T15:10:00.000Z",
    transactionCount: 24,
    riskScore: 28,
    isSuspicious: false,
  },
  {
    id: "ACC008",
    name: "Sunrise Traders",
    type: "shell",
    bank: "IndusInd",
    ifsc: "INDB0008901",
    city: "Kolkata",
    state: "West Bengal",
    pan: "HIJKL9012M",
    phone: "+916655443322",
    ipAddress: "192.0.2.88",
    country: "IN",
    balance: 980000,
    createdAt: "2024-06-18T13:15:00.000Z",
    transactionCount: 85,
    riskScore: 79,
    isSuspicious: true,
    lastLoginCity: "Mysuru",
    lastLoginIP: "192.0.2.177",
    lastActive: "2026-03-30T18:01:00.000Z",
    fraudType: "fan_out",
  },
  {
    id: "ACC009",
    name: "Vikram Joshi",
    type: "individual",
    bank: "Yes Bank",
    ifsc: "YESB0009012",
    city: "Jaipur",
    state: "Rajasthan",
    pan: "NOPQR3456S",
    phone: "+919998887776",
    ipAddress: "198.51.100.62",
    country: "IN",
    balance: 1350000,
    createdAt: "2025-04-10T09:00:00.000Z",
    transactionCount: 96,
    riskScore: 56,
    isSuspicious: false,
  },
  {
    id: "ACC010",
    name: "Anita Desai",
    type: "individual",
    bank: "SBI",
    ifsc: "SBIN0000123",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pan: "TUVWX7890Y",
    phone: "+918887776665",
    ipAddress: "192.0.2.44",
    country: "IN",
    balance: 760000,
    createdAt: "2025-02-14T10:30:00.000Z",
    transactionCount: 44,
    riskScore: 22,
    isSuspicious: false,
  },
  {
    id: "ACC011",
    name: "Apex Imports",
    type: "shell",
    bank: "HDFC",
    ifsc: "HDFC0001234",
    city: "Surat",
    state: "Gujarat",
    pan: "ABCDE5678F",
    phone: "+917776665554",
    ipAddress: "203.0.113.17",
    country: "IN",
    balance: 4100000,
    createdAt: "2024-08-05T06:20:00.000Z",
    transactionCount: 160,
    riskScore: 90,
    isSuspicious: true,
    lastLoginCity: "Nagpur",
    lastLoginIP: "203.0.113.200",
    lastActive: "2026-03-30T08:55:30.000Z",
    fraudType: "rapid_transfer",
  },
  {
    id: "ACC012",
    name: "Kiran Reddy",
    type: "individual",
    bank: "ICICI",
    ifsc: "ICIC0002345",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pan: "FGHIJ9012K",
    phone: "+916665554443",
    ipAddress: "203.0.113.33",
    country: "IN",
    balance: 520000,
    createdAt: "2025-07-09T09:45:00.000Z",
    transactionCount: 58,
    riskScore: 62,
    isSuspicious: false,
  },
  {
    id: "ACC013",
    name: "Meerkast Shells",
    type: "shell",
    bank: "Axis",
    ifsc: "UTIB0003456",
    city: "Chandigarh",
    state: "Chandigarh",
    pan: "KLMNO3456P",
    phone: "+919876501234",
    ipAddress: "192.0.2.201",
    country: "IN",
    balance: 6900000,
    createdAt: "2024-11-30T12:10:00.000Z",
    transactionCount: 203,
    riskScore: 84,
    isSuspicious: true,
    lastLoginCity: "Pune",
    lastLoginIP: "192.0.2.91",
    lastActive: "2026-03-29T20:11:55.000Z",
    fraudType: "velocity",
  },
]

export const mockAccounts: Account[] = baseMockAccounts.map((account) => ({
  ...account,
  contactEmails: [...defaultContactEmails],
}))

export const mockTransactions: Transaction[] = [
  // Circular transaction loop (flagged)
  {
    id: "TXN001",
    from: "ACC003",
    to: "ACC007",
    amount: 98000,
    timestamp: "2026-04-03T11:50:00.000Z",
    riskScore: 86,
    status: "flagged",
    type: "NEFT",
    fromCity: "Bengaluru",
    fromCountry: "IN",
    toCity: "Ahmedabad",
    toCountry: "IN",
    fraudType: "circular_transaction",
  },
  {
    id: "TXN002",
    from: "ACC007",
    to: "ACC009",
    amount: 96500,
    timestamp: "2026-04-03T11:52:00.000Z",
    riskScore: 84,
    status: "flagged",
    type: "NEFT",
    fromCity: "Ahmedabad",
    fromCountry: "IN",
    toCity: "Jaipur",
    toCountry: "IN",
    fraudType: "circular_transaction",
  },
  {
    id: "TXN003",
    from: "ACC009",
    to: "ACC003",
    amount: 94000,
    timestamp: "2026-04-03T11:55:00.000Z",
    riskScore: 87,
    status: "flagged",
    type: "NEFT",
    fromCity: "Jaipur",
    fromCountry: "IN",
    toCity: "Bengaluru",
    toCountry: "IN",
    fraudType: "circular_transaction",
  },

  // Rapid transfer (suspicious + flagged)
  {
    id: "TXN004",
    from: "ACC011",
    to: "ACC004",
    amount: 42000,
    timestamp: "2026-04-03T11:44:00.000Z",
    riskScore: 82,
    status: "flagged",
    type: "IMPS",
    fromCity: "Surat",
    fromCountry: "IN",
    toCity: "Hyderabad",
    toCountry: "IN",
    fraudType: "rapid_transfer",
  },
  {
    id: "TXN005",
    from: "ACC011",
    to: "ACC005",
    amount: 50000,
    timestamp: "2026-04-03T11:46:00.000Z",
    riskScore: 78,
    status: "suspicious",
    type: "IMPS",
    fromCity: "Surat",
    fromCountry: "IN",
    toCity: "Pune",
    toCountry: "IN",
    fraudType: "rapid_transfer",
  },
  {
    id: "TXN006",
    from: "ACC011",
    to: "ACC001",
    amount: 36000,
    timestamp: "2026-04-03T11:48:00.000Z",
    riskScore: 75,
    status: "suspicious",
    type: "UPI",
    fromCity: "Surat",
    fromCountry: "IN",
    toCity: "Mumbai",
    toCountry: "IN",
    fraudType: "rapid_transfer",
  },
  {
    id: "TXN007",
    from: "ACC011",
    to: "ACC006",
    amount: 41000,
    timestamp: "2026-04-03T11:49:00.000Z",
    riskScore: 81,
    status: "flagged",
    type: "IMPS",
    fromCity: "Surat",
    fromCountry: "IN",
    toCity: "Chennai",
    toCountry: "IN",
    fraudType: "rapid_transfer",
  },

  // Structuring (multiple small UPI transfers below common threshold)
  {
    id: "TXN008",
    from: "ACC006",
    to: "ACC005",
    amount: 8900,
    timestamp: "2026-04-03T11:30:00.000Z",
    riskScore: 73,
    status: "suspicious",
    type: "UPI",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Pune",
    toCountry: "IN",
    fraudType: "structuring",
  },
  {
    id: "TXN009",
    from: "ACC006",
    to: "ACC005",
    amount: 9200,
    timestamp: "2026-04-03T11:31:30.000Z",
    riskScore: 70,
    status: "suspicious",
    type: "UPI",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Pune",
    toCountry: "IN",
    fraudType: "structuring",
  },
  {
    id: "TXN010",
    from: "ACC006",
    to: "ACC004",
    amount: 9700,
    timestamp: "2026-04-03T11:35:00.000Z",
    riskScore: 76,
    status: "suspicious",
    type: "UPI",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Hyderabad",
    toCountry: "IN",
    fraudType: "structuring",
  },
  {
    id: "TXN011",
    from: "ACC006",
    to: "ACC002",
    amount: 8800,
    timestamp: "2026-04-03T11:37:00.000Z",
    riskScore: 74,
    status: "suspicious",
    type: "UPI",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Delhi",
    toCountry: "IN",
    fraudType: "structuring",
  },
  {
    id: "TXN012",
    from: "ACC006",
    to: "ACC001",
    amount: 9400,
    timestamp: "2026-04-03T11:38:30.000Z",
    riskScore: 68,
    status: "suspicious",
    type: "UPI",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Mumbai",
    toCountry: "IN",
    fraudType: "structuring",
  },
  {
    id: "TXN013",
    from: "ACC006",
    to: "ACC003",
    amount: 9950,
    timestamp: "2026-04-03T11:40:00.000Z",
    riskScore: 79,
    status: "suspicious",
    type: "UPI",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Bengaluru",
    toCountry: "IN",
    fraudType: "structuring",
  },

  // Velocity (flagged + suspicious)
  {
    id: "TXN014",
    from: "ACC013",
    to: "ACC001",
    amount: 135000,
    timestamp: "2026-04-03T11:15:00.000Z",
    riskScore: 92,
    status: "flagged",
    type: "RTGS",
    fromCity: "Chandigarh",
    fromCountry: "IN",
    toCity: "Mumbai",
    toCountry: "IN",
    fraudType: "velocity",
  },
  {
    id: "TXN015",
    from: "ACC013",
    to: "ACC006",
    amount: 88000,
    timestamp: "2026-04-03T11:17:00.000Z",
    riskScore: 78,
    status: "suspicious",
    type: "RTGS",
    fromCity: "Chandigarh",
    fromCountry: "IN",
    toCity: "Chennai",
    toCountry: "IN",
    fraudType: "velocity",
  },
  {
    id: "TXN016",
    from: "ACC013",
    to: "ACC008",
    amount: 76000,
    timestamp: "2026-04-03T11:19:00.000Z",
    riskScore: 81,
    status: "flagged",
    type: "NEFT",
    fromCity: "Chandigarh",
    fromCountry: "IN",
    toCity: "Kolkata",
    toCountry: "IN",
    fraudType: "velocity",
  },

  // Dormant activation (flagged)
  {
    id: "TXN017",
    from: "ACC006",
    to: "ACC003",
    amount: 150000,
    timestamp: "2026-04-03T10:55:00.000Z",
    riskScore: 95,
    status: "flagged",
    type: "RTGS",
    fromCity: "Chennai",
    fromCountry: "IN",
    toCity: "Bengaluru",
    toCountry: "IN",
    fraudType: "dormant_activation",
  },

  // Impossible travel (flagged + suspicious)
  {
    id: "TXN018",
    from: "ACC001",
    to: "ACC008",
    amount: 62000,
    timestamp: "2026-04-03T11:25:00.000Z",
    riskScore: 87,
    status: "flagged",
    type: "UPI",
    fromCity: "Mumbai",
    fromCountry: "IN",
    toCity: "Kochi",
    toCountry: "IN",
    fraudType: "impossible_travel",
  },
  {
    id: "TXN019",
    from: "ACC001",
    to: "ACC002",
    amount: 24000,
    timestamp: "2026-04-03T11:27:00.000Z",
    riskScore: 55,
    status: "suspicious",
    type: "NEFT",
    fromCity: "Mumbai",
    fromCountry: "IN",
    toCity: "Delhi",
    toCountry: "IN",
    fraudType: "impossible_travel",
  },

  // Fan-out pattern (suspicious + flagged)
  {
    id: "TXN020",
    from: "ACC008",
    to: "ACC007",
    amount: 17000,
    timestamp: "2026-04-03T10:40:00.000Z",
    riskScore: 79,
    status: "suspicious",
    type: "UPI",
    fromCity: "Kolkata",
    fromCountry: "IN",
    toCity: "Ahmedabad",
    toCountry: "IN",
    fraudType: "fan_out",
  },
  {
    id: "TXN021",
    from: "ACC008",
    to: "ACC005",
    amount: 22000,
    timestamp: "2026-04-03T10:41:20.000Z",
    riskScore: 76,
    status: "suspicious",
    type: "UPI",
    fromCity: "Kolkata",
    fromCountry: "IN",
    toCity: "Pune",
    toCountry: "IN",
    fraudType: "fan_out",
  },
  {
    id: "TXN022",
    from: "ACC008",
    to: "ACC004",
    amount: 19500,
    timestamp: "2026-04-03T10:43:00.000Z",
    riskScore: 82,
    status: "flagged",
    type: "UPI",
    fromCity: "Kolkata",
    fromCountry: "IN",
    toCity: "Hyderabad",
    toCountry: "IN",
    fraudType: "fan_out",
  },
  {
    id: "TXN023",
    from: "ACC008",
    to: "ACC001",
    amount: 15000,
    timestamp: "2026-04-03T10:44:40.000Z",
    riskScore: 75,
    status: "suspicious",
    type: "IMPS",
    fromCity: "Kolkata",
    fromCountry: "IN",
    toCity: "Mumbai",
    toCountry: "IN",
    fraudType: "fan_out",
  },

  // Normal activity
  {
    id: "TXN024",
    from: "ACC002",
    to: "ACC010",
    amount: 8500,
    timestamp: "2026-04-03T11:10:00.000Z",
    riskScore: 18,
    status: "normal",
    type: "Card",
    fromCity: "Delhi",
    fromCountry: "IN",
    toCity: "Lucknow",
    toCountry: "IN",
  },
  {
    id: "TXN025",
    from: "ACC004",
    to: "ACC005",
    amount: 26000,
    timestamp: "2026-04-03T11:12:00.000Z",
    riskScore: 27,
    status: "normal",
    type: "IMPS",
    fromCity: "Hyderabad",
    fromCountry: "IN",
    toCity: "Pune",
    toCountry: "IN",
  },
  {
    id: "TXN026",
    from: "ACC007",
    to: "ACC009",
    amount: 41000,
    timestamp: "2026-04-03T11:05:00.000Z",
    riskScore: 23,
    status: "normal",
    type: "NEFT",
    fromCity: "Ahmedabad",
    fromCountry: "IN",
    toCity: "Jaipur",
    toCountry: "IN",
  },
]

export const mockAlerts: Alert[] = [
  {
    id: "ALT001",
    type: "circular_transaction",
    accountId: "ACC003",
    riskScore: 88,
    timestamp: "2026-04-03T11:56:30.000Z",
    status: "open",
    description: "Circular flow detected across three entities involving NEFT transfers.",
    amount: 288500,
    reasons: [
      "A->B->C->A fund loop observed in under 6 minutes",
      "Risk score consistently above 80 across linked transactions",
    ],
    fraudType: "circular_transaction",
  },
  {
    id: "ALT002",
    type: "circular_transaction",
    accountId: "ACC009",
    riskScore: 85,
    timestamp: "2026-04-03T11:54:10.000Z",
    status: "investigating",
    description: "High-risk circular money movement suggests layering behavior.",
    amount: 193500,
    reasons: [
      "Linked counterparties show rapid turnaround with matching amounts",
      "Re-inflow to the original account within minutes",
    ],
    fraudType: "circular_transaction",
  },
  {
    id: "ALT003",
    type: "circular_transaction",
    accountId: "ACC003",
    riskScore: 87,
    timestamp: "2026-04-03T11:57:05.000Z",
    status: "resolved",
    description: "Circular NEFT pattern resolved after beneficiary verification.",
    amount: 94000,
    reasons: [
      "Loop completion confirmed with matching directional flows",
      "Post-review cleared related compliance flags",
    ],
    fraudType: "circular_transaction",
  },

  {
    id: "ALT004",
    type: "rapid_transfer",
    accountId: "ACC011",
    riskScore: 82,
    timestamp: "2026-04-03T11:49:40.000Z",
    status: "open",
    description: "Burst transfers detected from a high-risk shell account via IMPS/UPI.",
    amount: 133000,
    reasons: [
      "Multiple transfers executed within a short time window",
      "Different beneficiaries received funds in quick succession",
    ],
    fraudType: "rapid_transfer",
  },
  {
    id: "ALT005",
    type: "rapid_transfer",
    accountId: "ACC011",
    riskScore: 78,
    timestamp: "2026-04-03T11:48:55.000Z",
    status: "investigating",
    description: "Rapid UPI/IMPS pattern suggests potential money mule operations.",
    amount: 86000,
    reasons: [
      "Consecutive outbound transfers with elevated risk scores",
      "Beneficiaries span multiple geographies",
    ],
    fraudType: "rapid_transfer",
  },
  {
    id: "ALT006",
    type: "structuring",
    accountId: "ACC006",
    riskScore: 79,
    timestamp: "2026-04-03T11:40:10.000Z",
    status: "open",
    description: "Structuring activity detected through repeated sub-threshold UPI payments.",
    amount: 52050,
    reasons: [
      "Multiple transfers clustered just below a common reporting threshold",
      "Sustained elevated risk across sequential transactions",
    ],
    fraudType: "structuring",
  },
  {
    id: "ALT007",
    type: "structuring",
    accountId: "ACC006",
    riskScore: 74,
    timestamp: "2026-04-03T11:38:20.000Z",
    status: "resolved",
    description: "Potential structuring behavior reviewed and closed for this sequence.",
    amount: 8800,
    reasons: [
      "Similar amounts sent across different beneficiaries within minutes",
      "Follow-up checks matched legitimate vendor payments",
    ],
    fraudType: "structuring",
  },

  {
    id: "ALT008",
    type: "velocity",
    accountId: "ACC013",
    riskScore: 92,
    timestamp: "2026-04-03T11:19:10.000Z",
    status: "open",
    description: "Velocity anomaly observed: unusually high-value transfers in a short period.",
    amount: 279000,
    reasons: [
      "Transfer values are far above typical account activity",
      "Multiple high-risk legs detected with minimal time gaps",
    ],
    fraudType: "velocity",
  },
  {
    id: "ALT009",
    type: "velocity",
    accountId: "ACC013",
    riskScore: 81,
    timestamp: "2026-04-03T11:18:20.000Z",
    status: "investigating",
    description: "High velocity NEFT leg indicates possible rapid layering.",
    amount: 76000,
    reasons: [
      "Elevated risk score on the NEFT transfer",
      "Unusual beneficiary pattern for this account profile",
    ],
    fraudType: "velocity",
  },

  {
    id: "ALT010",
    type: "dormant_activation",
    accountId: "ACC006",
    riskScore: 95,
    timestamp: "2026-04-03T10:56:00.000Z",
    status: "investigating",
    description: "Dormant account activated with a sudden high-value RTGS transfer.",
    amount: 150000,
    reasons: [
      "Account inactive for an extended period before this transfer",
      "Large single transaction with high-risk scoring",
    ],
    fraudType: "dormant_activation",
  },
  {
    id: "ALT011",
    type: "rapid_transfer",
    accountId: "ACC011",
    riskScore: 81,
    timestamp: "2026-04-03T11:49:00.000Z",
    status: "resolved",
    description: "Rapid transfer segment resolved after beneficiary screening.",
    amount: 41000,
    reasons: [
      "Linked burst transfer confirmed and reviewed",
      "No additional risk flags triggered post-screening",
    ],
    fraudType: "rapid_transfer",
  },
  {
    id: "ALT012",
    type: "velocity",
    accountId: "ACC013",
    riskScore: 78,
    timestamp: "2026-04-03T11:17:20.000Z",
    status: "resolved",
    description: "Velocity sequence closed after investigation of RTGS routing.",
    amount: 88000,
    reasons: [
      "Time-gap and value pattern matched prior watchlist behavior",
      "Routing resolved with supporting documentation",
    ],
    fraudType: "velocity",
  },
]

export const mockDashboardStats: DashboardStats = {
  totalTransactions: 15847,
  suspiciousTransactions: 234,
  highRiskAccounts: 8,
  fraudAlerts: 12,
  totalVolume: 48500000,
  avgRiskScore: 42,
}

// Chart data
const BASE_DATE_UTC = Date.UTC(2026, 3, 3) // Apr 03, 2026 (month is 0-based)
const formatChartDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })

const volumeValues = [820, 910, 780, 860, 940, 1050, 980, 1120, 980, 1060, 1170, 930, 1010, 1080, 1190]
const suspiciousValues = [12, 18, 14, 20, 26, 31, 28, 35, 29, 37, 44, 24, 30, 33, 41]

export const transactionVolumeData: Array<{
  date: string
  transactions: number
  suspicious: number
}> = Array.from({ length: 15 }).map((_, i) => {
  const offsetDays = 14 - i
  const d = new Date(BASE_DATE_UTC - offsetDays * 86400000)
  return {
    date: formatChartDate(d),
    transactions: volumeValues[i],
    suspicious: suspiciousValues[i],
  }
})

// Risk distribution by account risk score.
export const riskDistributionData: Array<{
  risk: string
  count: number
  fill: string
}> = [
  { risk: "Critical (>80)", count: 5, fill: "var(--chart-3)" },
  { risk: "High (60-80)", count: 2, fill: "var(--chart-5)" },
  { risk: "Medium (40-60)", count: 2, fill: "var(--chart-4)" },
  { risk: "Low (<40)", count: 4, fill: "var(--chart-2)" },
]

// Pie chart distribution for the dashboard.
export const fraudVsNormalData: Array<{
  name: string
  value: number
  fill: string
}> = [
  { name: "Normal", value: mockDashboardStats.totalTransactions - mockDashboardStats.suspiciousTransactions, fill: "var(--chart-2)" },
  { name: "Suspicious", value: 132, fill: "var(--chart-3)" },
  { name: "Flagged", value: 102, fill: "#ef4444" },
]

type GraphNode = {
  id: string
  position: { x: number; y: number }
  data: { label: string; account: Account }
  type: "accountNode"
}

type GraphEdge = {
  id: string
  source: string
  target: string
  label: string
  animated: boolean
  style: { stroke: string; strokeWidth: number }
  data: {
    amount: number
    status: TransactionStatus
    suspicious: boolean
    riskScore: number
  }
}

const accountById = Object.fromEntries(mockAccounts.map((a) => [a.id, a])) as Record<string, Account>

export const graphNodes: GraphNode[] = [
  { id: "ACC001", position: { x: 80, y: 80 }, data: { label: "Ravi Kumar", account: accountById.ACC001 }, type: "accountNode" },
  { id: "ACC003", position: { x: 280, y: 80 }, data: { label: "Tech Solutions Pvt Ltd", account: accountById.ACC003 }, type: "accountNode" },
  { id: "ACC007", position: { x: 480, y: 80 }, data: { label: "Suresh Patel", account: accountById.ACC007 }, type: "accountNode" },
  { id: "ACC009", position: { x: 680, y: 80 }, data: { label: "Vikram Joshi", account: accountById.ACC009 }, type: "accountNode" },
  { id: "ACC004", position: { x: 80, y: 260 }, data: { label: "Amit Singh", account: accountById.ACC004 }, type: "accountNode" },
  { id: "ACC005", position: { x: 280, y: 260 }, data: { label: "Neha Gupta", account: accountById.ACC005 }, type: "accountNode" },
  { id: "ACC006", position: { x: 480, y: 260 }, data: { label: "Global Logistics", account: accountById.ACC006 }, type: "accountNode" },
  { id: "ACC008", position: { x: 680, y: 260 }, data: { label: "Sunrise Traders", account: accountById.ACC008 }, type: "accountNode" },
  { id: "ACC011", position: { x: 180, y: 440 }, data: { label: "Apex Imports", account: accountById.ACC011 }, type: "accountNode" },
  { id: "ACC013", position: { x: 540, y: 440 }, data: { label: "Meerkast Shells", account: accountById.ACC013 }, type: "accountNode" },
]

export const graphEdges: GraphEdge[] = [
  // Circular chain edges (red)
  {
    id: "e1",
    source: "ACC003",
    target: "ACC007",
    label: formatINR(98000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 98000, status: "flagged", suspicious: true, riskScore: 86 },
  },
  {
    id: "e2",
    source: "ACC007",
    target: "ACC009",
    label: formatINR(96500),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 96500, status: "flagged", suspicious: true, riskScore: 84 },
  },
  {
    id: "e3",
    source: "ACC009",
    target: "ACC003",
    label: formatINR(94000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 94000, status: "flagged", suspicious: true, riskScore: 87 },
  },

  // Rapid transfer burst edges (red + amber)
  {
    id: "e4",
    source: "ACC011",
    target: "ACC004",
    label: formatINR(42000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 42000, status: "flagged", suspicious: true, riskScore: 82 },
  },
  {
    id: "e5",
    source: "ACC011",
    target: "ACC005",
    label: formatINR(50000),
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    data: { amount: 50000, status: "suspicious", suspicious: true, riskScore: 78 },
  },
  {
    id: "e6",
    source: "ACC011",
    target: "ACC001",
    label: formatINR(36000),
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    data: { amount: 36000, status: "suspicious", suspicious: true, riskScore: 75 },
  },
  {
    id: "e7",
    source: "ACC011",
    target: "ACC006",
    label: formatINR(41000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 41000, status: "flagged", suspicious: true, riskScore: 81 },
  },

  // Structuring + dormant activation edges (amber + red)
  {
    id: "e8",
    source: "ACC006",
    target: "ACC005",
    label: formatINR(8900),
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    data: { amount: 8900, status: "suspicious", suspicious: true, riskScore: 73 },
  },
  {
    id: "e9",
    source: "ACC006",
    target: "ACC001",
    label: formatINR(9400),
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    data: { amount: 9400, status: "suspicious", suspicious: true, riskScore: 68 },
  },
  {
    id: "e10",
    source: "ACC006",
    target: "ACC003",
    label: formatINR(150000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 150000, status: "flagged", suspicious: true, riskScore: 95 },
  },

  // Impossible travel + velocity edges (red)
  {
    id: "e11",
    source: "ACC001",
    target: "ACC008",
    label: formatINR(62000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 62000, status: "flagged", suspicious: true, riskScore: 87 },
  },
  {
    id: "e12",
    source: "ACC013",
    target: "ACC008",
    label: formatINR(76000),
    animated: true,
    style: { stroke: "#ef4444", strokeWidth: 2 },
    data: { amount: 76000, status: "flagged", suspicious: true, riskScore: 81 },
  },
]
