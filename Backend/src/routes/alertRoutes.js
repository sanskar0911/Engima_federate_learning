import express from "express";
import {
  getAlerts,
  createAlert,
  updateAlertStatus,
  simulateUserResponse,
  sendAlertDirectEmail,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlerts);
router.post("/", createAlert);
router.put("/status", updateAlertStatus);
router.post("/respond", simulateUserResponse);
router.post("/email", sendAlertDirectEmail);

export default router;