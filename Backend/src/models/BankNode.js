import mongoose from "mongoose";

const bankNodeSchema = new mongoose.Schema(
  {
    bankId: { type: String, required: true, unique: true },
    bankName: { type: String, required: true },
    shortCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "TRAINING", "UPLOADING", "AGGREGATING", "UPDATING", "ERROR"],
      default: "OFFLINE",
    },
    region: { type: String, default: "IN" },
    datasetSize: { type: Number, default: 0 },
    lastSeen: { type: Date, default: null },
    currentModelVersion: { type: String, default: null },
    localModelVersion: { type: String, default: null },
    lastRound: { type: Number, default: 0 },
    trainingStatus: { type: String, default: "IDLE" },
    privacyStatus: { type: String, default: "COMPLIANT" },
    transactionsProcessed: { type: Number, default: 0 },
    fraudDetected: { type: Number, default: 0 },
    heartbeatInterval: { type: Number, default: 30000 },
    isSimulated: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

bankNodeSchema.index({ bankId: 1 });
bankNodeSchema.index({ status: 1 });

export default mongoose.model("BankNode", bankNodeSchema);
