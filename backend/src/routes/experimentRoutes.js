import { Router } from "express";

import {
  createExperiment,
  getExperimentById,
  listExperiments,
  updateExperimentStatus
} from "../controllers/experimentController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.post("/", createExperiment);
router.get("/", listExperiments);
router.get("/:id", getExperimentById);
router.patch("/:id/status", authorize("admin"), updateExperimentStatus);

export default router;
