import { Router } from "express";

import { recordClick, recordImpression, recordOutcome } from "../controllers/interactionController.js";

const router = Router();

router.post("/record-click", recordClick);
router.post("/record-impression", recordImpression);
router.post("/record-outcome", recordOutcome);

export default router;
