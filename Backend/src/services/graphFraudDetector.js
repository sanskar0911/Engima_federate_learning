import GraphEdge from '../models/GraphEdge.js';

class GraphFraudDetector {
  /**
   * Evaluates graph topological network characteristics (in/out degree, cycle tendencies, cross-bank links)
   * to provide structured graph features for the Federated AI Model.
   */
  async evaluateGraphRisk(sourceId, targetId, amount, transactionId, sourceBankId, targetBankId) {
    let riskScore = 0;
    const reasons = [];

    try {
      // Analyze recent graph interactions in real-time
      const recentOutEdges = await GraphEdge.find({ sourceAccountId: sourceId }).limit(10);
      const recentInEdges = await GraphEdge.find({ targetAccountId: targetId }).limit(10);

      // 1. High Velocity Out-Degree
      if (recentOutEdges.length >= 5) {
        riskScore += 25;
        reasons.push("High topological out-degree: Rapid multi-node distribution");
      }

      // 2. Closed-Loop / Reverse Flow Detection
      const reverseEdge = await GraphEdge.findOne({
        sourceAccountId: targetId,
        targetAccountId: sourceId
      });
      if (reverseEdge) {
        riskScore += 35;
        reasons.push("Graph loop detected: Reciprocal transaction pathway");
      }

      // 3. Cross-Bank Boundary Flow
      if (sourceBankId && targetBankId && sourceBankId !== targetBankId) {
        riskScore += 20;
        reasons.push(`Cross-institution fund movement (${sourceBankId} -> ${targetBankId})`);
      }
    } catch (err) {
      console.warn("Graph evaluation fallback active:", err.message);
    }

    return {
      type: "network",
      contribution: Math.min(riskScore, 40),
      reason: reasons.join(" | ") || "Normal graph topology"
    };
  }

  /**
   * Add edge to graph after approval
   */
  async addEdge(sourceId, targetId, amount, transactionId, bankId) {
    const edge = new GraphEdge({
      sourceAccountId: sourceId,
      targetAccountId: targetId,
      amount,
      transactionId,
      bank_id: bankId || 'DEFAULT_BANK'
    });
    await edge.save();
    return edge;
  }

  /**
   * Fetch N-degree graph around an account for visualization
   */
  async getAccountGraph(accountId, maxHops = 2) {
    const nodes = new Map();
    const edges = [];
    
    let currentHop = 0;
    let accountsToExplore = [accountId];
    const visitedEdges = new Set();
    
    while(currentHop < maxHops && accountsToExplore.length > 0) {
      const nextHopAccounts = new Set();
      
      const outgoingEdges = await GraphEdge.find({ sourceAccountId: { $in: accountsToExplore } });
      const incomingEdges = await GraphEdge.find({ targetAccountId: { $in: accountsToExplore } });
      
      const allFound = [...outgoingEdges, ...incomingEdges];
      for(const e of allFound) {
        if (!visitedEdges.has(e._id.toString())) {
           visitedEdges.add(e._id.toString());
           edges.push({
             id: e._id.toString(),
             source: e.sourceAccountId,
             target: e.targetAccountId,
             amount: e.amount,
             timestamp: e.timestamp,
             transactionId: e.transactionId
           });
           nextHopAccounts.add(e.sourceAccountId);
           nextHopAccounts.add(e.targetAccountId);
           
           nodes.set(e.sourceAccountId, { id: e.sourceAccountId });
           nodes.set(e.targetAccountId, { id: e.targetAccountId });
        }
      }
      accountsToExplore = Array.from(nextHopAccounts);
      currentHop++;
    }
    
    return {
      nodes: Array.from(nodes.values()),
      edges
    };
  }
}

export default new GraphFraudDetector();
