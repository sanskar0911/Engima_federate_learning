import { kafka } from "./kafkaClient.js";
import decisionEngine from "../services/decisionEngine.js";
import { getIO } from "../socket/socket.js";
import Alert from "../models/Alert.js";
import Transaction from "../models/Transaction.js";
import InvestigationCase from "../models/InvestigationCase.js";

const txConsumer = kafka.consumer({ groupId: "transaction-group" });
const alertConsumer = kafka.consumer({ groupId: "alert-group" });
const metricsConsumer = kafka.consumer({ groupId: "metrics-group" });
const producer = kafka.producer();

// In production, we'd query DB. For demo speed, memory cache:
let transactionCache = [];

/**
 * 📡 Process incoming federated model accuracy metrics from Python Flower server
 * Broadcasts directly to connected Frontend clients over WebSockets
 */
export const processModelMetricDirect = (metricPayload) => {
  try {
    const io = getIO();
    console.log(`📡 [WebSocket Broadcast] Emitting MODEL_METRICS: Round ${metricPayload.round}/${metricPayload.totalRounds || 5} | Accuracy: ${(metricPayload.accuracy * 100).toFixed(1)}% | Epsilon: ${metricPayload.epsilon || 1.2}`);
    if (io) {
      io.emit("model-metrics", metricPayload);
      io.emit("model_metrics", metricPayload);
      io.emit("federated-metrics", metricPayload);
    }
  } catch (err) {
    console.error("❌ processModelMetricDirect WebSocket Error:", err.message);
  }
};

/**
 * 🔄 Fallback direct simulator pipeline to stream federated training progress
 * if the Apache Kafka broker or Python daemon is starting up.
 */
export const simulateFederatedTrainingDirect = (options = {}) => {
  console.log("🚀 Starting direct federated training metric stream...");
  const totalRounds = options.numRounds || 5;
  const numClients = options.numClients || 5;

  const baselineAccuracies = [0.612, 0.738, 0.824, 0.887, 0.932, 0.965];
  const losses = [0.782, 0.584, 0.412, 0.298, 0.215, 0.142];
  const epsilons = [0.00, 0.45, 0.72, 0.95, 1.15, 1.28];

  let round = 0;
  const interval = setInterval(() => {
    const acc = baselineAccuracies[round] || (0.95 + round * 0.005);
    const loss = losses[round] || 0.12;
    const eps = epsilons[round] || 1.30;
    const isDone = round >= totalRounds;

    const payload = {
      round,
      totalRounds,
      accuracy: parseFloat(acc.toFixed(4)),
      loss: parseFloat(loss.toFixed(4)),
      epsilon: parseFloat(eps.toFixed(2)),
      delta: 1e-5,
      numClients,
      status: isDone ? "COMPLETED" : (round === 0 ? "INITIALIZING" : "TRAINING"),
      timestamp: Date.now(),
      clientMetrics: Array.from({ length: numClients }).map((_, i) => ({
        clientId: i + 1,
        accuracy: parseFloat((acc + (Math.random() * 0.03 - 0.015)).toFixed(4)),
        loss: parseFloat((loss + (Math.random() * 0.02 - 0.01)).toFixed(4)),
        epsilon: parseFloat(eps.toFixed(2))
      }))
    };

    processModelMetricDirect(payload);

    if (isDone) {
      clearInterval(interval);
      console.log("✅ Direct Federated Learning simulation stream complete.");
    }
    round++;
  }, 1200);
};

export const processAlertDirect = async ({ tx, result }) => {
  try {
    // Save Alert in DB
    const alert = await Alert.create({
      transactionId: tx.transactionId,
      accountId: tx.senderId,
      fraudScore: result.fraudScore,
      riskLevel: result.riskLevel,
      reasons: result.reasons,
      status: result.status === "BLOCKED" ? "FRAUD" : "PENDING",
      risk_breakdown: result.factors || [],
      decision_result: {
        status: result.status,
        decisionId: result.decisionId
      }
    });

    console.log("🚨 FRAUD ALERT GENERATED:", alert.transactionId);
    
    // Auto-create case if BLOCKED and HIGH risk
    if (result.status === "BLOCKED" || result.riskLevel === "HIGH") {
      const caseId = `CASE-AUTO-${Date.now()}`;
      await InvestigationCase.create({
        caseId,
        title: `Auto-investigation for Tx ${tx.transactionId}`,
        alertId: alert._id,
        transactionId: tx.transactionId,
        status: "OPEN",
        resolution: "PENDING"
      });
      console.log("📁 AUTO-CASE CREATED:", caseId);
    }

    // Push alert via websocket
    const io = getIO();
    if(io) io.emit("new-alert", alert);
  } catch (err) {
    console.error("❌ alertConsumer Error:", err);
  }
};

export const processTransactionDirect = async (tx) => {
  try {
    // Keep cache bounded
    if (transactionCache.length > 5000) transactionCache.shift();
    transactionCache.push(tx);

    const mappedTx = {
      transactionId: tx.transactionId,
      sourceAccountId: tx.senderId,
      targetAccountId: tx.receiverId,
      amount: tx.amount,
      deviceId: tx.deviceId,
      location: tx.location,
      channel: tx.channel
    };
    
    // Evaluate Pre-Transaction via Decision Engine
    const decisionResult = await decisionEngine.evaluatePreTransaction(mappedTx);
    
    // Convert status to transaction status map
    let finalStatus = "COMPLETED";
    if (decisionResult.status === "BLOCK") finalStatus = "BLOCKED";
    else if (decisionResult.status === "REQUIRE_MFA") finalStatus = "PENDING";

    const reasons = decisionResult.factors.map(f => f.reason);

    // Legacy support for socket payload formatting
    const legacyResult = {
      fraudScore: decisionResult.score,
      riskLevel: decisionResult.level,
      reasons: reasons,
      status: finalStatus,
      factors: decisionResult.factors,
      decisionId: decisionResult.decisionId
    };

    // Save transaction to DB
    await Transaction.create({ 
       ...tx, 
       fraudScore: decisionResult.score,
       riskLevel: decisionResult.level,
       reason: decisionResult.reason,
       status: finalStatus,
       decisionId: decisionResult.decisionId
    });

    // Forward to frontend via socket
    const io = getIO();
    if (io) io.emit("new-transaction", { tx, result: legacyResult });

    if (decisionResult.level === "HIGH" || decisionResult.level === "MEDIUM") {
      processAlertDirect({ tx, result: legacyResult });
    }
  } catch (err) {
    console.error("❌ txConsumer Error:", err);
  }
};

export const startConsumer = async () => {
  try {
    await txConsumer.connect();
    await alertConsumer.connect();
    await metricsConsumer.connect();
    await producer.connect();

    console.log("✅ Kafka Consumers Connected (Transactions, Alerts, MODEL_METRICS)");

    await txConsumer.subscribe({ topic: "transactions", fromBeginning: true });
    await alertConsumer.subscribe({ topic: "fraud-alerts", fromBeginning: true });
    await metricsConsumer.subscribe({ topic: "MODEL_METRICS", fromBeginning: false });

    // Stream 1: Process Transactions
    txConsumer.run({
      eachMessage: async ({ message }) => {
        const tx = JSON.parse(message.value.toString());
        await processTransactionDirect(tx);
      }
    });

    // Stream 2: Process High/Medium Risk Alerts
    alertConsumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(message.value.toString());
        await processAlertDirect(payload);
      }
    });

    // Stream 3: Process Model Metrics from Federated Learning Python Server
    metricsConsumer.run({
      eachMessage: async ({ message }) => {
        try {
          const metricPayload = JSON.parse(message.value.toString());
          processModelMetricDirect(metricPayload);
        } catch (err) {
          console.error("❌ Error processing Kafka MODEL_METRICS message:", err);
        }
      }
    });
  } catch (error) {
    console.error("❌ Kafka Consumer Failed to Connect:", error.message);
  }
};