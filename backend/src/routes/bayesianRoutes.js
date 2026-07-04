import { Router } from "express";

import {
  getAllocation,
  getBayesianSummary,
  serveVariant,
  updatePosterior
} from "../controllers/bayesianController.js";

const router = Router();

router.post("/update-posterior", updatePosterior);
router.get("/allocation/:experimentId", getAllocation);
router.get("/summary/:experimentId", getBayesianSummary);
router.get("/serve/:experimentId", serveVariant);

export default router;
