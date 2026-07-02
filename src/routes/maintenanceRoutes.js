import { Router } from "express";
import {
  getMantenimientos,
  crearMantenimiento,
  eliminarMantenimiento,
} from "../controllers/maintenanceController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { maintenanceRules } from "../middlewares/maintenanceValidationMiddleware.js";

const router = Router();

router.get("/", protect, requireRole("admin", "superadmin"), getMantenimientos);
router.post(
  "/",
  protect,
  requireRole("admin", "superadmin"),
  maintenanceRules,
  validate,
  crearMantenimiento,
);
router.delete(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  eliminarMantenimiento,
);

export default router;
