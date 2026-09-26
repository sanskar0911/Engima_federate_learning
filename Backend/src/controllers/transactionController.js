import Transaction from "../models/Transaction.js";
import { produceTransaction } from "../kafka/producer.js";
import datasetService from "../services/datasetService.js";
import mongoose from "mongoose";

// ------------------ CREATE TRANSACTION ------------------
export const createTransaction = async (req, res) => {
  try {
    const txData = req.body;

    // Send to Kafka or direct fallback
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
    const { bankId, isFraud, channel, search, page = 1, limit = 50 } = req.query;

    if (mongoose.connection.readyState === 1) {
      try {
        const filter = {};
        if (bankId) filter.bankId = bankId;
        const txs = await Transaction.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
        if (txs && txs.length > 0) {
          return res.json(txs);
        }
      } catch (_) {}
    }

    // Serve directly from genuine bank dataset CSVs
    const result = datasetService.getTransactions({
      bankId,
      isFraud,
      channel,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result.data);
  } catch (err) {
    console.error("❌ Fetch Transactions Error:", err);
    res.status(500).json({ message: err.message });
  }
};