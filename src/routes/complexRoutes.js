import { Router } from "express";
import {
  getFeaturedComplexes,
  getCities,
  getPublicComplexes,
  getPublicComplexById,
  createComplex,
  createComplexByAdmin,
  getMyComplex,
  updateComplex,
  deleteMpToken,
  uploadPhotos,
  deletePhoto,
  setPrincipalPhoto,
  getAdminComplexes,
  approveComplex,
  rejectComplex,
  suspendComplex,
  deleteComplex,
  toggleFeatured,
  getMyComplexes,
  getConfig,
  updateConfig,
} from "../controllers/complexController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { uploadMultiple } from "../middlewares/uploadMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  complexRules,
  complexUpdateRules,
  complexAdminCreateRules,
  complexReasonRules,
} from "../middlewares/complexValidationMiddleware.js";

const router = Router();

router.get("/", getFeaturedComplexes);
router.get("/cities", getCities);
router.get("/public", getPublicComplexes);
router.get("/public/:id", getPublicComplexById);

router.post(
  "/",
  protect,
  requireRole("admin"),
  complexRules,
  validate,
  createComplex,
);
router.get("/me", protect, requireRole("admin"), getMyComplex);
router.get("/me/all", protect, requireRole("admin"), getMyComplexes);
router.delete(
  "/:id/mp-token",
  protect,
  requireRole("admin", "superadmin"),
  deleteMpToken,
);
router.put(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  complexUpdateRules,
  validate,
  updateComplex,
);
router.post(
  "/:id/photos",
  protect,
  requireRole("admin", "superadmin"),
  uploadMultiple,
  uploadPhotos,
);
router.delete(
  "/:id/photos",
  protect,
  requireRole("admin", "superadmin"),
  deletePhoto,
);
router.patch(
  "/:id/photos/principal",
  protect,
  requireRole("admin", "superadmin"),
  setPrincipalPhoto,
);

router.get("/admin", protect, requireRole("superadmin"), getAdminComplexes);
router.post(
  "/admin",
  protect,
  requireRole("superadmin"),
  complexAdminCreateRules,
  validate,
  createComplexByAdmin,
);
router.delete("/:id", protect, requireRole("superadmin"), deleteComplex);
router.patch(
  "/:id/featured",
  protect,
  requireRole("superadmin"),
  toggleFeatured,
);
router.patch(
  "/:id/approve",
  protect,
  requireRole("superadmin"),
  approveComplex,
);
router.patch(
  "/:id/reject",
  protect,
  requireRole("superadmin"),
  complexReasonRules,
  validate,
  rejectComplex,
);
router.patch(
  "/:id/suspend",
  protect,
  requireRole("superadmin"),
  complexReasonRules,
  validate,
  suspendComplex,
);
router.get(
  "/:complexId/config",
  protect,
  requireRole("admin", "superadmin"),
  getConfig,
);
router.put(
  "/:complexId/config",
  protect,
  requireRole("admin", "superadmin"),
  updateConfig,
);

export default router;
