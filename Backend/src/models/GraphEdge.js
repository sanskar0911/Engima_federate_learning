import mongoose from 'mongoose';

const graphEdgeSchema = new mongoose.Schema({
  sourceAccountId: {
    type: String,
    required: true,
    index: true
  },
  targetAccountId: {
    type: String,
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  bank_id: {
    type: String,
    default: 'DEFAULT_BANK'
  }
}, { timestamps: true });

// Compound index to help with graph queries
graphEdgeSchema.index({ sourceAccountId: 1, targetAccountId: 1 });

export default mongoose.model('GraphEdge', graphEdgeSchema);
