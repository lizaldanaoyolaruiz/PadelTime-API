import MaintenanceSlot from "../models/MaintenanceSlot.js";
import Court from "../models/Court.js";
import Complex from "../models/Complex.js";

export const getMantenimientos = async (req, res) => {
  try {
    const { courtId, from, to } = req.query;

    const filtro = { isActive: true };
    if (courtId) filtro.court = courtId;
    if (from && to) {
      const fechas = [];
      const actual = new Date(from + "T00:00:00Z");
      const fin = new Date(to + "T00:00:00Z");
      while (actual <= fin) {
        fechas.push(actual.toISOString().split("T")[0]);
        actual.setUTCDate(actual.getUTCDate() + 1);
      }
      filtro.date = { $in: fechas };
    }

    const slots = await MaintenanceSlot.find(filtro)
      .populate("court", "name")
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.json({ slots });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error al obtener mantenimientos.",
        error: error.message,
      });
  }
};

export const crearMantenimiento = async (req, res) => {
  try {
    const { courtId, date, startTime, endTime, motivo } = req.body;

    if (!courtId || !date || !startTime || !endTime) {
      return res
        .status(400)
        .json({
          message:
            "Faltan campos requeridos: courtId, date, startTime, endTime.",
        });
    }

    const cancha = await Court.findById(courtId);
    if (!cancha)
      return res.status(404).json({ message: "Cancha no encontrada." });

    if (req.user.role === "admin") {
      const complejo = await Complex.findOne({
        _id: cancha.complex,
        owner: req.user._id,
      });
      if (!complejo)
        return res.status(403).json({ message: "Acceso denegado." });
    }

    const slot = await MaintenanceSlot.create({
      court: courtId,
      complex: cancha.complex,
      date,
      startTime,
      endTime,
      motivo: motivo || "Mantenimiento",
    });

    return res.status(201).json({ slot });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error al crear el mantenimiento.",
        error: error.message,
      });
  }
};

export const eliminarMantenimiento = async (req, res) => {
  try {
    const slot = await MaintenanceSlot.findById(req.params.id);
    if (!slot)
      return res
        .status(404)
        .json({ message: "Slot de mantenimiento no encontrado." });

    if (req.user.role === "admin") {
      const complejo = await Complex.findOne({
        _id: slot.complex,
        owner: req.user._id,
      });
      if (!complejo)
        return res.status(403).json({ message: "Acceso denegado." });
    }

    await slot.deleteOne();
    return res.json({ message: "Mantenimiento eliminado." });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error al eliminar el mantenimiento.",
        error: error.message,
      });
  }
};
