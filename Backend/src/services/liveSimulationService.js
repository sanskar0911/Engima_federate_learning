import { getIO } from "../socket/socket.js";
import { produceTransaction } from "../kafka/producer.js";
import datasetService, { BANK_NODE_REGISTRY } from "./datasetService.js";

let simulationInterval = null;
let mode = "normal"; // normal or attack
const REAL_BANK_KEYS = Object.keys(BANK_NODE_REGISTRY);

export const switchMode = (newMode) => {
  mode = newMode;
  console.log(`[LiveSimulation] Mode switched to: ${mode}`);
  return mode;
};
export const setSimulationMode = switchMode;

export const startSimulation = (intervalMs = 2000) => {
  if (simulationInterval) return;
  console.log("🎬 Live real IBM dataset-driven simulation started across 5 federated bank nodes.");

  simulationInterval = setInterval(async () => {
    try {
      const bankKey = REAL_BANK_KEYS[Math.floor(Math.random() * REAL_BANK_KEYS.length)];

      if (mode === "attack") {
        // Sample real fraudulent/money laundering patterns directly from the bank's federated dataset
        const fraudSamples = datasetService.sampleRecords(bankKey, 3, { isFraud: true });
        for (const rawTx of fraudSamples) {
          const tx = {
            transactionId: rawTx.transactionId,
            senderId: rawTx.senderId,
            receiverId: rawTx.receiverId,
            amount: rawTx.amount,
            bankId: rawTx.bankId,
            fromBank: rawTx.fromBank,
            toBank: rawTx.toBank,
            channel: rawTx.channel,
            paymentFormat: rawTx.paymentFormat,
            paymentCurrency: rawTx.paymentCurrency,
            receivingCurrency: rawTx.receivingCurrency,
            isCrossBank: rawTx.is_cross_bank === 1,
            isFraud: true,
            fraudScore: rawTx.fraudScore || 94,
            reason: rawTx.reason || "IBM AML Laundering Pattern: High-Velocity Smurfing",
            timestamp: new Date(),
          };
          await produceTransaction(tx);
        }
        mode = "normal"; // return to normal baseline after burst
      } else {
        // Sample real normal transactions directly from the bank's federated dataset
        const normalSamples = datasetService.sampleRecords(bankKey, 1, { isFraud: false });
        if (normalSamples.length > 0) {
          const rawTx = normalSamples[0];
          const tx = {
            transactionId: rawTx.transactionId,
            senderId: rawTx.senderId,
            receiverId: rawTx.receiverId,
            amount: rawTx.amount,
            bankId: rawTx.bankId,
            fromBank: rawTx.fromBank,
            toBank: rawTx.toBank,
            channel: rawTx.channel,
            paymentFormat: rawTx.paymentFormat,
            paymentCurrency: rawTx.paymentCurrency,
            receivingCurrency: rawTx.receivingCurrency,
            isCrossBank: rawTx.is_cross_bank === 1,
            isFraud: false,
            fraudScore: rawTx.fraudScore || 12,
            reason: rawTx.reason || "Routine Settlement",
            timestamp: new Date(),
          };
          await produceTransaction(tx);
        }
      }
    } catch (err) {
      console.error("[LiveSimulation] Error streaming transaction from real dataset:", err.message);
    }
  }, intervalMs);
};

export const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log("🛑 Live simulation stopped.");
  }
};

export const isSimulationRunning = () => simulationInterval !== null;