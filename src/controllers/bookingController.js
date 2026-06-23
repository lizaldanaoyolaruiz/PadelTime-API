import Booking from '../models/Booking.js';
import Complex from '../models/Complex.js';
import Court from '../models/Court.js';
import Blockout from '../models/Blockout.js';
import MaintenanceSlot from '../models/MaintenanceSlot.js';
import { createPreference } from '../services/mpService.js';
import { sendBookingConfirmedByOwnerEmail, sendBookingRejectedEmail } from '../services/emailService.js';

const padHour = (h) => String(h).padStart(2, '0') + ':00';

const sumarUnaHora = (hhmm) => {
  const [h, m] = hhmm.split(':');
  return String(parseInt(h) + 1).padStart(2, '0') + ':' + (m || '00');
};

const getDiaSemana = (fechaStr) => {
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const d = new Date(fechaStr + 'T00:00:00Z');
  return dias[d.getUTCDay()];
};

const DIA_A_SCHEDULE = {
  lunes: 'monday', martes: 'tuesday', miercoles: 'wednesday',
  jueves: 'thursday', viernes: 'friday', sabado: 'saturday', domingo: 'sunday',
};

const generarFechas = (from, to) => {
  const fechas = [];
  const actual = new Date(from + 'T00:00:00Z');
  const fin = new Date(to + 'T00:00:00Z');
  while (actual <= fin) {
    fechas.push(actual.toISOString().split('T')[0]);
    actual.setUTCDate(actual.getUTCDate() + 1);
  }
  return fechas;
};

export const getSlots = async (req, res) => {
  try {
    const { courtId, from, to } = req.query;

    if (!courtId || !from || !to) {
      return res.status(400).json({ message: 'Se requieren courtId, from y to.' });
    }

    const cancha = await Court.findById(courtId).lean();
    if (!cancha) {
      return res.status(404).json({ message: 'Cancha no encontrada.' });
    }

    const fechas = generarFechas(from, to);

    const [reservas, blockouts, mantenimientos] = await Promise.all([
      Booking.find({
        court: courtId,
        date: { $in: fechas },
        status: { $in: ['pending', 'confirmed'] },
      })
        .select('date startTime endTime status')
        .lean(),
      Blockout.find({
        complexId: cancha.complex,
        isActive: true,
        $or: [{ courtId: null }, { courtId: cancha._id }],
      }).lean(),
      MaintenanceSlot.find({
        court: courtId,
        date: { $in: fechas },
        isActive: true,
      })
        .select('date startTime endTime')
        .lean(),
    ]);

    const slots = [];

    for (const fecha of fechas) {
      const diaSemana = getDiaSemana(fecha);
      const scheduleKey = DIA_A_SCHEDULE[diaSemana];
      const daySchedule = cancha.schedule?.[scheduleKey];

      if (!daySchedule?.enabled) continue;

      const startHour = parseInt(daySchedule.start?.split(':')[0] ?? 7);
      const endHour = parseInt(daySchedule.end?.split(':')[0] ?? 22);

      for (let hora = startHour; hora < endHour; hora++) {
        const horaStr = padHour(hora);
        const horaFinStr = padHour(hora + 1);

        const reservaEnSlot = reservas.find(
          (r) => r.date === fecha && r.startTime < horaFinStr && r.endTime > horaStr
        );

        let statusSlot;
        let blockoutInfo = null;
        if (reservaEnSlot) {
          statusSlot = reservaEnSlot.status === 'confirmed' ? 'reservado' : 'pendiente';
        } else {
          const matchedMaint = mantenimientos.find(
            (m) => m.date === fecha && m.startTime < horaFinStr && m.endTime > horaStr
          );
          if (matchedMaint) {
            statusSlot = 'mantenimiento';
            blockoutInfo = { name: 'Mantenimiento', start: matchedMaint.startTime, end: matchedMaint.endTime };
          } else {
            const matchedBlockout = blockouts.find((b) => {
              if (b.recurrence === 'once') return b.date === fecha && b.startTime < horaFinStr && b.endTime > horaStr;
              if (b.recurrence === 'weekly' && b.dayOfWeek !== diaSemana) return false;
              return b.startTime < horaFinStr && b.endTime > horaStr;
            });
            if (matchedBlockout) {
              statusSlot = 'mantenimiento';
              blockoutInfo = { name: matchedBlockout.name, start: matchedBlockout.startTime, end: matchedBlockout.endTime };
            } else {
              statusSlot = 'disponible';
            }
          }
        }

        const statusFinal =
          req.query.vista === 'publica' && statusSlot === 'pendiente'
            ? 'reservado'
            : statusSlot;

        const slot = { courtId, date: fecha, hour: hora, status: statusFinal };
        if (blockoutInfo && statusFinal === 'mantenimiento') slot.blockout = blockoutInfo;
        slots.push(slot);
      }
    }

    return res.json(slots);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los slots.', error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { status, date, courtId } = req.query;
    const usuario = req.user;

    const filtro = {};

    if (usuario.role === 'player') {
      filtro.player = usuario._id;
    } else if (usuario.role === 'admin') {
      const complejos = await Complex.find({ owner: usuario._id }).select('_id').lean();
      filtro.complex = { $in: complejos.map((c) => c._id) };
    }

    if (status) filtro.status = status;
    if (date) filtro.date = date;
    if (courtId) filtro.court = courtId;

    const reservas = await Booking.find(filtro)
      .populate('court', '_id name')
      .populate('complex', '_id whatsapp')
      .populate('player', '_id name')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ bookings: reservas });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las reservas.', error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const esFlujAdmin = !!req.body.canchaId;

    if (esFlujAdmin && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    const courtId = req.body.court || req.body.canchaId;
    const fecha = req.body.date || req.body.fecha;
    const horaInicio = req.body.startTime || req.body.horaInicio;
    const horaFin = req.body.endTime || (horaInicio ? sumarUnaHora(horaInicio) : undefined);
    const metodo = req.body.confirmationMethod || 'manual';
    const observaciones = req.body.observaciones;

    if (!courtId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ message: 'Faltan campos requeridos: cancha, fecha y hora de inicio.' });
    }

    if (horaInicio >= horaFin) {
      return res.status(400).json({ message: 'La hora de inicio debe ser anterior a la hora de fin.' });
    }

    const fechaHoraInicio = new Date(`${fecha}T${horaInicio}:00`);
    if (fechaHoraInicio <= new Date()) {
      return res.status(400).json({ message: 'No se puede reservar en una fecha y hora pasada.' });
    }

    const cancha = await Court.findById(courtId);
    if (!cancha) return res.status(404).json({ message: 'La cancha no existe.' });
    if (!cancha.enabled) return res.status(400).json({ message: 'La cancha no está disponible.' });

    const complejo = await Complex.findById(cancha.complex).select('+mpAccessToken');

    if (complejo?.openTime && complejo?.closeTime) {
      if (horaInicio < complejo.openTime || horaFin > complejo.closeTime) {
        return res
          .status(400)
          .json({ message: 'El horario está fuera del horario del complejo.' });
      }
    }

    const conflicto = await Booking.findOne({
      court: courtId,
      date: fecha,
      status: { $nin: ['cancelled', 'rejected'] },
      startTime: { $lt: horaFin },
      endTime: { $gt: horaInicio },
    });

    if (conflicto) {
      return res.status(409).json({ message: 'El horario ya está ocupado para esa cancha.' });
    }

    const datosReserva = {
      court: courtId,
      complex: cancha.complex,
      date: fecha,
      startTime: horaInicio,
      endTime: horaFin,
      status: 'pending',
      confirmationMethod: metodo,
      observaciones,
    };

    if (esFlujAdmin) {
      datosReserva.jugadorExterno = {
        nombre: req.body.jugadorNombre,
        apellido: req.body.jugadorApellido,
        email: req.body.jugadorEmail,
        telefono: req.body.jugadorTelefono,
      };
      datosReserva.totalAmount = req.body.totalAmount || 0;
      datosReserva.depositAmount = req.body.depositAmount || 0;
    } else {
      datosReserva.player = req.user._id;
      datosReserva.totalAmount = req.body.totalAmount || 0;
      const pct = complejo?.depositPercentage || 30;
      datosReserva.depositAmount =
        req.body.depositAmount !== undefined
          ? req.body.depositAmount
          : Math.round(datosReserva.totalAmount * (pct / 100) * 100) / 100;
    }

    const reserva = await Booking.create(datosReserva);

    await reserva.populate([
      { path: 'court', select: '_id name' },
      { path: 'complex', select: '_id whatsapp' },
      { path: 'player', select: '_id name' },
    ]);

    if (esFlujAdmin) {
      return res.status(201).json({ booking: reserva });
    }

    if (metodo === 'whatsapp') {
      return res.status(201).json({
        booking: reserva,
        complex: { whatsapp: complejo?.whatsapp || null },
      });
    }

    if (!complejo?.mpAccessToken || !complejo?.mercadopagoActive) {
      return res.status(201).json({ booking: reserva, payment: null });
    }

    try {
      const preferencia = await createPreference(complejo.mpAccessToken, {
        booking: reserva,
        complex: complejo,
        court: reserva.court,
      });

      reserva.preferenceId = preferencia.id;
      await reserva.save();

      return res.status(201).json({
        booking: reserva,
        payment: { initPoint: preferencia.init_point },
      });
    } catch (mpError) {
      console.error('[MP] Error creando preferencia:', mpError.message);
      return res.status(201).json({ booking: reserva, payment: null });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la reserva.', error: error.message });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const { from, to, courtId } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'Se requieren from y to.' });
    }

    const fechas = generarFechas(from, to);

    const filtro = {
      date: { $in: fechas },
      status: { $in: ['pending', 'confirmed'] },
    };

    if (courtId) {
      filtro.court = courtId;
    } else if (req.user.role === 'admin') {
      const complejos = await Complex.find({ owner: req.user._id }).select('_id').lean();
      filtro.complex = { $in: complejos.map((c) => c._id) };
    }

    const reservas = await Booking.find(filtro).lean();

    const totalSlots = fechas.length * 16;
    const occupancyRate = totalSlots > 0 ? Math.round((reservas.length / totalSlots) * 100) : 0;

    const estimatedRevenue = reservas
      .filter((r) => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    const jugadoresUnicos = new Set(
      reservas.filter((r) => r.player).map((r) => r.player.toString())
    ).size;

    return res.json({ occupancyRate, estimatedRevenue, newPlayers: jugadoresUnicos });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener estadísticas.', error: error.message });
  }
};

export const confirmarPago = async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });

    if (reserva.confirmationMethod !== 'mercadopago') {
      return res.status(400).json({ message: 'Esta reserva no es de MercadoPago.' });
    }

    if (reserva.status === 'confirmed') {
      await reserva.populate([
        { path: 'court', select: '_id name' },
        { path: 'complex', select: '_id whatsapp' },
        { path: 'player', select: '_id name' },
      ]);
      return res.json({ booking: reserva });
    }

    if (reserva.status === 'cancelled' || reserva.status === 'rejected') {
      return res.status(400).json({ message: 'La reserva fue cancelada o rechazada.' });
    }

    reserva.status = 'confirmed';
    await reserva.save();

    await reserva.populate([
      { path: 'court', select: '_id name' },
      { path: 'complex', select: '_id whatsapp' },
      { path: 'player', select: '_id name' },
    ]);

    return res.json({ booking: reserva });
  } catch (error) {
    return res.status(500).json({ message: 'Error al confirmar el pago.', error: error.message });
  }
};

export const confirmarReserva = async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });

    if (req.user.role === 'admin') {
      const complejo = await Complex.findOne({ _id: reserva.complex, owner: req.user._id });
      if (!complejo) return res.status(403).json({ message: 'Acceso denegado.' });
    }

    reserva.status = 'confirmed';
    await reserva.save();

    await reserva.populate([
      { path: 'court', select: '_id name' },
      { path: 'complex', select: '_id name whatsapp' },
      { path: 'player', select: '_id name email' },
    ]);

    sendBookingConfirmedByOwnerEmail(reserva).catch((err) =>
      console.error('[Email] Error enviando confirmación:', err.message)
    );

    return res.json({ booking: reserva });
  } catch (error) {
    return res.status(500).json({ message: 'Error al confirmar la reserva.', error: error.message });
  }
};

export const rechazarReserva = async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });

    if (req.user.role === 'admin') {
      const complejo = await Complex.findOne({ _id: reserva.complex, owner: req.user._id });
      if (!complejo) return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const motivo = req.body.reason || '';
    reserva.status = 'rejected';
    if (motivo) reserva.observaciones = motivo;
    await reserva.save();

    await reserva.populate([
      { path: 'court', select: '_id name' },
      { path: 'complex', select: '_id name whatsapp' },
      { path: 'player', select: '_id name email' },
    ]);

    sendBookingRejectedEmail(reserva, motivo).catch((err) =>
      console.error('[Email] Error enviando rechazo:', err.message)
    );

    return res.json({ booking: reserva });
  } catch (error) {
    return res.status(500).json({ message: 'Error al rechazar la reserva.', error: error.message });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Booking.findById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada.' });

    const esAdmin = ['admin', 'superadmin'].includes(req.user.role);
    const esJugadorDueno =
      req.user.role === 'player' && reserva.player && reserva.player.equals(req.user._id);

    if (!esAdmin && !esJugadorDueno) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (esAdmin && req.user.role === 'admin') {
      const complejo = await Complex.findOne({ _id: reserva.complex, owner: req.user._id });
      if (!complejo) return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (reserva.status === 'cancelled') {
      return res.status(400).json({ message: 'La reserva ya está cancelada.' });
    }

    reserva.status = 'cancelled';
    await reserva.save();

    await reserva.populate([
      { path: 'court', select: '_id name' },
      { path: 'complex', select: '_id whatsapp' },
      { path: 'player', select: '_id name' },
    ]);

    return res.json({ booking: reserva });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cancelar la reserva.', error: error.message });
  }
};
