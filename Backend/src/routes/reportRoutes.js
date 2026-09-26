import express from "express";
import { getExecutiveReport, getSARReports, getAuditLogs } from "../controllers/reportController.js";

const router = express.Router();

router.get("/executive-summary", getExecutiveReport);
router.get("/sar", getSARReports);
router.get("/audit", getAuditLogs);

export default router;
