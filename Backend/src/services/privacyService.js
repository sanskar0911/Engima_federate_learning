/**
 * Privacy Service
 * Tracks all data transfer events in the federated network.
 * Ensures raw transaction data and PII are never transferred to the aggregator.
 * Maintains a full audit trail of allowed vs. blocked transfers.
 */
import { privacyRepo, auditRepo } from "./store.js";
import { getIO } from "../socket/socket.js";

// Transfer types that are ALWAYS blocked in federated learning
const BLOCKED_TRANSFER_TYPES = ["RAW_TRANSACTION_DATA", "PII_DATA"];

class PrivacyService {
  /**
   * Record a data transfer event
   * Automatically blocks forbidden transfer types
   */
  async recordTransfer({
    source,
    destination,
    transferType,
    payloadType = null,
    size = 0,
    roundId = null,
    bankId = null,
    metadata = {},
  }) {
    const allowed = !BLOCKED_TRANSFER_TYPES.includes(transferType);
    const reason = allowed
      ? "Federated learning model update — raw data remains within bank perimeter"
      : `BLOCKED: ${transferType} must not leave bank perimeter (DPDP Act compliance)`;

    const event = await privacyRepo.create({
      source,
      destination,
      transferType,
      payloadType,
      size: allowed ? size : 0,
      allowed,
      reason,
      roundId,
      bankId,
      metadata,
      timestamp: new Date(),
    });

    // If blocked, emit privacy alert
    const io = getIO();
    if (io) {
      io.emit("privacy:transfer_event", {
        id: event._id ? event._id.toString() : String(Date.now()),
        source,
        destination,
        transferType,
        size: event.size,
        allowed,
        reason,
        timestamp: (event.timestamp instanceof Date ? event.timestamp : new Date()).toISOString(),
        roundId,
        bankId,
      });
    }

    if (!allowed) {
      await auditRepo.create({
        action: "PRIVACY_TRANSFER_BLOCKED",
        bankId: bankId || null,
        roundId: roundId || null,
        status: "WARNING",
        severity: "HIGH",
        metadata: { source, destination, transferType },
        description: `Privacy violation blocked: ${transferType} from ${source} to ${destination}`,
        actor: "PRIVACY_GUARD",
      });
    } else {
      await auditRepo.create({
        action: "PRIVACY_TRANSFER_ALLOWED",
        bankId: bankId || null,
        roundId: roundId || null,
        status: "SUCCESS",
        severity: "LOW",
        metadata: { source, destination, transferType, size },
        description: `Allowed transfer: ${transferType} from ${source} to ${destination}`,
        actor: "PRIVACY_GUARD",
      });
    }

    return event;
  }

  /**
   * Simulate a blocked raw data transfer attempt (for demo purposes)
   */
  async simulateBlockedTransfer(bankId, roundId = null) {
    return this.recordTransfer({
      source: bankId,
      destination: "AGGREGATOR",
      transferType: "RAW_TRANSACTION_DATA",
      payloadType: "TRANSACTION_RECORDS",
      size: 0,
      roundId,
      bankId,
      metadata: { simulated: true, blockedAt: new Date() },
    });
  }

  /**
   * Record an allowed model update transfer
   */
  async recordModelUpdateTransfer(bankId, roundId, updateSizeBytes) {
    return this.recordTransfer({
      source: bankId,
      destination: "AGGREGATOR",
      transferType: "MODEL_UPDATE",
      payloadType: "GRADIENT_WEIGHTS_DP",
      size: updateSizeBytes,
      roundId,
      bankId,
      metadata: { dpApplied: true },
    });
  }

  /**
   * Record global model distribution transfer
   */
  async recordModelDistributionTransfer(bankId, roundId, modelVersion, sizeBytes) {
    return this.recordTransfer({
      source: "AGGREGATOR",
      destination: bankId,
      transferType: "GLOBAL_MODEL",
      payloadType: "AGGREGATED_WEIGHTS",
      size: sizeBytes,
      roundId,
      bankId,
      metadata: { modelVersion },
    });
  }

  /**
   * Get privacy summary stats
   */
  async getSummary() {
    return privacyRepo.getSummary();
  }

  /**
   * Get recent privacy events
   */
  async getRecentEvents(limit = 50) {
    return privacyRepo.getEvents(limit);
  }

  /**
   * Get privacy events for a specific round
   */
  async getEventsByRound(roundId) {
    return privacyRepo.getByRound(roundId);
  }
}

export default new PrivacyService();
