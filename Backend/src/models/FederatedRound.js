import mongoose from "mongoose";

const federatedRoundSchema = new mongoose.Schema(
  {
    roundId: { type: String, required: true, unique: true },
    roundNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["WAITING", "COLLECTING", "AGGREGATING", "DISTRIBUTING", "COMPLETED", "FAILED"],
      default: "WAITING",
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    participatingBanks: [{ type: String }],
    expectedBanks: [{ type: String }],
    receivedUpdates: [{ type: String }], // bankIds that submitted updates
    aggregationStartedAt: { type: Date, default: null },
    aggregationCompletedAt: { type: Date, default: null },
    globalModelVersion: { type: String, default: null },
    duration: { type: Number, default: null }, // ms
    accuracy: { type: Number, default: null },
    loss: { type: Number, default: null },
    error: { type: String, default: null },
    timeline: [
      {
        event: String,
        bankId: String,
        timestamp: { type: Date, default: Date.now },
        description: String,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

federatedRoundSchema.index({ roundNumber: -1 });
federatedRoundSchema.index({ status: 1 });

export default mongoose.model("FederatedRound", federatedRoundSchema);
