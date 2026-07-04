import { Router } from "express";

import { getAdminDashboard } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/experiments", getAdminDashboard);

export default router;
