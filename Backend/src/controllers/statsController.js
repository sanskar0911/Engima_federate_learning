import Transaction from "../models/Transaction.js";
import Alert from "../models/Alert.js";

// =====================================================
// ✅ GET DASHBOARD STATS
// =====================================================
export const getStats = async (req, res) => {
  try {
    // Basic aggregation
    const totalTxns = await Transaction.countDocuments();
    const suspiciousTxns = await Transaction.countDocuments({ riskLevel: { $in: ["MEDIUM", "HIGH"] } });

    // Sum Volume
    const volumeAgg = await Transaction.aggregate([
      { $group: { _id: null, totalVolume: { $sum: "$amount" }, avgRisk: { $avg: "$fraudScore" } } }
    ]);
    
    const totalVolume = volumeAgg.length > 0 ? volumeAgg[0].totalVolume : 0;
    const avgRisk = volumeAgg.length > 0 ? Math.round(volumeAgg[0].avgRisk) : 0;

    // Risk Distribution
    const riskAgg = await Transaction.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
    ]);

    let riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    riskAgg.forEach((r) => {
      riskDistribution[r._id] = r.count;
    });

    res.json({
      totalVolume,
      totalTransactions: totalTxns,
      suspiciousCount: suspiciousTxns,
      avgRiskScore: avgRisk,
      riskDistribution,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
