import { Router } from "express";
import {
  getSlots,
  getBookings,
  getBookingById,
  getBookingStats,
  createBooking,
  confirmarPago,
  verificarPagoMP,
  confirmarReserva,
  rechazarReserva,
  cancelarReserva,
  editarReserva,
  eliminarReserva,
  generarPagoReserva,
  limpiarReservasMPPendientes,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createBookingRules,
  editBookingRules,
} from "../middlewares/bookingValidationMiddleware.js";

const router = Router();

router.get("/slots", getSlots);
router.get(
  "/stats",
  protect,
  requireRole("admin", "superadmin"),
  getBookingStats,
);

router.get("/", protect, getBookings);
router.get("/:id", protect, getBookingById);
router.post("/", protect, createBookingRules, validate, createBooking);

router.post(
  "/admin/cleanup-mp",
  protect,
  requireRole("admin", "superadmin"),
  limpiarReservasMPPendientes,
);
router.patch("/:id/payment-success", confirmarPago);
router.patch("/:id/verify-mp", verificarPagoMP);
router.patch(
  "/:id/confirm",
  protect,
  requireRole("admin", "superadmin"),
  confirmarReserva,
);
router.patch(
  "/:id/reject",
  protect,
  requireRole("admin", "superadmin"),
  rechazarReserva,
);
router.patch("/:id/cancel", protect, cancelarReserva);
router.post("/:id/pay", protect, generarPagoReserva);
router.patch("/:id", protect, editBookingRules, validate, editarReserva);
router.delete("/:id", protect, eliminarReserva);

export default router;
