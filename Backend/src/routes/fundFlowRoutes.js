import express from "express";
import { getFundFlow } from "../controllers/fundFlowController.js";

const router = express.Router();

router.get("/:accountId", getFundFlow);

export default router;