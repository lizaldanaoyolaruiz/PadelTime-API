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
  limpiarReservasMPPendientes,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

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
router.post("/", protect, createBooking);

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
router.patch("/:id", protect, editarReserva);
router.delete("/:id", protect, eliminarReserva);

export default router;
