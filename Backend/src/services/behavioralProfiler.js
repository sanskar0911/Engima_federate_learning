import UserProfile from '../models/UserProfile.js';

class BehavioralProfiler {
  /**
   * Retrieves or creates a user profile
   */
  async getProfile(accountId) {
    let profile = await UserProfile.findOne({ accountId });
    if (!profile) {
      profile = await UserProfile.create({ 
        accountId,
        avg_transaction_amount: 0,
        transaction_frequency: 0,
        active_hours: [],
        device_fingerprints: [],
        location_patterns: [],
        risk_weight: 1.0
      });
    }
    return profile;
  }

  /**
   * Updates a user profile based on a new transaction
   */
  async updateProfile(accountId, amount, deviceId, location) {
    const profile = await this.getProfile(accountId);
    
    // Simple sliding average for amount
    const newCount = profile.transaction_frequency + 1;
    profile.avg_transaction_amount = ((profile.avg_transaction_amount * profile.transaction_frequency) + amount) / newCount;
    profile.transaction_frequency = newCount;
    
    // Add device if new
    if (deviceId && !profile.device_fingerprints.includes(deviceId)) {
      profile.device_fingerprints.push(deviceId);
    }

    // Add location if new
    if (location && !profile.location_patterns.includes(location)) {
      profile.location_patterns.push(location);
    }
    
    profile.last_updated = new Date();
    await profile.save();
    return profile;
  }

  /**
   * Evaluates a transaction against their profile for deviation 
   * Returns a risk factor object
   */
  async evaluateDeviation(accountId, amount, deviceId, location) {
    const profile = await this.getProfile(accountId);
    let riskScore = 0;
    const reasons = [];

    // Amount deviation
    if (profile.transaction_frequency > 5) {
      if (amount > profile.avg_transaction_amount * 3) {
         riskScore += 25;
         reasons.push("Amount is significantly higher than user's historical average");
      }
    }

    // Device anomaly
    if (deviceId && profile.device_fingerprints.length > 0 && !profile.device_fingerprints.includes(deviceId)) {
      riskScore += 15;
      reasons.push("Unrecognized device fingerprint");
    }

    // Location anomaly
    if (location && profile.location_patterns.length > 0 && !profile.location_patterns.includes(location)) {
      riskScore += 20;
      reasons.push("Transaction from highly unusual location for this user");
    }

    return {
      type: "behavioral",
      contribution: riskScore * profile.risk_weight,
      reason: reasons.join(", ") || "Normal behavior"
    };
  }

  /**
   * Feedback loop: Update user risk weight
   */
  async updateRiskWeight(accountId, newWeight) {
    const profile = await this.getProfile(accountId);
    profile.risk_weight = newWeight;
    await profile.save();
    return profile;
  }
}

export default new BehavioralProfiler();
