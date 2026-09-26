import mongoose from "mongoose";

const modelUpdateSchema = new mongoose.Schema(
  {
    updateId: { type: String, required: true, unique: true },
    roundId: { type: String, required: true },
    bankId: { type: String, required: true },
    modelVersion: { type: String, required: true },
    parameterCount: { type: Number, default: 0 },
    updateSize: { type: Number, default: 0 }, // in bytes
    receivedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["PENDING", "RECEIVED", "VALIDATED", "REJECTED", "AGGREGATED"],
      default: "PENDING",
    },
    checksum: { type: String, default: null },
    trainingExamples: { type: Number, default: 0 },
    trainingDuration: { type: Number, default: null }, // ms
    privacyStatus: { type: String, default: "DP_APPLIED" }, // Differential Privacy
    accuracy: { type: Number, default: null },
    loss: { type: Number, default: null },
    epsilon: { type: Number, default: null }, // DP budget
    // No raw transaction data stored here — only model update metadata
    rawDataIncluded: { type: Boolean, default: false }, // always false
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

modelUpdateSchema.index({ roundId: 1 });
modelUpdateSchema.index({ bankId: 1 });
modelUpdateSchema.index({ status: 1 });

export default mongoose.model("ModelUpdate", modelUpdateSchema);
