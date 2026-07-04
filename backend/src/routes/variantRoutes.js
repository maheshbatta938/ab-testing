import { Router } from "express";

import { createVariant, listVariants } from "../controllers/variantController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.post("/", createVariant);
router.get("/:experimentId", listVariants);

export default router;
