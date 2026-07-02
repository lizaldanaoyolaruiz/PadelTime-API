import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createBlockoutRules,
  updateBlockoutRules,
} from "../middlewares/blockoutValidationMiddleware.js";
import {
  getBlockouts,
  createBlockout,
  updateBlockout,
  deleteBlockout,
} from "../controllers/blockoutController.js";

const router = Router();

router.get("/", protect, requireRole("admin", "superadmin"), getBlockouts);
router.post(
  "/",
  protect,
  requireRole("admin", "superadmin"),
  createBlockoutRules,
  validate,
  createBlockout,
);
router.put(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  updateBlockoutRules,
  validate,
  updateBlockout,
);
router.delete(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  deleteBlockout,
);

export default router;
