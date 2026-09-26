import mongoose from "mongoose";

const privacyEventSchema = new mongoose.Schema(
  {
    source: { type: String, required: true }, // bankId or "AGGREGATOR"
    destination: { type: String, required: true },
    transferType: {
      type: String,
      enum: [
        "MODEL_UPDATE",
        "GLOBAL_MODEL",
        "METADATA",
        "RAW_TRANSACTION_DATA",   // always blocked in simulation
        "PII_DATA",                // always blocked
        "AGGREGATED_WEIGHTS",
        "HEARTBEAT",
        "CONFIG",
      ],
      required: true,
    },
    payloadType: { type: String, default: null },
    size: { type: Number, default: 0 }, // bytes; 0 for blocked
    allowed: { type: Boolean, required: true },
    reason: { type: String, default: "" },
    roundId: { type: String, default: null },
    bankId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

privacyEventSchema.index({ timestamp: -1 });
privacyEventSchema.index({ source: 1 });
privacyEventSchema.index({ allowed: 1 });

export default mongoose.model("PrivacyEvent", privacyEventSchema);
