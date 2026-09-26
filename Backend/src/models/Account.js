import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    accountType: { type: String, enum: ["SAVINGS", "CHECKING", "BUSINESS"], default: "SAVINGS" },
    riskScore: { type: Number, default: 0 },
    isSuspicious: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
