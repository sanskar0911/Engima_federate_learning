import express from "express";
import {
  // Banks
  getAllBanks, getBankById, connectBank, disconnectBank, connectAllBanks,
  // Rounds
  startRound, stopRound, getRounds, getCurrentRound, getRoundById,
  // Model Updates
  getModelUpdates, getModelUpdatesByRound, registerModelUpdate,
  // Global Models
  getGlobalModels, getCurrentGlobalModel, getGlobalModelByVersion, getModelDistribution,
  // Privacy
  getPrivacySummary, getPrivacyEvents, getPrivacyEventsByRound,
  // Dataset
  getDatasetSummary, getDatasetSample,
  // Intra & Cross Bank Risk
  getIntraBankRiskAnalysis, getFederatedModelSpec,
  // Demo Handlers
  injectFraudPattern, runPropagation, getDemoStatus, getDemoResults,
  resetDemo, getAvailablePatterns, runFullDemo,
} from "../controllers/federatedController.js";


const router = express.Router();

// ─── Intra-Bank & Cross-Bank Risk Engine (IBM Dataset + Rule Engine) ──────────
router.get("/intra-bank-risk", getIntraBankRiskAnalysis);
router.get("/model-spec", getFederatedModelSpec);

// ─── Dataset ─────────────────────────────────────────────────────────────────
router.get("/dataset", getDatasetSummary);
router.get("/dataset/sample", getDatasetSample);


// ─── Bank Nodes ──────────────────────────────────────────────────────────────
router.get("/banks", getAllBanks);
router.get("/banks/:bankId", getBankById);
router.post("/banks/connect-all", connectAllBanks);
router.post("/banks/:bankId/connect", connectBank);
router.post("/banks/:bankId/disconnect", disconnectBank);

// ─── Federated Rounds ────────────────────────────────────────────────────────
router.get("/rounds", getRounds);
router.get("/rounds/current", getCurrentRound);
router.get("/rounds/:roundId", getRoundById);
router.post("/rounds/start", startRound);
router.post("/rounds/:roundId/stop", stopRound);

// ─── Model Updates ───────────────────────────────────────────────────────────
router.get("/updates", getModelUpdates);
router.get("/updates/:roundId", getModelUpdatesByRound);
router.post("/updates/register", registerModelUpdate);

// ─── Global Models ───────────────────────────────────────────────────────────
router.get("/models", getGlobalModels);
router.get("/models/current", getCurrentGlobalModel);
router.get("/models/:version", getGlobalModelByVersion);
router.get("/models/:version/distribution", getModelDistribution);

// ─── Privacy ─────────────────────────────────────────────────────────────────
router.get("/privacy", getPrivacySummary);
router.get("/privacy/transfers", getPrivacyEvents);
router.get("/privacy/:roundId", getPrivacyEventsByRound);

// ─── Demo ─────────────────────────────────────────────────────────────────────
router.get("/demo/patterns", getAvailablePatterns);
router.get("/demo/status", getDemoStatus);
router.get("/demo/results", getDemoResults);
router.post("/demo/inject-pattern", injectFraudPattern);
router.post("/demo/run-propagation", runPropagation);
router.post("/demo/run-full", runFullDemo);
router.post("/demo/reset", resetDemo);

export default router;
