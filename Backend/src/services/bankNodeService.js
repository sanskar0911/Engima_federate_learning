/**
 * Bank Node Service
 * Manages the simulated bank nodes participating in the federated learning network.
 * Handles registration, heartbeats, status updates, and lifecycle events.
 */
import { bankRepo, auditRepo } from "./store.js";
import { getIO } from "../socket/socket.js";

// Default bank configurations from IBM Synthetic AML Dataset (HI-Small)
const DEFAULT_BANKS = [
  {
    bankId: "BANK-70",
    bankName: "Oasis Thrift",
    bankIdNum: 70,
    shortCode: "OAT",
    region: "US-North Central",
    nodeCsv: "federated_nodes/bank_1_node.csv",
    datasetSize: 449859,
    fraudCases: 633,
    fraudRate: 0.0014,
    federatedWeight: 0.620, // 62.0% of total network volume
    status: "ONLINE",
  },
  {
    bankId: "BANK-10",
    bankName: "National Bank of Laramie",
    bankIdNum: 10,
    shortCode: "NBL",
    region: "US-Mountain West",
    nodeCsv: "federated_nodes/bank_2_node.csv",
    datasetSize: 81629,
    fraudCases: 51,
    fraudRate: 0.00062,
    federatedWeight: 0.112, // 11.2% of total network volume
    status: "ONLINE",
  },
  {
    bankId: "BANK-12",
    bankName: "National Bank of the East",
    bankIdNum: 12,
    shortCode: "NBE",
    region: "US-Eastern Seaboard",
    nodeCsv: "federated_nodes/bank_3_node.csv",
    datasetSize: 79754,
    fraudCases: 76,
    fraudRate: 0.00095,
    federatedWeight: 0.110, // 11.0% of total network volume
    status: "ONLINE",
  },
  {
    bankId: "BANK-1",
    bankName: "Arbor Savings Bank",
    bankIdNum: 1,
    shortCode: "ASB",
    region: "US-Great Lakes",
    nodeCsv: "federated_nodes/bank_4_node.csv",
    datasetSize: 62211,
    fraudCases: 50,
    fraudRate: 0.00080,
    federatedWeight: 0.086, // 8.6% of total network volume
    status: "ONLINE",
  },
  {
    bankId: "BANK-15",
    bankName: "Japan Bank #0",
    bankIdNum: 15,
    shortCode: "JB0",
    region: "APAC Corridor",
    nodeCsv: "federated_nodes/bank_5_node.csv",
    datasetSize: 52511,
    fraudCases: 46,
    fraudRate: 0.00088,
    federatedWeight: 0.072, // 7.2% of total network volume
    status: "ONLINE",
  },
];


// In-memory heartbeat tracking
const heartbeats = new Map();

class BankNodeService {
  /**
   * Initialize default bank nodes if they don't exist
   */
  async initializeDefaultBanks() {
    for (const bankConfig of DEFAULT_BANKS) {
      const existing = await bankRepo.getById(bankConfig.bankId);
      if (!existing) {
        await bankRepo.create({ ...bankConfig });
        console.log(`✅ [BankNodeService] Initialized: ${bankConfig.bankId}`);
      }
    }
  }

  /**
   * Get all bank nodes
   */
  async getAllBanks() {
    return bankRepo.getAll();
  }

  /**
   * Get a specific bank by ID
   */
  async getBankById(bankId) {
    return bankRepo.getById(bankId);
  }

  /**
   * Connect a bank (simulate it coming online)
   */
  async connectBank(bankId, metadata = {}) {
    const bank = await bankRepo.update(bankId, {
      status: "ONLINE",
      lastSeen: new Date(),
      metadata: { ...metadata },
    });

    if (!bank) throw new Error(`Bank ${bankId} not found`);

    // Start heartbeat simulation
    this._startHeartbeat(bankId);

    // Emit socket event
    const io = getIO();
    if (io) {
      io.emit("federated:bank_connected", {
        bankId,
        bankName: bank.bankName,
        status: "ONLINE",
        timestamp: new Date().toISOString(),
      });
    }

    // Audit log
    await this._audit("BANK_CONNECTED", { bankId, resource: bankId });

    return bank;
  }

  /**
   * Disconnect a bank
   */
  async disconnectBank(bankId) {
    const bank = await bankRepo.update(bankId, {
      status: "OFFLINE",
      lastSeen: new Date(),
    });

    if (!bank) throw new Error(`Bank ${bankId} not found`);

    this._stopHeartbeat(bankId);

    const io = getIO();
    if (io) {
      io.emit("federated:bank_disconnected", {
        bankId,
        bankName: bank.bankName,
        status: "OFFLINE",
        timestamp: new Date().toISOString(),
      });
    }

    await this._audit("BANK_DISCONNECTED", { bankId, resource: bankId });
    return bank;
  }

  /**
   * Update bank status
   */
  async updateBankStatus(bankId, status, additionalFields = {}) {
    const bank = await bankRepo.update(bankId, {
      status,
      lastSeen: new Date(),
      ...additionalFields,
    });

    if (!bank) return null;

    const io = getIO();
    if (io) {
      io.emit("federated:bank_status_changed", {
        bankId,
        bankName: bank.bankName,
        status,
        timestamp: new Date().toISOString(),
        ...additionalFields,
      });
    }

    return bank;
  }

  /**
   * Update bank's model version after receiving global model
   */
  async acknowledgeModelUpdate(bankId, globalModelVersion) {
    return bankRepo.update(bankId, {
      currentModelVersion: globalModelVersion,
      status: "ONLINE",
      lastSeen: new Date(),
    });
  }

  /**
   * Get count of online banks
   */
  async getOnlineBankCount() {
    const banks = await bankRepo.getAll();
    return banks.filter((b) =>
      ["ONLINE", "TRAINING", "UPLOADING", "AGGREGATING", "UPDATING"].includes(b.status)
    ).length;
  }

  /**
   * Simulate bank failure during a round
   */
  async simulateBankFailure(bankId, roundId) {
    await this.updateBankStatus(bankId, "ERROR", {
      trainingStatus: "FAILED",
      metadata: { failedRound: roundId, failedAt: new Date() },
    });

    await this._audit("BANK_FAILED", {
      bankId,
      roundId,
      resource: bankId,
      status: "FAILURE",
      severity: "HIGH",
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  _startHeartbeat(bankId) {
    if (heartbeats.has(bankId)) return;
    const interval = setInterval(async () => {
      try {
        await bankRepo.update(bankId, { lastSeen: new Date() });
      } catch (_) {}
    }, 15000);
    heartbeats.set(bankId, interval);
  }

  _stopHeartbeat(bankId) {
    const interval = heartbeats.get(bankId);
    if (interval) {
      clearInterval(interval);
      heartbeats.delete(bankId);
    }
  }

  async _audit(action, { bankId, roundId, resource, status = "INFO", severity = "LOW", metadata = {} } = {}) {
    try {
      await auditRepo.create({
        action,
        bankId: bankId || null,
        roundId: roundId || null,
        resource: resource || null,
        status,
        severity,
        metadata,
        actor: "SYSTEM",
        description: `${action} - Bank: ${bankId || "N/A"}`,
      });
    } catch (_) {}
  }
}

export default new BankNodeService();
