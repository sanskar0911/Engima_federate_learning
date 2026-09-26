import express from "express";
import { handleTestEmail, handleSendReportEmail } from "../controllers/emailController.js";

const router = express.Router();

router.post("/test", handleTestEmail);
router.post("/send-report", handleSendReportEmail);

export default router;
