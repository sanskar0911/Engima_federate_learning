import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  avg_transaction_amount: {
    type: Number,
    default: 0
  },
  transaction_frequency: {
    type: Number, // transactions per day
    default: 0
  },
  active_hours: {
    // Array of hour ranges, e.g., ["09:00-17:00", "20:00-22:00"]
    type: [String],
    default: []
  },
  device_fingerprints: {
    type: [String],
    default: []
  },
  location_patterns: {
    // Array of city/country codes or IP subnets
    type: [String],
    default: []
  },
  risk_weight: {
    type: Number, // custom risk modifier, defaults to 1.0 (neutral)
    default: 1.0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);
