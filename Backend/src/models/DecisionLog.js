import mongoose from 'mongoose';

const decisionLogSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    // Note: might be null if pre-check blocks before official transaction creation
    sparse: true
  },
  sourceAccountId: {
    type: String,
    required: true,
  },
  targetAccountId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['APPROVE', 'BLOCK', 'REQUIRE_MFA'],
    required: true
  },
  risk_score: {
    type: Number,
    required: true
  },
  factors: [{
    type: { type: String },
    contribution: Number,
    reason: String
  }],
  reason: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('DecisionLog', decisionLogSchema);
