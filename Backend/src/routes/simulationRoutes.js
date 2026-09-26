import express from "express";
import { startSimulation, stopSimulation, switchMode } from "../services/liveSimulationService.js";
import { triggerFederatedTraining } from "../kafka/producer.js";

const router = express.Router();

/**
 * 🚀 POST /api/simulation/start
 * Triggers the Federated Learning training pipeline across 5 local bank clients via Kafka START_TRAINING topic
 */
router.post("/start", async (req, res) => {
  try {
    startSimulation(); // Continue transaction stream
    const result = await triggerFederatedTraining(req.body || {});
    res.json({
      success: true,
      message: "🚀 Federated Learning training cycle triggered successfully",
      details: result
    });
  } catch (error) {
    console.error("Simulation start route error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🚀 POST /api/simulation/federated-train
 */
router.post("/federated-train", async (req, res) => {
  try {
    const result = await triggerFederatedTraining(req.body || {});
    res.json({
      success: true,
      message: "🚀 Federated Learning training cycle triggered successfully",
      details: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/stop", (req, res) => {
  stopSimulation();
  res.json({ message: "🛑 Simulation stopped" });
});

router.post("/mode", (req, res) => {
  const { mode } = req.body;
  if (!["normal", "attack"].includes(mode)) {
    return res.status(400).json({ error: "Invalid mode. Use 'normal' or 'attack'." });
  }
  const newMode = switchMode(mode);
  res.json({ message: `🔄 Simulation mode switched to ${newMode}` });
});

export default router;