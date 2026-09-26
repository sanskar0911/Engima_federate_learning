import mongoose from "mongoose";

const globalModelSchema = new mongoose.Schema(
  {
    version: { type: String, required: true, unique: true },
    roundId: { type: String, required: true },
    roundNumber: { type: Number, required: true },
    participatingBanks: [{ type: String }],
    totalUpdates: { type: Number, default: 0 },
    aggregationMethod: { type: String, default: "FedAvg" },
    status: {
      type: String,
      enum: ["CREATING", "READY", "DISTRIBUTING", "DISTRIBUTED", "DEPRECATED"],
      default: "CREATING",
    },
    modelSize: { type: Number, default: 0 }, // bytes
    checksum: { type: String, default: null },
    previousVersion: { type: String, default: null },
    accuracy: { type: Number, default: null },
    loss: { type: Number, default: null },
    epsilon: { type: Number, default: null },
    distributionStatus: {
      type: Map,
      of: String, // bankId -> status
      default: {},
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

globalModelSchema.index({ roundNumber: -1 });
globalModelSchema.index({ status: 1 });

export default mongoose.model("GlobalModel", globalModelSchema);
