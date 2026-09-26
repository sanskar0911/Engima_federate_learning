/**
 * Federated Controller
 * REST API handlers for all federated learning endpoints.
 */
import bankNodeService from "../services/bankNodeService.js";
import federatedRoundService from "../services/federatedRoundService.js";
import federatedDemoService from "../services/federatedDemoService.js";
import privacyService from "../services/privacyService.js";
import datasetService from "../services/datasetService.js";
import { updateRepo, modelRepo, bankRepo, auditRepo } from "../services/store.js";

// ─── Dataset APIs ────────────────────────────────────────────────────────────

export const getDatasetSummary = async (req, res) => {
  try {
    const summary = datasetService.getSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDatasetSample = async (req, res) => {
  try {
    const { bankId = "BANK-A", count = 20, isFraud } = req.query;
    const filter = {};
    if (isFraud !== undefined) filter.isFraud = isFraud === "true" || isFraud === "1";
    const samples = datasetService.sampleRecords(bankId, parseInt(count), filter);
    res.json({ success: true, data: samples, count: samples.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Bank Node APIs ──────────────────────────────────────────────────────────

export const getAllBanks = async (req, res) => {
  try {
    const banks = await bankNodeService.getAllBanks();
    res.json({ success: true, data: banks, count: banks.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getBankById = async (req, res) => {
  try {
    const bank = await bankNodeService.getBankById(req.params.bankId);
    if (!bank) return res.status(404).json({ success: false, error: "Bank not found" });
    res.json({ success: true, data: bank });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const connectBank = async (req, res) => {
  try {
    const bank = await bankNodeService.connectBank(req.params.bankId, req.body);
    res.json({ success: true, data: bank, message: `${bank.bankName} connected successfully` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const disconnectBank = async (req, res) => {
  try {
    const bank = await bankNodeService.disconnectBank(req.params.bankId);
    res.json({ success: true, data: bank, message: `${bank.bankName} disconnected` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const connectAllBanks = async (req, res) => {
  try {
    const banks = await bankNodeService.getAllBanks();
    const results = [];
    for (const bank of banks) {
      try {
        await bankNodeService.connectBank(bank.bankId);
        results.push({ bankId: bank.bankId, success: true });
      } catch (e) {
        results.push({ bankId: bank.bankId, success: false, error: e.message });
      }
    }
    res.json({ success: true, results, message: "All banks connection attempted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Federated Round APIs ────────────────────────────────────────────────────

export const startRound = async (req, res) => {
  try {
    const round = await federatedRoundService.startRound(req.body || {});
    res.status(201).json({
      success: true,
      data: round,
      message: `Federated Round ${round.roundNumber} started`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const stopRound = async (req, res) => {
  try {
    const round = await federatedRoundService.stopRound(req.params.roundId);
    if (!round) return res.status(404).json({ success: false, error: "Round not found or already completed" });
    res.json({ success: true, data: round });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRounds = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const rounds = await federatedRoundService.getRounds(limit);
    res.json({ success: true, data: rounds, count: rounds.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCurrentRound = async (req, res) => {
  try {
    const round = await federatedRoundService.getCurrentRound();
    res.json({ success: true, data: round });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRoundById = async (req, res) => {
  try {
    const round = await federatedRoundService.getRoundById(req.params.roundId);
    if (!round) return res.status(404).json({ success: false, error: "Round not found" });
    res.json({ success: true, data: round });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Model Update APIs ───────────────────────────────────────────────────────

export const getModelUpdates = async (req, res) => {
  try {
    const { roundId, bankId, status } = req.query;
    const filter = {};
    if (roundId) filter.roundId = roundId;
    if (bankId) filter.bankId = bankId;
    if (status) filter.status = status;

    const updates = await updateRepo.getByQuery(filter);
    res.json({ success: true, data: updates, count: updates.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getModelUpdatesByRound = async (req, res) => {
  try {
    const updates = await updateRepo.getByQuery({ roundId: req.params.roundId });
    res.json({ success: true, data: updates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const registerModelUpdate = async (req, res) => {
  try {
    const update = await updateRepo.create({
      ...req.body,
      rawDataIncluded: false,
    });
    res.status(201).json({ success: true, data: update });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─── Global Model APIs ───────────────────────────────────────────────────────

export const getGlobalModels = async (req, res) => {
  try {
    const models = await modelRepo.getAll();
    res.json({ success: true, data: models, count: models.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCurrentGlobalModel = async (req, res) => {
  try {
    const model = await modelRepo.getCurrent();
    res.json({ success: true, data: model });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getGlobalModelByVersion = async (req, res) => {
  try {
    const model = await modelRepo.getByVersion(req.params.version);
    if (!model) return res.status(404).json({ success: false, error: "Model version not found" });
    res.json({ success: true, data: model });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getModelDistribution = async (req, res) => {
  try {
    const model = await modelRepo.getByVersion(req.params.version);
    if (!model) return res.status(404).json({ success: false, error: "Model not found" });

    const distribution = [];
    if (model.distributionStatus) {
      if (model.distributionStatus instanceof Map) {
        for (const [bankId, status] of model.distributionStatus.entries()) {
          distribution.push({ bankId, status });
        }
      } else {
        for (const [bankId, status] of Object.entries(model.distributionStatus)) {
          distribution.push({ bankId, status });
        }
      }
    }

    res.json({ success: true, data: { model, distribution } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Privacy APIs ────────────────────────────────────────────────────────────

export const getPrivacySummary = async (req, res) => {
  try {
    const summary = await privacyService.getSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPrivacyEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = await privacyService.getRecentEvents(limit);
    res.json({ success: true, data: events, count: events.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPrivacyEventsByRound = async (req, res) => {
  try {
    const events = await privacyService.getEventsByRound(req.params.roundId);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Demo APIs ───────────────────────────────────────────────────────────────

export const injectFraudPattern = async (req, res) => {
  try {
    const { patternName, sourceBank, affectedBanks } = req.body;
    if (!patternName) return res.status(400).json({ success: false, error: "patternName required" });

    // Run async — return immediately
    res.json({
      success: true,
      message: `Fraud pattern '${patternName}' injection initiated`,
    });

    // Run the full demo asynchronously
    federatedDemoService.injectPattern({ patternName, sourceBank, affectedBanks }).catch(console.error);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const runPropagation = async (req, res) => {
  try {
    res.json({ success: true, message: "Propagation demo triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDemoStatus = async (req, res) => {
  try {
    const status = await federatedDemoService.getDemoStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDemoResults = async (req, res) => {
  try {
    const results = await federatedDemoService.getDemoResults();
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const resetDemo = async (req, res) => {
  try {
    const result = await federatedDemoService.resetDemo();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAvailablePatterns = async (req, res) => {
  try {
    const patterns = federatedDemoService.getAvailablePatterns();
    res.json({ success: true, data: patterns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const runFullDemo = async (req, res) => {
  try {
    const { patternName = "CROSS_BANK_FRAUD" } = req.body;
    res.json({
      success: true,
      message: "Full demo sequence initiated. Watch the federated events in real-time.",
    });

    // 1. Connect all banks
    const banks = await bankNodeService.getAllBanks();
    for (const bank of banks) {
      if (bank.status === "OFFLINE") {
        await bankNodeService.connectBank(bank.bankId);
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // 2. Inject fraud pattern (which runs the full federated lifecycle internally)
    await federatedDemoService.injectPattern({
      patternName,
      sourceBank: "BANK-70",
      affectedBanks: ["BANK-10", "BANK-12", "BANK-1", "BANK-15"],
    });
  } catch (err) {
    console.error("Full demo error:", err);
  }
};

// ─── Intra-Bank & Cross-Bank Advanced Risk Analysis ──────────────────────────

export const getIntraBankRiskAnalysis = async (req, res) => {
  try {
    const ruleEngineService = (await import("../services/ruleEngineService.js")).default;
    const data = ruleEngineService.getIntraBankAnalysis();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getFederatedModelSpec = async (req, res) => {
  try {
    const ruleEngineService = (await import("../services/ruleEngineService.js")).default;
    const data = ruleEngineService.getFederatedModelSpec();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

