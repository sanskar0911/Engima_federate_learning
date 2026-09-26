import express from "express";
import { 
  investigateAccount, 
  createInvestigationCase, 
  updateInvestigationStatus 
} from "../controllers/investigationController.js";

const router = express.Router();

router.get("/:accountId", investigateAccount);
router.post("/case", createInvestigationCase);
router.put("/case/:caseId/status", updateInvestigationStatus);

export default router;