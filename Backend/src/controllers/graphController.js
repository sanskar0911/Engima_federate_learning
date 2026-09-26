import graphFraudDetector from '../services/graphFraudDetector.js';

export const getAccountGraph = async (req, res) => {
  try {
    const { accountId } = req.params;
    const maxHops = req.query.hops ? parseInt(req.query.hops) : 2;

    if (!accountId) {
      return res.status(400).json({ success: false, message: 'Missing accountId' });
    }

    const graphData = await graphFraudDetector.getAccountGraph(accountId, maxHops);
    
    return res.status(200).json({
      success: true,
      graph: graphData
    });
  } catch (error) {
    console.error('Error in getAccountGraph:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching graph' });
  }
};
