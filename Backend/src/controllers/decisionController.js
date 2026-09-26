import decisionEngine from '../services/decisionEngine.js';
import behavioralProfiler from '../services/behavioralProfiler.js';

export const preCheckTransaction = async (req, res) => {
  try {
    const transactionData = req.body;
    
    // Validate request
    if (!transactionData.sourceAccountId || !transactionData.targetAccountId || !transactionData.amount) {
      return res.status(400).json({ success: false, message: 'Missing required transaction fields' });
    }

    // Process through Decision Engine
    const decisionResult = await decisionEngine.evaluatePreTransaction(transactionData);
    
    return res.status(200).json({
      success: true,
      decision: decisionResult.status,
      score: decisionResult.score,
      level: decisionResult.level,
      factors: decisionResult.factors,
      reason: decisionResult.reason,
      decisionId: decisionResult.decisionId
    });
  } catch (error) {
    console.error('Error in preCheckTransaction:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during pre-check' });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { accountId, riskWeight } = req.body;
    
    if (!accountId || riskWeight === undefined) {
      return res.status(400).json({ success: false, message: 'Missing accountId or riskWeight' });
    }

    const updatedProfile = await behavioralProfiler.updateRiskWeight(accountId, riskWeight);
    
    return res.status(200).json({
      success: true,
      message: 'Risk weight updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    return res.status(500).json({ success: false, message: 'Internal server error processing feedback' });
  }
};
