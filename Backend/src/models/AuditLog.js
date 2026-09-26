import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, default: "SYSTEM" }, // who performed the action
    action: {
      type: String,
      required: true,
      enum: [
        "FEDERATION_ROUND_STARTED",
        "FEDERATION_ROUND_COMPLETED",
        "FEDERATION_ROUND_FAILED",
        "MODEL_UPDATE_RECEIVED",
        "MODEL_UPDATE_REJECTED",
        "GLOBAL_MODEL_CREATED",
        "MODEL_DISTRIBUTED",
        "BANK_CONNECTED",
        "BANK_DISCONNECTED",
        "BANK_FAILED",
        "PRIVACY_TRANSFER_BLOCKED",
        "PRIVACY_TRANSFER_ALLOWED",
        "FRAUD_PATTERN_INJECTED",
        "DEMO_STARTED",
        "DEMO_RESET",
        "ALERT_CREATED",
        "INVESTIGATION_OPENED",
        "SIMULATION_STARTED",
        "SIMULATION_STOPPED",
        "AGGREGATION_STARTED",
        "AGGREGATION_COMPLETED",
        "SYSTEM_HEALTH_CHECK",
      ],
    },
    resource: { type: String, default: null },
    bankId: { type: String, default: null },
    roundId: { type: String, default: null },
    modelVersion: { type: String, default: null },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE", "WARNING", "INFO"],
      default: "INFO",
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ bankId: 1 });
auditLogSchema.index({ roundId: 1 });

export default mongoose.model("AuditLog", auditLogSchema);
