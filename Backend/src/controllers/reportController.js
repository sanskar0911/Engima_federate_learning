import reportService from "../services/reportService.js";

export const getExecutiveReport = async (req, res) => {
  try {
    const report = await reportService.getExecutiveSummaryReport();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSARReports = async (req, res) => {
  try {
    const sar = await reportService.getSARFilings();
    res.json({ success: true, data: sar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await reportService.getAuditLogReport();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};