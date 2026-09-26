import { predictFraud } from "./aiModel.js";
import behavioralProfiler from "./behavioralProfiler.js";
import graphFraudDetector from "./graphFraudDetector.js";

// ================= EXPLAINABLE RISK ENGINE =================
export const calculateComprehensiveRisk = async (tx) => {
  const { senderId, receiverId, amount, deviceId, location, transactionId } = tx;

  let totalScore = 0;
  const factors = [];

  // ================= 1. BEHAVIORAL RISK =================
  const behavioralRisk = await behavioralProfiler.evaluateDeviation(senderId, amount, deviceId, location);
  const behContrib = behavioralRisk.contribution || (behavioralRisk.deviationScore ? Math.min(behavioralRisk.deviationScore, 35) : 0);
  if (behContrib > 0) {
    totalScore += behContrib;
    factors.push({
      type: "behavioral",
      contribution: behContrib,
      reason: behavioralRisk.reason || (behavioralRisk.reasons && behavioralRisk.reasons.join(", ")) || "Behavioral anomaly detected"
    });
  }

  // ================= 2. GRAPH / NETWORK RISK =================
  const networkRisk = await graphFraudDetector.evaluateGraphRisk(senderId, receiverId, amount, transactionId);
  if (networkRisk.contribution > 0) {
    totalScore += networkRisk.contribution;
    factors.push(networkRisk);
  }

  // ================= 3. BASIC RULE RISK =================
  let ruleScore = 0;
  let ruleReasons = [];
  if (amount > 500000) {
    ruleScore += 15;
    ruleReasons.push("High-value institutional transfer (> $500k)");
  } else if (amount > 100000) {
    ruleScore += 10;
    ruleReasons.push("Significant corporate transaction (> $100k)");
  } else if (amount > 50000) {
    ruleScore += 5;
    ruleReasons.push("Moderate transaction amount (> $50k)");
  }

  if (ruleScore > 0) {
    totalScore += ruleScore;
    factors.push({
      type: "amount",
      contribution: ruleScore,
      reason: ruleReasons.join(", ")
    });
  }

  // ================= 4. AI MODEL RISK =================
  // Generate predictive AI score based on transaction heuristics
  const profile = await behavioralProfiler.getProfile(senderId);
  const avgAmountStr = profile.avg_transaction_amount === 0 ? 1 : 0;
  const outDegree = profile.transaction_frequency || 1;
  const recentTxCount = outDegree; // proxy for now

  try {
    const mlScore = await predictFraud([
      amount || 0,
      recentTxCount,
      outDegree,
      0, // placeholder for cross-bank
      avgAmountStr,
    ]);
    const aiContribution = Math.round(mlScore * 50); // Max 50 points from AI model
    
    if (aiContribution > 0) {
      totalScore += aiContribution;
      factors.push({
        type: "ai_model",
        contribution: aiContribution,
        reason: `Federated AI model predicted fraud probability of ${(mlScore*100).toFixed(1)}%`
      });
    }
  } catch (err) {
    console.error("AI Model error (non-fatal):", err);
  }

  // Cap score at 100
  let finalScore = Math.min(Math.round(totalScore), 100);

  // Institutional Risk Tiers:
  // 0 - 44: LOW (Normal / Auto-Approved)
  // 45 - 74: MEDIUM (Elevated Monitoring / Step-up Auth required)
  // 75 - 100: HIGH (Critical AML / Fraud Alert Generated)
  let level = "LOW";
  if (finalScore >= 75) level = "HIGH";
  else if (finalScore >= 45) level = "MEDIUM";

  return {
    score: finalScore,
    level,
    factors
  };
};

// Legacy method map to keep existing code temporarily working
export const analyzeTransaction = async (tx, allTransactions = []) => {
    // Map existing structure into Explainable Structure
    const risk = await calculateComprehensiveRisk({
       senderId: tx.senderId,
       receiverId: tx.receiverId,
       amount: tx.amount,
       transactionId: tx.transactionId || tx.id,
       deviceId: tx.deviceId,
       location: tx.location
    });

    let status = "PENDING";
    if (risk.level === "HIGH") status = "BLOCKED";
    else if (risk.level === "LOW") status = "COMPLETED";

    const reasons = risk.factors.map(f => f.reason);
    
    return {
      fraudScore: risk.score,
      aiScore: risk.factors.find(f => f.type === 'ai_model')?.contribution || 0,
      riskLevel: risk.level,
      status,
      reasons
    };
};

export default { calculateComprehensiveRisk, analyzeTransaction };