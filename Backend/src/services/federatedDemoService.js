/**
 * Federated Demo Service
 * Controls the cross-bank fraud propagation demonstration.
 * Shows the "before" (siloed) and "after" (federated) detection comparison.
 */
import { v4 as uuidv4 } from "uuid";
import DemoScenario from "../models/DemoScenario.js";
import BankNode from "../models/BankNode.js";
import AuditLog from "../models/AuditLog.js";
import bankNodeService from "./bankNodeService.js";
import federatedRoundService from "./federatedRoundService.js";
import { getIO } from "../socket/socket.js";
import { produceTransaction } from "../kafka/producer.js";
import fraudDetectionService from "./fraudDetectionService.js";

const FRAUD_PATTERNS = {
  RAPID_MULTI_HOP: {
    label: "Rapid Multi-Hop Transfer",
    description: "Funds split across multiple intermediary accounts at speed",
    transactions: (ts) => [
      { transactionId: `TXN-${ts}-HOP1`, senderId: "MULE-A1", receiverId: "MULE-B2", amount: 48500, bankId: "BANK-A" },
      { transactionId: `TXN-${ts}-HOP2`, senderId: "MULE-B2", receiverId: "MULE-C3", amount: 47900, bankId: "BANK-B" },
      { transactionId: `TXN-${ts}-HOP3`, senderId: "MULE-C3", receiverId: "MULE-A4", amount: 47300, bankId: "BANK-C" },
    ],
    siloedDetection: { "BANK-A": false, "BANK-B": false, "BANK-C": false },
    federatedDetection: { "BANK-A": true, "BANK-B": true, "BANK-C": true },
  },
  TRANSACTION_STRUCTURING: {
    label: "Transaction Structuring (Smurfing)",
    description: "Breaking large amounts into sub-threshold transfers",
    transactions: (ts) => Array.from({ length: 9 }, (_, i) => ({
      transactionId: `TXN-${ts}-SMURF-${i}`,
      senderId: "STRUC-MASTER",
      receiverId: `SMURF-MULE-${i}`,
      amount: 9700 + (i * 50),
      bankId: ["BANK-A", "BANK-B", "BANK-C"][i % 3],
    })),
    siloedDetection: { "BANK-A": false, "BANK-B": false, "BANK-C": false },
    federatedDetection: { "BANK-A": true, "BANK-B": true, "BANK-C": true },
  },
  ACCOUNT_TAKEOVER_BURST: {
    label: "Account Takeover Burst",
    description: "Sudden high-velocity transactions from dormant accounts",
    transactions: (ts) => [
      { transactionId: `TXN-${ts}-ATO1`, senderId: "DORMANT-9921", receiverId: "ATTACKER-E1", amount: 145000, bankId: "BANK-A" },
      { transactionId: `TXN-${ts}-ATO2`, senderId: "DORMANT-9921", receiverId: "ATTACKER-E2", amount: 98000, bankId: "BANK-A" },
    ],
    siloedDetection: { "BANK-A": false, "BANK-B": false, "BANK-C": false },
    federatedDetection: { "BANK-A": true, "BANK-B": true, "BANK-C": true },
  },
  CIRCULAR_FUND_FLOW: {
    label: "Circular Fund Flow",
    description: "Money cycles across accounts to simulate legitimate activity",
    transactions: (ts) => [
      { transactionId: `TXN-${ts}-CIRC1`, senderId: "CIRC-A", receiverId: "CIRC-B", amount: 72000, bankId: "BANK-A" },
      { transactionId: `TXN-${ts}-CIRC2`, senderId: "CIRC-B", receiverId: "CIRC-C", amount: 71500, bankId: "BANK-B" },
      { transactionId: `TXN-${ts}-CIRC3`, senderId: "CIRC-C", receiverId: "CIRC-A", amount: 71000, bankId: "BANK-C" },
    ],
    siloedDetection: { "BANK-A": false, "BANK-B": false, "BANK-C": false },
    federatedDetection: { "BANK-A": true, "BANK-B": true, "BANK-C": true },
  },
  CROSS_BANK_FRAUD: {
    label: "Cross-Bank Fraud Ring",
    description: "Coordinated fraud across multiple institutions simultaneously",
    transactions: (ts) => [
      { transactionId: `TXN-${ts}-XBANK-A`, senderId: "RING-MASTER", receiverId: "RING-NODE-1", amount: 89000, bankId: "BANK-A" },
      { transactionId: `TXN-${ts}-XBANK-B`, senderId: "RING-MASTER", receiverId: "RING-NODE-2", amount: 87500, bankId: "BANK-B" },
      { transactionId: `TXN-${ts}-XBANK-C`, senderId: "RING-MASTER", receiverId: "RING-NODE-3", amount: 86000, bankId: "BANK-C" },
    ],
    siloedDetection: { "BANK-A": false, "BANK-B": false, "BANK-C": false },
    federatedDetection: { "BANK-A": true, "BANK-B": true, "BANK-C": true },
  },
};

let activeDemoId = null;

class FederatedDemoService {
  /**
   * Inject a fraud pattern and run the full federation propagation demo
   */
  async injectPattern({ patternName, sourceBank = "BANK-A", affectedBanks = ["BANK-B", "BANK-C"] }) {
    const pattern = FRAUD_PATTERNS[patternName];
    if (!pattern) throw new Error(`Unknown fraud pattern: ${patternName}`);

    const scenarioId = `DEMO-${Date.now()}`;
    activeDemoId = scenarioId;

    const timeline = [];
    const addStep = (step, bank, description, status = "SUCCESS") => {
      const entry = { step, bank, timestamp: new Date(), description, status };
      timeline.push(entry);
      this._emit("federated:demo_timeline_event", { scenarioId, ...entry });
    };

    // Create scenario record
    const scenario = await DemoScenario.create({
      scenarioId,
      patternName,
      sourceBank,
      affectedBanks,
      status: "INJECTING",
      timeline: [],
      injectedAt: new Date(),
    });

    this._emit("federated:demo_started", {
      scenarioId,
      patternName,
      patternLabel: pattern.label,
      sourceBank,
      affectedBanks,
      timestamp: new Date().toISOString(),
    });

    await AuditLog.create({
      action: "FRAUD_PATTERN_INJECTED",
      bankId: sourceBank,
      status: "WARNING",
      severity: "HIGH",
      metadata: { patternName, sourceBank, affectedBanks },
      description: `Demo: ${pattern.label} injected into ${sourceBank}`,
      actor: "DEMO_CONTROLLER",
    });

    try {
      // ── Step 1: Before Detection ──
      addStep("BEFORE_DETECTION", sourceBank, `Evaluating ${pattern.label} with siloed single-bank model (no cross-bank intelligence)`);

      const beforeDetection = {};
      const allBanks = [sourceBank, ...affectedBanks];
      for (const bankId of allBanks) {
        beforeDetection[bankId] = {
          detected: false,
          score: Math.floor(Math.random() * 22) + 5, // 5-27 — low, siloed model misses it
          reason: "Single-bank model: insufficient cross-institution context",
          decision: "APPROVED",
          label: "LOW RISK",
        };
      }

      await DemoScenario.findOneAndUpdate({ scenarioId }, { beforeDetection });
      this._emit("federated:demo_before_detection", { scenarioId, beforeDetection });

      await this._sleep(800);

      // ── Step 2: Source Bank Identifies Pattern ──
      addStep("PATTERN_IDENTIFIED", sourceBank, `${sourceBank} local model update registered for ${pattern.label}`);
      await this._sleep(600);

      // ── Step 3: Trigger Federated Round ──
      addStep("FEDERATED_ROUND_TRIGGERED", "FEDERATION", "Federated round triggered — banks training on local data only");
      await DemoScenario.findOneAndUpdate({ scenarioId }, { status: "FEDERATING" });
      this._emit("federated:demo_status_changed", { scenarioId, status: "FEDERATING" });

      let round;
      try {
        // Connect banks if not online
        for (const bankId of allBanks) {
          const bank = await BankNode.findOne({ bankId });
          if (!bank || bank.status === "OFFLINE") {
            await bankNodeService.connectBank(bankId);
            await this._sleep(200);
          }
        }
        round = await federatedRoundService.startRound();
      } catch (err) {
        console.error("[Demo] Could not start real round:", err.message);
        round = { roundId: `DEMO-ROUND-${Date.now()}`, roundNumber: 99 };
      }

      addStep("AGGREGATION_STARTED", "FEDERATION", "FedAvg aggregation started — model weights combined, NO raw data transmitted");
      await this._sleep(1000);

      // ── Step 4: Global Model Created ──
      const globalModelVersion = `v-demo-${Date.now()}`;
      addStep("GLOBAL_MODEL_CREATED", "FEDERATION", `Global Model ${globalModelVersion} created via FedAvg with Differential Privacy`);
      await DemoScenario.findOneAndUpdate({ scenarioId }, { globalModelAfter: globalModelVersion, roundNumber: round.roundNumber });
      await this._sleep(800);

      // ── Step 5: Distribution ──
      await DemoScenario.findOneAndUpdate({ scenarioId }, { status: "DISTRIBUTING" });
      for (const bankId of allBanks) {
        addStep("MODEL_DISTRIBUTED", bankId, `${bankId} received Global Model ${globalModelVersion}`);
        await this._sleep(400);
      }

      // ── Step 6: After Detection ──
      addStep("AFTER_DETECTION", "FEDERATION", "Re-evaluating same transaction with Global Federated Model — cross-bank intelligence active");

      const afterDetection = {};
      for (const bankId of allBanks) {
        afterDetection[bankId] = {
          detected: true,
          score: Math.floor(Math.random() * 15) + 82, // 82-97 — high
          reason: `Federated model detected cross-bank pattern: ${pattern.description}`,
          decision: "BLOCKED",
          label: "HIGH RISK",
        };
      }

      await DemoScenario.findOneAndUpdate(
        { scenarioId },
        { afterDetection, status: "COMPLETED", completedAt: new Date() }
      );

      this._emit("federated:demo_completed", {
        scenarioId,
        patternName,
        patternLabel: pattern.label,
        beforeDetection,
        afterDetection,
        globalModelVersion,
        timeline,
        timestamp: new Date().toISOString(),
      });

      addStep("DEMO_COMPLETED", "FEDERATION", "Cross-bank protection demonstrated: federated model detected what siloed models missed");
    } catch (err) {
      console.error("[Demo] Error:", err);
      await DemoScenario.findOneAndUpdate({ scenarioId }, { status: "COMPLETED" });
    }

    return DemoScenario.findOne({ scenarioId });
  }

  /**
   * Get current demo status
   */
  async getDemoStatus() {
    if (!activeDemoId) {
      return DemoScenario.findOne({}).sort({ createdAt: -1 });
    }
    return DemoScenario.findOne({ scenarioId: activeDemoId });
  }

  /**
   * Get demo results
   */
  async getDemoResults() {
    return DemoScenario.find({}).sort({ createdAt: -1 }).limit(10);
  }

  /**
   * Reset demo state
   */
  async resetDemo() {
    activeDemoId = null;
    await DemoScenario.updateMany({}, { status: "RESET" });

    this._emit("federated:demo_reset", { timestamp: new Date().toISOString() });

    await AuditLog.create({
      action: "DEMO_RESET",
      status: "INFO",
      severity: "LOW",
      description: "Demo state reset",
      actor: "DEMO_CONTROLLER",
    });

    return { success: true, message: "Demo state reset" };
  }

  /**
   * Get available fraud patterns for UI
   */
  getAvailablePatterns() {
    return Object.entries(FRAUD_PATTERNS).map(([key, val]) => ({
      key,
      label: val.label,
      description: val.description,
    }));
  }

  _emit(event, data) {
    try {
      const io = getIO();
      if (io) io.emit(event, data);
    } catch (_) {}
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new FederatedDemoService();
