import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  decision: {
    type: String,
    enum: ['FRAUD', 'SAFE'],
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
