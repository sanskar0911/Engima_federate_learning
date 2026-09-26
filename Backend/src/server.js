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

// Rate Limiting to prevent basic DDoS and endpoint abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api/", limiter);

// ================= SERVER + SOCKET =================
const server = http.createServer(app);
initSocket(server); // attach the websocket engine globally via our module

// ================= ROUTES =================
app.use("/api/transactions", transactionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/investigation", investigationRoutes);
app.use("/api/fund-flow", fundFlowRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/graph", graphRoutes);

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
    console.log("🚀 Starting services...");

    // ✅ Connect DB
    await connectDB();

    // 🔥 Start Kafka Services explicitly and gracefully
    await startProducer();
    await startConsumer();

    console.log("✅ Stream engine running...");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Production Server running on port ${PORT}`);
      console.log(`📡 WebSocket Engine Ready`);
      console.log(`🎬 Run Live Simulation via: POST http://localhost:${PORT}/api/simulation/start`);
    });

  } catch (error) {
    console.error("❌ Fatal Startup Error:", error);
    process.exit(1);
  }
};

startServer();