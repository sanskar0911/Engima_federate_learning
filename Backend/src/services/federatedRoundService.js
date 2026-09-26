/**
 * Federated Round Service
 * Orchestrates the complete lifecycle of each federated learning round:
 * WAITING → COLLECTING → AGGREGATING → DISTRIBUTING → COMPLETED
 *
 * IMPORTANT: This service orchestrates the round lifecycle only.
 * It does NOT implement the ML training algorithm — that runs in the ML/ Python layer.
 * The backend simply coordinates metadata, events, and state transitions.
 */
import { roundRepo, modelRepo, updateRepo, bankRepo, auditRepo } from "./store.js";
import bankNodeService from "./bankNodeService.js";
import privacyService from "./privacyService.js";
import datasetService from "./datasetService.js";
import { getIO } from "../socket/socket.js";

// Simulated per-bank training duration range (ms)
const TRAINING_DURATION_MS = { min: 1200, max: 3500 };
const AGGREGATION_DURATION_MS = 2000;
const DISTRIBUTION_DURATION_MS = 1500;

// Per-round accuracy improvement simulation
const BASE_ACCURACY = 0.62;
const ACCURACY_PER_ROUND = 0.055;
const MAX_ACCURACY = 0.968;

let currentRoundLock = false; // prevent concurrent rounds

class FederatedRoundService {
  /**
   * Start a new federated round
   */
  async startRound(options = {}) {
    if (currentRoundLock) {
      throw new Error("A federated round is already in progress");
    }

    // Get online banks
    const allBanks = await bankRepo.getAll();
    const onlineBanks = allBanks.filter((b) =>
      ["ONLINE", "TRAINING", "UPLOADING", "UPDATING"].includes(b.status)
    );

    if (onlineBanks.length === 0) {
      throw new Error("No banks are online. Connect at least one bank first.");
    }

    // Find current round number
    const lastRound = await roundRepo.getLastRound();
    const roundNumber = (lastRound?.roundNumber || 0) + 1;
    const roundId = `ROUND-${roundNumber}-${Date.now()}`;

    const participatingBanks = onlineBanks.map((b) => b.bankId);

    // Create round record
    const round = await roundRepo.create({
      roundId,
      roundNumber,
      status: "WAITING",
      expectedBanks: participatingBanks,
      participatingBanks,
      receivedUpdates: [],
      startedAt: new Date(),
      timeline: [
        {
          event: "ROUND_STARTED",
          timestamp: new Date(),
          description: `Round ${roundNumber} started with ${participatingBanks.length} participating banks`,
          status: "SUCCESS",
        },
      ],
    });

    // Emit round started event
    this._emit("federated:round_started", {
      roundId,
      roundNumber,
      participatingBanks,
      expectedBanks: participatingBanks,
      status: "WAITING",
      timestamp: new Date().toISOString(),
    });

    await this._audit("FEDERATION_ROUND_STARTED", {
      roundId,
      metadata: { roundNumber, banks: participatingBanks },
    });

    // Run the round lifecycle asynchronously
    this._runRoundLifecycle(round, onlineBanks).catch((err) => {
      console.error(`[FederatedRound] Round ${roundId} failed:`, err);
    });

    return round;
  }

  /**
   * Stop an in-progress round
   */
  async stopRound(roundId) {
    const round = await roundRepo.update(roundId, {
      status: "FAILED",
      completedAt: new Date(),
    });

    if (!round) return null;

    currentRoundLock = false;
    this._emit("federated:round_failed", { roundId, reason: "Manually stopped" });
    return round;
  }

  /**
   * Get all rounds
   */
  async getRounds(limit = 20) {
    return roundRepo.getAll(limit);
  }

  /**
   * Get current (most recent in-progress) round
   */
  async getCurrentRound() {
    return roundRepo.getCurrent();
  }

  /**
   * Get a specific round by ID
   */
  async getRoundById(roundId) {
    return roundRepo.getById(roundId);
  }

  // ─── Private lifecycle ────────────────────────────────────────────────────

  async _runRoundLifecycle(round, onlineBanks) {
    currentRoundLock = true;
    const { roundId, roundNumber } = round;

    try {
      // ── Phase 1: COLLECTING ──────────────────────────────────────────────
      await this._updateRoundStatus(roundId, "COLLECTING", {
        event: "COLLECTING_STARTED",
        description: "Collecting model updates from all participating banks",
      });

      // Simulate each bank training locally and submitting update
      const updatePromises = onlineBanks.map((bank) =>
        this._simulateBankTraining(bank, roundId, roundNumber)
      );

      const updates = await Promise.allSettled(updatePromises);
      const successfulUpdates = updates
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => r.value);

      const receivedBankIds = successfulUpdates.map((u) => u.bankId);

      // Update round with received updates
      await roundRepo.update(roundId, { receivedUpdates: receivedBankIds });

      this._emit("federated:all_updates_received", {
        roundId,
        roundNumber,
        receivedFrom: receivedBankIds,
        timestamp: new Date().toISOString(),
      });

      await this._addTimelineEvent(roundId, {
        event: "ALL_UPDATES_RECEIVED",
        description: `Received model updates from ${receivedBankIds.length} banks: ${receivedBankIds.join(", ")}`,
        status: "SUCCESS",
      });

      // ── Phase 2: AGGREGATING ─────────────────────────────────────────────
      const aggStarted = new Date();
      await this._updateRoundStatus(roundId, "AGGREGATING", {
        event: "AGGREGATION_STARTED",
        description: "FedAvg aggregation started — combining differentially private model updates",
      });

      await roundRepo.update(roundId, { aggregationStartedAt: aggStarted });

      this._emit("federated:aggregation_started", {
        roundId,
        roundNumber,
        updatesCount: successfulUpdates.length,
        aggregationMethod: "FedAvg",
        timestamp: aggStarted.toISOString(),
      });

      await this._audit("AGGREGATION_STARTED", { roundId, metadata: { updates: successfulUpdates.length } });

      // Simulate aggregation duration
      await this._sleep(AGGREGATION_DURATION_MS);

      // Create global model
      const globalModel = await this._createGlobalModel(roundId, roundNumber, successfulUpdates, onlineBanks);

      const aggCompleted = new Date();
      await roundRepo.update(roundId, {
        aggregationCompletedAt: aggCompleted,
        globalModelVersion: globalModel.version,
      });

      await this._addTimelineEvent(roundId, {
        event: "GLOBAL_MODEL_CREATED",
        description: `Global Model ${globalModel.version} created via FedAvg`,
        status: "SUCCESS",
      });

      this._emit("federated:aggregation_completed", {
        roundId,
        roundNumber,
        globalModelVersion: globalModel.version,
        accuracy: globalModel.accuracy,
        loss: globalModel.loss,
        timestamp: aggCompleted.toISOString(),
      });

      await this._audit("AGGREGATION_COMPLETED", {
        roundId,
        modelVersion: globalModel.version,
        metadata: { accuracy: globalModel.accuracy },
      });

      // ── Phase 3: DISTRIBUTING ────────────────────────────────────────────
      await this._updateRoundStatus(roundId, "DISTRIBUTING", {
        event: "DISTRIBUTION_STARTED",
        description: "Distributing global model to all participating banks",
      });

      this._emit("federated:model_distribution_started", {
        roundId,
        roundNumber,
        globalModelVersion: globalModel.version,
        banks: receivedBankIds,
        timestamp: new Date().toISOString(),
      });

      // Distribute to each bank
      await this._distributeGlobalModel(globalModel, onlineBanks, roundId);

      // ── Phase 4: COMPLETED ───────────────────────────────────────────────
      const completedAt = new Date();
      const duration = completedAt - (round.startedAt instanceof Date ? round.startedAt : new Date());

      await roundRepo.update(roundId, {
        status: "COMPLETED",
        completedAt,
        duration,
      });

      await this._addTimelineEvent(roundId, {
        event: "ROUND_COMPLETED",
        description: `Round ${roundNumber} completed in ${Math.round(duration / 1000)}s. Global Model: ${globalModel.version}`,
        status: "SUCCESS",
      });

      this._emit("federated:round_completed", {
        roundId,
        roundNumber,
        globalModelVersion: globalModel.version,
        duration,
        accuracy: globalModel.accuracy,
        participatingBanks: receivedBankIds,
        timestamp: completedAt.toISOString(),
      });

      await this._audit("FEDERATION_ROUND_COMPLETED", {
        roundId,
        modelVersion: globalModel.version,
        metadata: { duration, accuracy: globalModel.accuracy },
        status: "SUCCESS",
        severity: "LOW",
      });

      // Update participating banks' round number
      for (const bank of onlineBanks) {
        await bankRepo.update(bank.bankId, { lastRound: roundNumber });
      }
    } catch (err) {
      console.error(`[FederatedRound] Error in round ${roundId}:`, err);
      await roundRepo.update(roundId, {
        status: "FAILED",
        completedAt: new Date(),
        error: err.message,
      });
      this._emit("federated:error", { roundId, error: err.message });

      await this._audit("FEDERATION_ROUND_FAILED", {
        roundId,
        status: "FAILURE",
        severity: "HIGH",
        metadata: { error: err.message },
      });
    } finally {
      currentRoundLock = false;
    }
  }

  async _simulateBankTraining(bank, roundId, roundNumber) {
    const { bankId } = bank;

    try {
      // Set bank to TRAINING state
      await bankNodeService.updateBankStatus(bankId, "TRAINING", {
        trainingStatus: "IN_PROGRESS",
        localModelVersion: `local-${roundNumber}-${bankId}`,
      });

      this._emit("federated:bank_training", {
        roundId,
        bankId,
        bankName: bank.bankName,
        status: "TRAINING",
        timestamp: new Date().toISOString(),
      });

      // Simulate variable training duration
      const duration =
        TRAINING_DURATION_MS.min +
        Math.random() * (TRAINING_DURATION_MS.max - TRAINING_DURATION_MS.min);
      await this._sleep(duration);

      // Record privacy event: model update only (not raw data)
      const updateSizeKB = 32 + Math.random() * 20; // 32-52 KB
      await privacyService.recordModelUpdateTransfer(bankId, roundId, Math.round(updateSizeKB * 1024));

      // Simulate a blocked raw data transfer attempt (for the privacy demo)
      await privacyService.simulateBlockedTransfer(bankId, roundId);

      // Set to UPLOADING
      await bankNodeService.updateBankStatus(bankId, "UPLOADING", {
        trainingStatus: "UPLOADING",
      });

      // Register model update derived from bank dataset partition
      const updateId = `UPD-${roundId}-${bankId}`;
      const localEval = datasetService.evaluateLocalRound(bankId, roundNumber);

      const modelUpdate = await updateRepo.create({
        updateId,
        roundId,
        bankId,
        modelVersion: `local-${roundNumber}-${bankId}`,
        parameterCount: localEval.parameterCount || 18562, // MLP param count from model.py
        updateSize: Math.round(updateSizeKB * 1024),
        receivedAt: new Date(),
        status: "VALIDATED",
        checksum: this._generateChecksum(updateId),
        trainingExamples: localEval.datasetSize,
        trainingDuration: Math.round(duration),
        privacyStatus: "DP_APPLIED",
        accuracy: localEval.accuracy,
        loss: localEval.loss,
        epsilon: localEval.epsilonUsed,
        rawDataIncluded: false,
      });

      this._emit("federated:update_received", {
        roundId,
        bankId,
        bankName: bank.bankName,
        updateId,
        modelVersion: modelUpdate.modelVersion,
        updateSizeKB: parseFloat(updateSizeKB.toFixed(1)),
        accuracy: modelUpdate.accuracy,
        status: "UPDATE_RECEIVED",
        timestamp: new Date().toISOString(),
      });

      await this._addTimelineEvent(roundId, {
        event: "UPDATE_RECEIVED",
        bankId,
        description: `${bank.bankName} model update received (${parseFloat(updateSizeKB.toFixed(1))} KB, DP applied)`,
        status: "SUCCESS",
      });

      return { bankId, updateId, accuracy: modelUpdate.accuracy, loss: modelUpdate.loss, examples: modelUpdate.trainingExamples };
    } catch (err) {
      console.error(`[FederatedRound] Bank ${bankId} training failed:`, err);
      await bankNodeService.simulateBankFailure(bankId, roundId);
      await this._addTimelineEvent(roundId, {
        event: "BANK_FAILED",
        bankId,
        description: `${bank.bankName} failed during training: ${err.message}`,
        status: "FAILURE",
      });
      return null;
    }
  }

  async _createGlobalModel(roundId, roundNumber, updates, banks) {
    const lastModel = await modelRepo.getCurrent();
    const versionNum = (lastModel?.roundNumber || 0) + 1;
    const version = `v${versionNum}.0.0`;

    // FedAvg: weighted average accuracy
    const totalExamples = updates.reduce((s, u) => s + (u.examples || 1000), 0);
    const weightedAccuracy = updates.reduce(
      (s, u) => s + (u.accuracy || 0.75) * ((u.examples || 1000) / totalExamples),
      0
    );
    const weightedLoss = updates.reduce(
      (s, u) => s + (u.loss || 0.3) * ((u.examples || 1000) / totalExamples),
      0
    );

    const modelSizeKB = 42 + Math.random() * 15;
    const distStatus = {};
    banks.forEach((b) => { distStatus[b.bankId] = "PENDING"; });

    const globalModel = await modelRepo.create({
      version,
      roundId,
      roundNumber,
      participatingBanks: updates.map((u) => u.bankId),
      totalUpdates: updates.length,
      aggregationMethod: "FedAvg",
      status: "READY",
      modelSize: Math.round(modelSizeKB * 1024),
      checksum: this._generateChecksum(version),
      previousVersion: lastModel?.version || null,
      accuracy: parseFloat(weightedAccuracy.toFixed(4)),
      loss: parseFloat(weightedLoss.toFixed(4)),
      epsilon: parseFloat((1.0 + roundNumber * 0.06).toFixed(2)),
      distributionStatus: distStatus,
      isCurrent: true,
    });

    this._emit("federated:model_created", {
      version,
      roundId,
      roundNumber,
      accuracy: globalModel.accuracy,
      loss: globalModel.loss,
      modelSizeKB: parseFloat(modelSizeKB.toFixed(1)),
      aggregationMethod: "FedAvg",
      participatingBanks: globalModel.participatingBanks,
      timestamp: new Date().toISOString(),
    });

    await this._audit("GLOBAL_MODEL_CREATED", {
      roundId,
      modelVersion: version,
      metadata: { accuracy: globalModel.accuracy, banks: globalModel.participatingBanks },
      status: "SUCCESS",
      severity: "LOW",
    });

    return globalModel;
  }

  async _distributeGlobalModel(globalModel, banks, roundId) {
    for (const bank of banks) {
      const { bankId } = bank;
      try {
        await bankNodeService.updateBankStatus(bankId, "UPDATING", {
          trainingStatus: "RECEIVING_MODEL",
        });

        // Record privacy event for distribution
        await privacyService.recordModelDistributionTransfer(
          bankId, roundId, globalModel.version, globalModel.modelSize
        );

        // Simulate distribution delay
        await this._sleep(DISTRIBUTION_DURATION_MS + Math.random() * 500);

        // Acknowledge
        await bankNodeService.acknowledgeModelUpdate(bankId, globalModel.version);

        // Update distribution status
        await modelRepo.update(globalModel.version, {
          [`distributionStatus.${bankId}`]: "ACKNOWLEDGED",
        });

        this._emit("federated:model_received", {
          roundId,
          bankId,
          bankName: bank.bankName,
          globalModelVersion: globalModel.version,
          status: "ACKNOWLEDGED",
          timestamp: new Date().toISOString(),
        });

        await this._addTimelineEvent(roundId, {
          event: "MODEL_DISTRIBUTED",
          bankId,
          description: `${bank.bankName} acknowledged Global Model ${globalModel.version}`,
          status: "SUCCESS",
        });

        await this._audit("MODEL_DISTRIBUTED", {
          roundId,
          bankId,
          modelVersion: globalModel.version,
          status: "SUCCESS",
          severity: "LOW",
        });
      } catch (err) {
        console.error(`[FederatedRound] Distribution to ${bankId} failed:`, err);
        await modelRepo.update(globalModel.version, {
          [`distributionStatus.${bankId}`]: "FAILED",
        });
        this._emit("federated:error", {
          roundId,
          bankId,
          error: `Distribution failed: ${err.message}`,
        });
      }
    }

    await modelRepo.update(globalModel.version, { status: "DISTRIBUTED" });
  }

  async _updateRoundStatus(roundId, status, timelineEvent) {
    await roundRepo.update(roundId, { status });
    await this._addTimelineEvent(roundId, { ...timelineEvent, status: status });
    this._emit("federated:round_status_changed", {
      roundId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  async _addTimelineEvent(roundId, { event, bankId = null, description, status }) {
    await roundRepo.update(roundId, {
      $push: {
        timeline: {
          event,
          bankId,
          timestamp: new Date(),
          description,
          status,
        },
      },
    });
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

  _generateChecksum(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  async _audit(action, { roundId, modelVersion, bankId, metadata = {}, status = "INFO", severity = "LOW" } = {}) {
    try {
      await auditRepo.create({
        action,
        roundId: roundId || null,
        bankId: bankId || null,
        modelVersion: modelVersion || null,
        status,
        severity,
        metadata,
        actor: "FEDERATION_COORDINATOR",
        description: `${action} - Round: ${roundId || "N/A"}`,
      });
    } catch (_) {}
  }
}

export default new FederatedRoundService();
