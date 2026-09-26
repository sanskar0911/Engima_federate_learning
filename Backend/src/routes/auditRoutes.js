import express from "express";
import { auditRepo } from "../services/store.js";

const router = express.Router();

// GET /api/audit — paginated audit log with filters
router.get("/", async (req, res) => {
  try {
    const {
      bankId,
      action,
      roundId,
      status,
      severity,
      limit = 100,
      page = 1,
    } = req.query;

    const filter = {};
    if (bankId) filter.bankId = bankId;
    if (action) filter.action = action;
    if (roundId) filter.roundId = roundId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const { logs, total } = await auditRepo.getLogs(filter, parseInt(limit), skip);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/audit/actions — unique action types for filtering
router.get("/actions", async (req, res) => {
  try {
    const { logs } = await auditRepo.getLogs({}, 1000, 0);
    const actions = [...new Set(logs.map((l) => l.action).filter(Boolean))];
    res.json({ success: true, data: actions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/audit/stats
router.get("/stats", async (req, res) => {
  try {
    const { logs, total } = await auditRepo.getLogs({}, 1000, 0);
    const critical = logs.filter((l) => l.severity === "CRITICAL").length;
    const high = logs.filter((l) => l.severity === "HIGH").length;
    const recent = logs.slice(0, 5);

    res.json({ success: true, data: { total, critical, high, recent } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
