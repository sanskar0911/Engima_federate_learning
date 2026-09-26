import express from "express";
import { createTransaction, getTransactions } from "../controllers/transactionController.js";
import { preCheckTransaction } from "../controllers/decisionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.post("/pre-check", preCheckTransaction);
router.get("/", getTransactions);

export default router;
