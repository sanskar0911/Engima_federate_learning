import express from 'express';
import { getAccountGraph } from '../controllers/graphController.js';

const router = express.Router();

// GET Account graph (up to N hops)
router.get('/:accountId', getAccountGraph);

export default router;
