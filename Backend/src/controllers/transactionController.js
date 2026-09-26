import Transaction from "../models/Transaction.js";
import { produceTransaction } from "../kafka/producer.js";

// ------------------ CREATE TRANSACTION ------------------
export const createTransaction = async (req, res) => {
  try {
    const txData = req.body;

    // 🔥 1. Send to Kafka (REAL-TIME PIPELINE)
    await produceTransaction(txData);

    res.status(201).json({
      transaction: txData,
      status: "PENDING",
      message: "Transaction pushed to stream. Evaluating fraud risk in background...",
    });
  } catch (err) {
    console.error("❌ Transaction Error:", err);
    res.status(500).json({ message: "Failed to process transaction" });
  }
};

// ------------------ GET ALL TRANSACTIONS ------------------
export const getTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json(txs);
  } catch (err) {
    console.error("❌ Fetch Transactions Error:", err);
    res.status(500).json({ message: err.message });
  }
};