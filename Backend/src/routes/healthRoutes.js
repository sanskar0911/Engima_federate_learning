import express from "express";
import mongoose from "mongoose";
import { getIO } from "../socket/socket.js";

const router = express.Router();

const startTime = Date.now();

router.get("/", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "HEALTHY" : dbState === 2 ? "DEGRADED" : "OFFLINE";

    let socketStatus = "OFFLINE";
    try {
      const io = getIO();
      socketStatus = io ? "HEALTHY" : "OFFLINE";
    } catch (_) {}

    const uptime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        status: dbStatus === "HEALTHY" && socketStatus === "HEALTHY" ? "HEALTHY" : "DEGRADED",
        uptime,
        timestamp: new Date().toISOString(),
        services: {
          backend: { status: "HEALTHY", latency: 0 },
          mongodb: { status: dbStatus },
          socketio: { status: socketStatus },
          kafka: { status: "UNKNOWN", note: "Gracefully degraded when offline" },
          federatedCoordinator: { status: "HEALTHY" },
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/services", async (req, res) => {
  const services = [];

  // Backend
  services.push({ name: "Backend API", status: "HEALTHY", lastHeartbeat: new Date().toISOString() });

  // MongoDB
  const dbState = mongoose.connection.readyState;
  services.push({
    name: "MongoDB",
    status: dbState === 1 ? "HEALTHY" : dbState === 2 ? "DEGRADED" : "OFFLINE",
    lastHeartbeat: new Date().toISOString(),
  });

  // Socket.IO
  try {
    const io = getIO();
    const connectedClients = io ? io.engine.clientsCount : 0;
    services.push({
      name: "Socket.IO",
      status: "HEALTHY",
      connectedClients,
      lastHeartbeat: new Date().toISOString(),
    });
  } catch (_) {
    services.push({ name: "Socket.IO", status: "OFFLINE" });
  }

  // Kafka
  services.push({
    name: "Apache Kafka",
    status: "DEGRADED",
    note: "Optional — system runs without Kafka in fallback mode",
    lastHeartbeat: new Date().toISOString(),
  });

  // Federated Coordinator
  services.push({ name: "Federated Coordinator", status: "HEALTHY", lastHeartbeat: new Date().toISOString() });

  // Bank nodes
  try {
    const { bankRepo } = await import("../services/store.js");
    const banks = await bankRepo.getAll();
    for (const bank of banks) {
      services.push({
        name: bank.bankName,
        bankId: bank.bankId,
        status: bank.status === "OFFLINE" ? "OFFLINE" : "HEALTHY",
        lastHeartbeat: bank.lastSeen instanceof Date ? bank.lastSeen.toISOString() : (bank.lastSeen || null),
      });
    }
  } catch (_) {}

  res.json({ success: true, data: services });
});

export default router;
