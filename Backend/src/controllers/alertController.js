import Alert from "../models/Alert.js";
import { sendDirectEmail } from "../services/emailService.js";

// =====================================================
// ✅ GET ALL ALERTS
// =====================================================
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error("Get Alerts Error:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

export const createAlert = async (req, res) => {
  try {
    const { accountId, transactionId, fraudScore, reasons, riskLevel } = req.body;
    const alert = await Alert.create({ accountId, transactionId, fraudScore, reasons, riskLevel: riskLevel || "MEDIUM", status: "PENDING" });
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Failed to create alert" });
  }
};

// =====================================================
// ✅ UPDATE ALERT STATUS
// =====================================================
export const updateAlertStatus = async (req, res) => {
  try {
    const { alertId, status, notes } = req.body;

    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    if (status) alert.status = status;
    if (notes) alert.analystNotes = notes;

    await alert.save();

    res.json(alert);
  } catch (error) {
    console.error("Update Alert Error:", error);
    res.status(500).json({ message: "Failed to update alert" });
  }
};

// =====================================================
// ✅ SIMULATE USER RESPONSE
// =====================================================
export const simulateUserResponse = async (req, res) => {
  try {
    const { alertId, response } = req.body;

    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.userResponse = response || "This was not me!";
    alert.status = "VERIFIED";

    await alert.save();

    res.json(alert);
  } catch (error) {
    console.error("User Response Error:", error);
    res.status(500).json({ message: "Failed to simulate response" });
  }
};

// =====================================================
// ✅ SEND DIRECT EMAIL
// =====================================================
export const sendAlertDirectEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    if (!to || !subject || !text) {
      return res.status(400).json({ message: "Missing required fields: to, subject, text" });
    }

    await sendDirectEmail(to, subject, text);

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email Sending Error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};