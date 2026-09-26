import { sendEmail, sendBankComplianceReportEmail } from "../services/emailService.js";

/**
 * Controller to send test email
 */
export const handleTestEmail = async (req, res) => {
  try {
    const { to = "sanskar0912gharal@gmail.com", subject = "Test Email from FedShield AML Engine", text = "This is a test email verifying Gmail SMTP with Nodemailer." } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email 'to' is required." });
    }

    const result = await sendEmail(to, subject, text);
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Controller to send full Bank & Federated Report Email to user
 */
export const handleSendReportEmail = async (req, res) => {
  try {
    const { to, bankKey = "BANK-70", officerName = "AML Compliance Officer" } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email address 'to' is required." });
    }

    const result = await sendBankComplianceReportEmail({
      to,
      bankKey,
      officerName,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: `Compliance report successfully dispatched to ${to} (CC: sanskar0912gharal@gmail.com)`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
