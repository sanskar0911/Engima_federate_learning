import express from 'express';
import { preCheckTransaction, submitFeedback } from '../controllers/decisionController.js';

const router = express.Router();

// Synchronous pre-check API (called before a transaction is committed)
router.post('/pre-check', preCheckTransaction);

// Adaptive learning feedback API
router.post('/feedback', submitFeedback);

export default router;
