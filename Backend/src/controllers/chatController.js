export const chatWithSystem = async (req, res) => {
  const { message, transaction, userSummary } = req.body;

  let reply = "";

  if (message.toLowerCase().includes("why")) {
    reply = `This transaction is flagged due to: ${
      transaction.reasons?.join(", ") || "multiple suspicious indicators"
    }`;
  } 
  
  else if (message.toLowerCase().includes("risk")) {
    reply = `Risk score is ${transaction.riskScore}. This is considered ${
      transaction.riskScore > 75
        ? "HIGH RISK"
        : transaction.riskScore > 50
        ? "MODERATE RISK"
        : "LOW RISK"
    }.`;
  } 
  
  else if (message.toLowerCase().includes("summary")) {
    reply = `User has ${
      userSummary?.totalTransactions || 0
    } transactions with ${
      userSummary?.highRisk || 0
    } high-risk activities.`;
  } 
  
  else if (message.toLowerCase().includes("next")) {
    reply =
      "Recommended actions: 1) Trigger MFA 2) Freeze account if repeated 3) Notify user.";
  } 
  
  else {
    reply =
      "This transaction shows suspicious behavioral, graph-based, and anomaly patterns.";
  }

  res.json({ reply });
};