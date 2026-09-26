import { getIO } from "../socket/socket.js";
import { produceTransaction } from "../kafka/producer.js";
import datasetService from "./datasetService.js";

let simulationInterval = null;
let mode = "normal"; // normal or attack
const BANKS = ["BANK-A", "BANK-B", "BANK-C"];

export const switchMode = (newMode) => {
  mode = newMode;
  console.log(`[LiveSimulation] Mode switched to: ${mode}`);
  return mode;
};
export const setSimulationMode = switchMode;

export const startSimulation = (intervalMs = 2500) => {
  if (simulationInterval) return;
  console.log("🎬 Live dataset-driven simulation started.");

  simulationInterval = setInterval(async () => {
    try {
      const bankId = BANKS[Math.floor(Math.random() * BANKS.length)];

      if (mode === "attack") {
        // Sample real fraudulent patterns directly from the bank's dataset
        const fraudSamples = datasetService.sampleRecords(bankId, 3, { isFraud: true });
        for (const rawTx of fraudSamples) {
          const tx = {
            transactionId: rawTx.transactionId,
            senderId: rawTx.accountId,
            receiverId: rawTx.receiverId,
            amount: rawTx.amount,
            bankId: rawTx.bankId,
            channel: rawTx.channel,
            merchant: rawTx.merchant,
            location: rawTx.location,
            deviceId: rawTx.deviceId,
            isCrossBank: rawTx.is_cross_bank === 1,
            fraudPattern: rawTx.fraudPattern,
            timestamp: new Date(),
          };
          await produceTransaction(tx);
        }
        mode = "normal"; // return to normal baseline after burst
      } else {
        // Sample real normal transactions directly from the bank's dataset
        const normalSamples = datasetService.sampleRecords(bankId, 1, { isFraud: false });
        if (normalSamples.length > 0) {
          const rawTx = normalSamples[0];
          const tx = {
            transactionId: rawTx.transactionId,
            senderId: rawTx.accountId,
            receiverId: rawTx.receiverId,
            amount: rawTx.amount,
            bankId: rawTx.bankId,
            channel: rawTx.channel,
            merchant: rawTx.merchant,
            location: rawTx.location,
            deviceId: rawTx.deviceId,
            isCrossBank: rawTx.is_cross_bank === 1,
            timestamp: new Date(),
          };
          await produceTransaction(tx);
        }
      }
    } catch (err) {
      console.error("[LiveSimulation] Error streaming transaction from dataset:", err.message);
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