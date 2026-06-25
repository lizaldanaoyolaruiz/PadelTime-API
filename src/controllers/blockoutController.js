import Blockout from "../models/Blockout.js";
import Complex from "../models/Complex.js";
import Court from "../models/Court.js";

async function getBlockouts(req, res) {
  try {
    let complexId;
    if (req.user.role === "superadmin") {
      if (!req.query.complexId) {
        return res.status(400).json({
          massage: "se requiere compleId en la query para superadmin",
        });
      }
      complexId = req.query.complexId;
    } else {
      complexId = req.user.complexId;
      if (!complexId) {
        const owned = await Complex.findOne({ owner: req.user._id });
        if (!owned) return res.status(403).json({ message: 'Usuario sin complejo asignado' });
        complexId = owned._id;
      }
    }
    const blockouts = await Blockout.find({ complexId });
    res.json(blockouts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function createBlockout(req, res) {
  try {
    let complexId;
    if (req.user.role === "superadmin") {
      if (!req.body.complexId) {
        return res.status(400).json({
          message: "se requiere complexId en el body para superadmin",
        });
      }
      complexId = req.body.complexId;
    } else {
      complexId = req.user.complexId;
      if (!complexId) {
        const owned = await Complex.findOne({ owner: req.user._id });
        if (!owned) return res.status(403).json({ message: 'Usuario sin complejo asignado' });
        complexId = owned._id;
      }
    }
    const { name, recurrence, dayOfWeek, date, startTime, endTime, courtId } =
      req.body;
    if (!name || !recurrence || !startTime || !endTime) {
      return res.status(400).json({
        message: "Faltan campos obligatorios (name, recurrence, startTime, endTime)",
      });
    }
    if (recurrence === "weekly" && !dayOfWeek) {
      return res.status(400).json({
        message: "Para bloqueos semanales, dayOfWeek es obligatorio",
      });
    }
    if (recurrence === "once" && !date) {
      return res.status(400).json({
        message: "Para bloqueos de fecha específica, date es obligatorio (YYYY-MM-DD)",
      });
    }
    if (courtId) {
      const court = await Court.findById(courtId);
      if (!court) {
        return res.status(403).json({ message: "La cancha no existe" });
      }
      if (court.complex.toString() !== complexId.toString()) {
        return res.status(400).json({ message: "La cancha no pertenece a este complejo" });
      }
    }
    const blockouts = await Blockout.create({
      complexId,
      name,
      recurrence,
      dayOfWeek: recurrence === "weekly" ? dayOfWeek : null,
      date: recurrence === "once" ? date : null,
      startTime,
      endTime,
      courtId: courtId || null,
    });
    res.status(201).json(blockouts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function updateBlockout(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existBlockout = await Blockout.findById(id);
    if (!existBlockout) {
      return res.status(404).json({
        massage: "Bloqueo no encontrado",
      });
    }
    if (req.user.role === "admin") {
      const userComplexId = req.user.complexId || (await Complex.findOne({ owner: req.user._id }))?._id;
      if (!userComplexId || existBlockout.complexId.toString() !== userComplexId.toString()) {
        return res.status(403).json({
          massage: "No tienes permiso para modificar este bloqueo",
        });
      }
    } else if (req.user.role === "superadmin") {
      if (updates.complexId) {
        const complexExists = await Complex.findById(updates.complexId);
        if (!complexExists) {
          return res.status(400).json({
            massage: "El complexId proporcionado no existe",
          });
        }
      }
    } else {
      return res.status(403).json({
        massage: "rol no autorixado para esta opcion",
      });
    }
    const alloweUpdates = [
      "name",
      "recurrence",
      "dayOfWeek",
      "date",
      "startTime",
      "endTime",
      "courtId",
      "isActive",
    ];
    const updateData = alloweUpdates.reduce((acc, key) => {
      if (req.body[key] !== undefined) acc[key] = req.body[key];
      return acc;
    }, {});

    if (updateData.recurrence === "daily") {
      updateData.dayOfWeek = null;
    }
    if (updateData.courtId) {
      const court = await Court.findById(updateData.courtId);
      if (!court) {
        return res.status(400).json({ message: 'La cancha no existe' });
      }
     
      const finalComplexId = updateData.complexId || existBlockout.complexId;
      if (court.complex.toString() !== finalComplexId.toString()) {
        return res.status(400).json({ message: 'La cancha no pertenece a este complejo' });
      }
    }
    const updatedBlockout = await Blockout.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updatedBlockout);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error en el servidor",
    });
  }
}

export const deleteBlockout = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBlockout = await Blockout.findById(id);
    if (!existingBlockout) {
      return res.status(404).json({ message: 'Bloqueo no encontrado' });
    }

    if (req.user.role === 'admin') {
      const userComplexId = req.user.complexId || (await Complex.findOne({ owner: req.user._id }))?._id;
      if (!userComplexId || existingBlockout.complexId.toString() !== userComplexId.toString()) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este bloqueo' });
      }
    } else if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Rol no autorizado' });
    }

    await Blockout.findByIdAndDelete(id);
    res.json({ message: 'Bloqueo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
    getBlockouts,
    createBlockout,
    updateBlockout
}