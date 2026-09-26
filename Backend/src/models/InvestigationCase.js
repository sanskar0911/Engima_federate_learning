import mongoose from "mongoose";

const investigationCaseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    alertId: { type: String, ref: "Alert" },
    transactionId: { type: String, ref: "Transaction" },
    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "CLOSED"], default: "OPEN" },
    analystNotes: [{
      analystId: String,
      note: String,
      timestamp: { type: Date, default: Date.now }
    }],
    resolution: { type: String, enum: ["FALSE_POSITIVE", "CONFIRMED_FRAUD", "PENDING"], default: "PENDING" },
  },
  { timestamps: true }
);

export default mongoose.model("InvestigationCase", investigationCaseSchema);
