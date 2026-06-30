import Booking from "../models/Booking.js";
import Complex from "../models/Complex.js";
import { generateCsv, generatePdf } from "../services/exportService.js";

const verificarOwner = async (complexId, userId, role) => {
  const complejo = await Complex.findById(complexId);
  if (!complejo) return null;
  if (complejo.owner.toString() !== userId.toString() && role !== "superadmin")
    return null;
  return complejo;
};

const buildFiltro = (complexId, courtId, startDate, endDate, status) => {
  const filtro = { complex: complexId };
  if (courtId) filtro.court = courtId;
  if (status) filtro.status = status;
  if (startDate || endDate) {
    filtro.date = {};
    if (startDate) filtro.date.$gte = startDate;
    if (endDate) filtro.date.$lte = endDate;
  }
  return filtro;
};

const nombreJugador = (booking) =>
  booking.player?.name ||
  (booking.jugadorExterno
    ? `${booking.jugadorExterno.nombre || ""} ${booking.jugadorExterno.apellido || ""}`.trim()
    : "Sin nombre");

const emailJugador = (booking) =>
  booking.player?.email || booking.jugadorExterno?.email || "";

const METODO_LABEL = {
  mercadopago: "Mercado Pago",
  whatsapp: "WhatsApp",
  manual: "Manual",
};
const STATUS_LABEL = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  rejected: "Rechazada",
  completed: "Completada",
};

export const getBookingsForReport = async (req, res) => {
  try {
    const {
      complexId,
      courtId,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    if (!complexId)
      return res.status(400).json({ message: "complexId es requerido." });

    const complejo = await verificarOwner(
      complexId,
      req.user._id,
      req.user.role,
    );
    if (!complejo) return res.status(403).json({ message: "No autorizado." });

    const filtro = buildFiltro(complexId, courtId, startDate, endDate, status);
    const skip = (Number(page) - 1) * Number(limit);

    const [reservas, total] = await Promise.all([
      Booking.find(filtro)
        .populate("court", "name")
        .populate("player", "name email")
        .sort({ date: -1, startTime: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filtro),
    ]);

    const [ingresos, completadas, cancelaciones] = await Promise.all([
      Booking.aggregate([
        { $match: { ...filtro, status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.countDocuments({ ...filtro, status: "confirmed" }),
      Booking.countDocuments({ ...filtro, status: "cancelled" }),
    ]);

    const rows = reservas.map((r) => ({
      _id: r._id,
      nombre: nombreJugador(r),
      email: emailJugador(r),
      cancha: r.court?.name || "-",
      fecha: r.date,
      horario: `${r.startTime} - ${r.endTime}`,
      status: r.status,
      statusLabel: STATUS_LABEL[r.status] || r.status,
      pago: METODO_LABEL[r.confirmationMethod] || r.confirmationMethod,
      total: r.totalAmount,
    }));

    return res.json({
      bookings: rows,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      summary: {
        ingresos: ingresos[0]?.total || 0,
        completadas,
        cancelaciones,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener reportes.", error: error.message });
  }
};

export const exportBookings = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const { complexId, courtId, startDate, endDate, status, format } = params;

    if (!complexId)
      return res.status(400).json({ message: "complexId es requerido." });
    if (format !== "csv" && format !== "pdf")
      return res
        .status(400)
        .json({ message: 'format debe ser "csv" o "pdf".' });

    const complejo = await verificarOwner(
      complexId,
      req.user._id,
      req.user.role,
    );
    if (!complejo) return res.status(403).json({ message: "No autorizado." });

    const filtro = buildFiltro(complexId, courtId, startDate, endDate, status);

    const reservas = await Booking.find(filtro)
      .populate("court", "name")
      .populate("player", "name email")
      .sort({ date: 1, startTime: 1 })
      .lean();

    const reservasConNombre = reservas.map((r) => ({
      ...r,
      player: r.player || { name: nombreJugador(r), email: emailJugador(r) },
    }));

    if (format === "csv") {
      const csv = generateCsv(reservasConNombre);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="reservas-reporte.csv"',
      );
      return res.send(csv);
    }

    const pdfBuffer = generatePdf(reservasConNombre, {
      startDate,
      endDate,
      status,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reservas-reporte.pdf"',
    );
    return res.send(pdfBuffer);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error generando reporte.", error: error.message });
  }
};
