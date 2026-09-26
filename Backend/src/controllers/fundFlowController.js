import Transaction from "../models/Transaction.js";

export const getFundFlow = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Use current DB models senderId / receiverId
    const transactions = await Transaction.find({
      $or: [
        { senderId: accountId },
        { receiverId: accountId },
      ],
    }).limit(100);

    const nodesMap = new Map();
    const edges = [];

    // 🔗 BUILD GRAPH
    for (const tx of transactions) {
      // INIT NODES
      if (!nodesMap.has(tx.senderId)) {
        nodesMap.set(tx.senderId, {
          id: tx.senderId,
          totalRisk: 0,
          count: 0,
          reasons: [],
          balance: 100000,
        });
      }

      if (!nodesMap.has(tx.receiverId)) {
        nodesMap.set(tx.receiverId, {
          id: tx.receiverId,
          totalRisk: 0,
          count: 0,
          reasons: [],
          balance: 100000,
        });
      }

      // UPDATE SENDER
      const sender = nodesMap.get(tx.senderId);
      sender.totalRisk += tx.fraudScore || 0;
      sender.count++;
      if (tx.reason) sender.reasons.push(tx.reason);
      sender.balance -= tx.amount;

      // UPDATE RECEIVER
      const receiver = nodesMap.get(tx.receiverId);
      receiver.balance += tx.amount;

      // 🔥 EDGE
      edges.push({
        id: `${tx.senderId}-${tx.receiverId}-${Date.now()}-${Math.random()}`,
        source: tx.senderId,
        target: tx.receiverId,
        label: `₹${tx.amount}`,
        animated: (tx.fraudScore || 0) > 60,
        style: {
          stroke:
            (tx.fraudScore || 0) > 80
              ? "#ef4444"
              : (tx.fraudScore || 0) > 50
              ? "#f59e0b"
              : "#999",
          strokeWidth: (tx.fraudScore || 0) > 60 ? 2.5 : 1.5,
        },
        data: {
          riskScore: tx.fraudScore,
          reason: tx.reason,
        },
      });
    }

    // 🔥 POSITIONING
    let index = 0;
    const spacingX = 250; 
    const spacingY = 180;

    const nodes = Array.from(nodesMap.values()).map((n) => {
      const avgRisk = n.count ? Math.round(n.totalRisk / n.count) : 0;

      const node = {
        id: n.id,
        type: "accountNode",
        data: {
          account: {
            id: n.id,
            riskScore: avgRisk,
            isSuspicious: avgRisk > 60,
            reasons: [...new Set(n.reasons)].slice(0, 3),

            // ✅ FIXED BALANCE
            balance: Math.max(n.balance, 0),

            type: "Savings",
            country: "India",
          },
        },
        position: {
          x: (index % 3) * spacingX,
          y: Math.floor(index / 3) * spacingY,
        },
      };

      index++;
      return node;
    });

    res.json({
      nodes,
      edges,
    });

  } catch (error) {
    console.error("Fund Flow Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};