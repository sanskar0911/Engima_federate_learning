import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

// ✅ KAFKA & PIPELINE
import { startProducer } from "./kafka/producer.js";
import { startConsumer } from "./kafka/consumer.js";

// ✅ ROUTES
import transactionRoutes from "./routes/transactionRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import investigationRoutes from "./routes/investigationRoutes.js";
import fundFlowRoutes from "./routes/fundFlowRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import federatedRoutes from "./routes/federatedRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

dotenv.config();

// ================= APP INIT =================
const app = express();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not crash the process for Kafka connection issues in demo mode
});

// ================= GLOBAL MIDDLEWARE =================
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api/", limiter);

// ================= SERVER + SOCKET =================
const server = http.createServer(app);
initSocket(server);

// ================= ROUTES =================
app.use("/api/transactions", transactionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/investigation", investigationRoutes);
app.use("/api/fund-flow", fundFlowRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/federated", federatedRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/audit", auditRoutes);

// ================= ERROR HANDLING MIDDLEWARE =================
app.use((err, req, res, next) => {
  console.error("🔥 Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= START EVERYTHING =================
const startServer = async () => {
  try {
    console.log("🚀 Starting FedShield services...");

    await connectDB();

    await startProducer();
    await startConsumer();

    console.log("✅ Stream engine running...");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, async () => {
      console.log(`🚀 FedShield Server running on port ${PORT}`);
      console.log(`📡 WebSocket Engine Ready`);
      console.log(`🛡️  Federated API: /api/federated`);
      console.log(`❤️  Health API: /api/health`);
      console.log(`📋 Audit API: /api/audit`);

      // Initialize bank nodes on startup
      try {
        const bankNodeService = (await import("./services/bankNodeService.js")).default;
        await bankNodeService.initializeDefaultBanks();
        console.log("🏦 Bank nodes initialized (BANK-A, BANK-B, BANK-C)");
      } catch (e) {
        console.error("Bank node init error (non-fatal):", e.message);
      }
    });

  } catch (error) {
    console.error("❌ Fatal Startup Error:", error);
    process.exit(1);
  }
};

startServer();