import { Router } from "express";
import {
  getTorneos,
  getTorneoById,
  createTorneo,
  updateTorneo,
  deleteTorneo,
} from "../controllers/tournamentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { tournamentRules } from "../middlewares/tournamentValidationMiddleware.js";

const router = Router();

router.get("/", getTorneos);
router.get("/:id", getTorneoById);

router.post(
  "/",
  protect,
  requireRole("admin", "superadmin"),
  tournamentRules,
  validate,
  createTorneo,
);
router.put(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  tournamentRules,
  validate,
  updateTorneo,
);
router.delete(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  deleteTorneo,
);

export default router;
