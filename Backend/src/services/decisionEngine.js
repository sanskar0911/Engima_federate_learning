import DecisionLog from '../models/DecisionLog.js';
import fraudDetectionService from './fraudDetectionService.js';
import behavioralProfiler from './behavioralProfiler.js';
import { getIO } from '../socket/socket.js';

class DecisionEngine {
  /**
   * Evaluates a transaction pre-execution and returns a decision.
   * Modifies UserProfiles and detects deviations.
   */
  async evaluatePreTransaction(transactionData) {
    const { 
      sourceAccountId, 
      targetAccountId, 
      amount, 
      deviceId, 
      location, 
      transactionId 
    } = transactionData;

    try {
      // 1. Get Risk Score from combined engine
      const riskEvaluation = await fraudDetectionService.calculateComprehensiveRisk(transactionData);
      
      const { score, level, factors } = riskEvaluation;

      // 2. Determine Decision based on thresholds
      let status = 'APPROVE';
      let reason = 'Transaction looks normal';

      if (score >= 70) {
        status = 'BLOCK';
        reason = 'High risk score based on multiple fraud factors';
      } else if (score >= 30) {
        status = 'REQUIRE_MFA';
        reason = 'Suspicious activity detected, secondary verification required';
      }

      // 3. Log Decision
      const decisionLog = new DecisionLog({
        transactionId: transactionId || null,
        sourceAccountId,
        targetAccountId,
        amount,
        status,
        risk_score: score,
        factors,
        reason
      });

      await decisionLog.save();

      // 4. Update Behavioral Profile async (if it's not a block)
      if (status !== 'BLOCK') {
        behavioralProfiler.updateProfile(sourceAccountId, amount, deviceId, location).catch(err => {
           console.error("Failed to update behavioral profile:", err);
        });
      }

      // 5. Emit real-time decision
      const io = getIO();
      if (io) {
        io.emit("live-decision", decisionLog);
      }

      return {
        decisionId: decisionLog._id,
        status,
        score,
        level,
        factors,
        reason
      };

    } catch (error) {
      console.error("Error in Decision Engine:", error);
      throw error;
    }
  }
}

export default new DecisionEngine();
