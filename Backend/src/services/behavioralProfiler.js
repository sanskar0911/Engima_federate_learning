import UserProfile from '../models/UserProfile.js';
import mongoose from 'mongoose';

const memProfiles = new Map();

class BehavioralProfiler {
  /**
   * Retrieves or creates a user profile
   */
  async getProfile(accountId) {
    if (mongoose.connection.readyState === 1) {
      try {
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
      } catch (_) {}
    }

    if (!memProfiles.has(accountId)) {
      memProfiles.set(accountId, {
        accountId,
        avg_transaction_amount: 1500,
        transaction_frequency: 10,
        active_hours: [9, 10, 11, 14, 15, 16],
        device_fingerprints: [],
        location_patterns: [],
        risk_weight: 1.0,
        save: async () => {},
      });
    }
    return memProfiles.get(accountId);
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
    if (typeof profile.save === 'function') {
      try { await profile.save(); } catch (_) {}
    }
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
        riskScore += 40;
        reasons.push(`Spike in transaction amount (${amount} vs avg ${Math.round(profile.avg_transaction_amount)})`);
      }
    }

    // New device
    if (deviceId && profile.device_fingerprints && profile.device_fingerprints.length > 0) {
      if (!profile.device_fingerprints.includes(deviceId)) {
        riskScore += 30;
        reasons.push("Transaction executed from an unrecognized hardware device");
      }
    }

    // Unusual location
    if (location && profile.location_patterns && profile.location_patterns.length > 0) {
      if (!profile.location_patterns.includes(location)) {
        riskScore += 25;
        reasons.push(`Transaction originated from uncharacteristic geography (${location})`);
      }
    }

    // High velocity flag based on transaction frequency
    if (profile.transaction_frequency > 15) {
      riskScore += 15;
      reasons.push("High transaction velocity detected for account within 24h window");
    }

    const contribution = Math.min(riskScore, 35);
    return {
      type: "behavioral",
      contribution,
      deviationScore: Math.min(riskScore, 100),
      reason: reasons.join(", ") || "Normal account behavioral profile",
      reasons
    };
  }
}

export default new BehavioralProfiler();
