import mongoose from "mongoose";

const demoScenarioSchema = new mongoose.Schema(
  {
    scenarioId: { type: String, required: true, unique: true },
    patternName: {
      type: String,
      enum: [
        "NORMAL_ACTIVITY",
        "RAPID_MULTI_HOP",
        "TRANSACTION_STRUCTURING",
        "ACCOUNT_TAKEOVER_BURST",
        "CIRCULAR_FUND_FLOW",
        "CROSS_BANK_FRAUD",
        "CARD_FRAUD",
      ],
      required: true,
    },
    sourceBank: { type: String, required: true },
    affectedBanks: [{ type: String }],
    status: {
      type: String,
      enum: ["IDLE", "INJECTING", "FEDERATING", "DISTRIBUTING", "COMPLETED", "RESET"],
      default: "IDLE",
    },
    beforeDetection: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // bankId -> { detected, score, reason }
      default: {},
    },
    afterDetection: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    roundNumber: { type: Number, default: null },
    globalModelBefore: { type: String, default: null },
    globalModelAfter: { type: String, default: null },
    timeline: [
      {
        step: String,
        bank: String,
        timestamp: { type: Date, default: Date.now },
        description: String,
        status: String,
      },
    ],
    injectedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DemoScenario", demoScenarioSchema);
