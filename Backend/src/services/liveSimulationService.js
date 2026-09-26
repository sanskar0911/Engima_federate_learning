import { getIO } from "../socket/socket.js";
import { analyzeTransaction } from "./fraudDetectionService.js";
import { produceTransaction } from "../kafka/producer.js";

let simulationInterval = null;
let mode = "normal"; // normal or attack

// 🔥 Random amount generator
const randomAmount = () => mode === "attack" ? Math.floor(Math.random() * 100000) : Math.floor(Math.random() * 5000);

// 🔥 Generate single random transaction
const generateTransaction = () => ({
  transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  senderId: "ACC" + Math.floor(Math.random() * 20), // smaller pool to induce cycle chances
  receiverId: "ACC" + Math.floor(Math.random() * 20),
  amount: randomAmount(),
  timestamp: new Date()
});

// 🔥 FRAUD PATTERNS (Fixed for demo execution)
const generateFraudPatterns = () => {
  const ts = Date.now();
  return [
    // 🔴 Circular Fraud
    { transactionId: `TXN-${ts}-1`, senderId: "A1", receiverId: "A2", amount: randomAmount(), timestamp: new Date() },
    { transactionId: `TXN-${ts}-2`, senderId: "A2", receiverId: "A3", amount: randomAmount(), timestamp: new Date() },
    { transactionId: `TXN-${ts}-3`, senderId: "A3", receiverId: "A1", amount: randomAmount(), timestamp: new Date() },

    // 🟠 Smurfing
    { transactionId: `TXN-${ts}-4`, senderId: "A4", receiverId: "A5", amount: 9000, timestamp: new Date() },
    { transactionId: `TXN-${ts}-5`, senderId: "A4", receiverId: "A5", amount: 9500, timestamp: new Date() },
    { transactionId: `TXN-${ts}-6`, senderId: "A4", receiverId: "A5", amount: 8700, timestamp: new Date() },

    // 🟡 Large suspicious
    { transactionId: `TXN-${ts}-7`, senderId: "A2", receiverId: "A5", amount: 120000, timestamp: new Date() },

    // 🟢 Fan-out burst (11 transactions from same source to unique receivers)
    ...Array.from({ length: 11 }).map((_, i) => ({
      transactionId: `TXN-${ts}-fan-${i}`,
      senderId: "FO_SENDER_1",
      receiverId: `FO_RECEIVER_${i}`,
      amount: 1500,
      timestamp: new Date()
    })),
  ];
};

export const startSimulation = () => {
  if (simulationInterval) return;
  console.log("🎬 Live simulation started.");
  
  simulationInterval = setInterval(async () => {
    // We send data through Kafka to simulate a real-world pipeline
    try {
      if (mode === "attack") {
        const patterns = generateFraudPatterns();
        for (const tx of patterns) {
          await produceTransaction(tx);
        }
        // Force switch back to normal to avoid spamming the DB forever
        mode = "normal";
      } else {
        const tx = generateTransaction();
        await produceTransaction(tx);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  }, 3000); // 1 transaction every 3 seconds
};

export const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log("🛑 Live simulation stopped.");
  }
};

export const switchMode = (newMode) => {
  mode = newMode;
  console.log(`🔄 Simulation mode switched to: ${mode}`);
  return mode;
};