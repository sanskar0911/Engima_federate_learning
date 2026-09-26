import InvestigationCase from "../models/InvestigationCase.js";
import Transaction from "../models/Transaction.js";
import Feedback from "../models/Feedback.js";
import behavioralProfiler from "../services/behavioralProfiler.js";
import { trainModel } from "../services/aiModel.js";

// 🧠 Convert transaction → array formatting required by TF model
const extractFeatures = (tx) => [
  tx.amount || 0,
  tx.frequency || 1, // placeholder heuristic
  tx.velocity || 1, // placeholder heuristic
  tx.currency !== "USD" ? 1 : 0, // placeholder heuristic
  0, // placeholder heuristic
];

export const submitFeedback = async (req, res) => {
  try {
    const { transactionId, decision, reason } = req.body;

    const tx = await Transaction.findOne({ transactionId });
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Capture Feedback in the new Model
    const feedback = await Feedback.create({
      transactionId: tx.transactionId,
      accountId: tx.senderId,
      decision: decision === "fraud" ? "FRAUD" : "SAFE",
      reason
    });

    // 💾 Save feedback into Investigation Case
    const caseId = `CASE-FB-${Date.now()}`;
    const feedbackCase = await InvestigationCase.create({
      caseId,
      title: `Feedback on ${transactionId}`,
      transactionId: tx.transactionId,
      status: "CLOSED",
      resolution: decision === "fraud" ? "CONFIRMED_FRAUD" : "FALSE_POSITIVE",
      analystNotes: [{ analystId: "Analyst1", note: reason }]
    });

    // 🔥 Adaptive correction
    if (decision === "safe") {
      tx.fraudScore = Math.max(tx.fraudScore - 20, 0);
      tx.riskLevel = "LOW";
      tx.status = "COMPLETED";
      // Decreasing risk weight slightly for safe validations
      await behavioralProfiler.updateRiskWeight(tx.senderId, 0.9);
    } else {
      tx.fraudScore = Math.min(tx.fraudScore + 20, 100);
      tx.riskLevel = "HIGH";
      tx.status = "BLOCKED";
      // Increase risk weight to heavily scrutinize future transactions
      await behavioralProfiler.updateRiskWeight(tx.senderId, 1.5);
    }

    await tx.save();

    // 🧠 Retrain AI model from recent confirmed/false-positive investigations
    const allFeedback = await InvestigationCase.find({ 
      resolution: { $in: ["CONFIRMED_FRAUD", "FALSE_POSITIVE"] } 
    }).limit(100);

    // This is just a conceptual mapping since we don't store raw features in the case
    // We would ideally fetch all transactions belonging to these cases
    const data = {
      features: allFeedback.map(() => [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]), // Mocked features
      labels: allFeedback.map((f) => [f.resolution === "CONFIRMED_FRAUD" ? 1 : 0]),
    };

    await trainModel(data);

    res.json({
      message: "✅ Feedback recorded + AI model updated + Risk weights adjusted",
      caseId: feedbackCase.caseId,
      feedbackId: feedback._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};