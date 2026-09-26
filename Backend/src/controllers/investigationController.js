import Transaction from "../models/Transaction.js";
import InvestigationCase from "../models/InvestigationCase.js";

// =====================================================
// 🔍 INVESTIGATION MODE (DFS PATH FINDER)
// =====================================================
export const investigateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    let transactions = await Transaction.find().lean();

    // 🔗 build adjacency using senderId/receiverId
    const adj = {};
    transactions.forEach((tx) => {
      if (!adj[tx.senderId]) adj[tx.senderId] = [];
      adj[tx.senderId].push(tx.receiverId);
    });

    // 🔍 DFS path finder
    const findPaths = (start, visited = new Set(), path = [], depth = 0) => {
      if (depth > 5) return [];

      visited.add(start);
      path.push(start);

      let paths = [];

      for (let neighbor of adj[start] || []) {
        if (!visited.has(neighbor)) {
          paths.push(
            ...findPaths(neighbor, new Set(visited), [...path], depth + 1)
          );
        } else {
          // cycle detected
          paths.push([...path, neighbor]);
        }
      }

      return paths;
    };

    const allPaths = findPaths(accountId);
    const suspiciousPaths = allPaths.filter((p) => p.length > 2);

    res.json({
      accountId,
      suspiciousPaths,
      summary: {
        hasCycle: suspiciousPaths.some(
          (p) => p[0] === p[p.length - 1]
        ),
        pathCount: suspiciousPaths.length,
      },
    });

  } catch (err) {
    console.error("Investigation Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createInvestigationCase = async (req, res) => {
  try {
    const { title, alertId, transactionId } = req.body;
    const caseId = `CASE-${Date.now()}`;
    const newCase = await InvestigationCase.create({
      caseId, title, alertId, transactionId
    });
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: "Failed to create investigation case" });
  }
};

export const updateInvestigationStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, resolution, note } = req.body;
    
    const caseFile = await InvestigationCase.findOne({ caseId });
    if (!caseFile) return res.status(404).json({ message: "Case not found" });

    if (status) caseFile.status = status;
    if (resolution) caseFile.resolution = resolution;
    if (note) {
      caseFile.analystNotes.push({ analystId: "Admin", note });
    }
    await caseFile.save();

    res.json(caseFile);
  } catch (error) {
    res.status(500).json({ message: "Failed to update case" });
  }
};