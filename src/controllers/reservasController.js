import Reserva from '../models/Reserva.js';
import Cancha from '../models/Cancha.js';
import Complejo from '../models/Complejo.js';
import {
  enviarConfirmacionReserva,
  enviarRechazoReserva,
  enviarCancelacionReserva,
} from '../services/emailService.js';

// Owner: obtener reservas de su complejo (filtros: cancha, fecha, estado)
export const getReservasOwner = async (req, res) => {
  try {
    const complejo = await Complejo.findOne({ owner: req.user._id });
    if (!complejo) {
      return res.status(404).json({ mensaje: 'No tenés un complejo registrado.' });
    }

    const filtro = { complejo: complejo._id };

    if (req.query.cancha) filtro.cancha = req.query.cancha;
    if (req.query.estado) filtro.estado = req.query.estado;

    if (req.query.fecha) {
      const inicio = new Date(req.query.fecha);
      inicio.setUTCHours(0, 0, 0, 0);
      const fin = new Date(req.query.fecha);
      fin.setUTCHours(23, 59, 59, 999);
      filtro.fecha = { $gte: inicio, $lte: fin };
    }

    const reservas = await Reserva.find(filtro)
      .populate('cancha', 'nombre tipo')
      .populate('jugador', 'nombre apellido email')
      .sort({ fecha: 1, horaInicio: 1 });

    res.json(reservas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener reservas.', error: err.message });
  }
};

// Jugador: obtener sus propias reservas
export const getReservasJugador = async (req, res) => {
  try {
    const reservas = await Reserva.find({ jugador: req.user._id })
      .populate('cancha', 'nombre tipo foto')
      .populate('complejo', 'name location city')
      .sort({ fecha: -1 });

    res.json(reservas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener reservas.', error: err.message });
  }
};

// Owner: crear una reserva manual (sin usuario registrado)
export const crearReservaOwner = async (req, res) => {
  try {
    const { canchaId, fecha, horaInicio, jugadorNombre, jugadorApellido, jugadorEmail, jugadorTelefono, observaciones } = req.body;

    if (!canchaId || !fecha || !horaInicio || !jugadorNombre || !jugadorEmail) {
      return res.status(400).json({ mensaje: 'canchaId, fecha, horaInicio, jugadorNombre y jugadorEmail son obligatorios.' });
    }

    const complejo = await Complejo.findOne({ owner: req.user._id });
    if (!complejo) return res.status(404).json({ mensaje: 'No tenés un complejo registrado.' });

    const cancha = await Cancha.findById(canchaId);
    if (!cancha) return res.status(404).json({ mensaje: 'Cancha no encontrada.' });
    if (String(cancha.complejo) !== String(complejo._id)) {
      return res.status(403).json({ mensaje: 'La cancha no pertenece a tu complejo.' });
    }
    if (!cancha.habilitada) return res.status(400).json({ mensaje: 'La cancha no está disponible.' });

    // Calcular horaFin sumando 90 minutos
    const [h, m] = horaInicio.split(':').map(Number);
    const finTotal = h * 60 + m + 90;
    const horaFin = `${String(Math.floor(finTotal / 60)).padStart(2, '0')}:${String(finTotal % 60).padStart(2, '0')}`;

    const fechaReserva = new Date(fecha);
    fechaReserva.setUTCHours(12, 0, 0, 0);

    const conflicto = await Reserva.findOne({
      cancha: canchaId,
      fecha: fechaReserva,
      horaInicio,
      estado: { $nin: ['rechazada', 'cancelada'] },
    });
    if (conflicto) return res.status(400).json({ mensaje: 'Ese turno ya está reservado.' });

    const montoTotal = cancha.precio_por_hora * 1.5;

    const reserva = await Reserva.create({
      cancha: canchaId,
      complejo: complejo._id,
      jugadorInfo: { nombre: jugadorNombre, apellido: jugadorApellido, email: jugadorEmail, telefono: jugadorTelefono },
      fecha: fechaReserva,
      horaInicio,
      horaFin,
      montoTotal,
      observaciones,
    });

    await reserva.populate('cancha', 'nombre tipo');

    res.status(201).json({ mensaje: 'Reserva creada.', reserva });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ mensaje: 'Ese turno ya está reservado.' });
    res.status(500).json({ mensaje: 'Error al crear la reserva.', error: err.message });
  }
};

// Jugador: crear una reserva
export const crearReserva = async (req, res) => {
  try {
    const { canchaId, fecha, horaInicio, horaFin } = req.body;

    if (!canchaId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ mensaje: 'canchaId, fecha, horaInicio y horaFin son requeridos.' });
    }

    const cancha = await Cancha.findById(canchaId);
    if (!cancha || !cancha.habilitada) {
      return res.status(404).json({ mensaje: 'La cancha no existe o no está disponible.' });
    }

    const fechaReserva = new Date(fecha);
    fechaReserva.setUTCHours(12, 0, 0, 0);

    // Verificar que no haya otra reserva activa en el mismo turno
    const conflicto = await Reserva.findOne({
      cancha: canchaId,
      fecha: fechaReserva,
      horaInicio,
      estado: { $nin: ['rechazada', 'cancelada'] },
    });

    if (conflicto) {
      return res.status(409).json({ mensaje: 'Ese turno ya está reservado.' });
    }

    const montoTotal = cancha.precio_por_hora;

    const reserva = await Reserva.create({
      cancha: canchaId,
      complejo: cancha.complejo,
      jugador: req.user._id,
      fecha: fechaReserva,
      horaInicio,
      horaFin,
      montoTotal,
    });

    await reserva.populate('cancha', 'nombre tipo');
    await reserva.populate('complejo', 'name');

    res.status(201).json({ mensaje: 'Reserva creada. Esperando confirmación del complejo.', reserva });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ mensaje: 'Ese turno ya está reservado.' });
    }
    res.status(500).json({ mensaje: 'Error al crear la reserva.', error: err.message });
  }
};

// Owner: confirmar una reserva pendiente
export const confirmarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('cancha', 'nombre')
      .populate('complejo', 'name owner')
      .populate('jugador', 'nombre apellido email');

    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada.' });

    if (String(reserva.complejo.owner) !== String(req.user._id)) {
      return res.status(403).json({ mensaje: 'No tenés permisos sobre esta reserva.' });
    }

    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: `La reserva ya está ${reserva.estado}.` });
    }

    reserva.estado = 'confirmada';
    await reserva.save();

    await enviarConfirmacionReserva(reserva.jugador, reserva);

    res.json({ mensaje: 'Reserva confirmada.', reserva });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al confirmar la reserva.', error: err.message });
  }
};

// Owner: rechazar una reserva pendiente
export const rechazarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('cancha', 'nombre')
      .populate('complejo', 'name owner')
      .populate('jugador', 'nombre apellido email');

    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada.' });

    if (String(reserva.complejo.owner) !== String(req.user._id)) {
      return res.status(403).json({ mensaje: 'No tenés permisos sobre esta reserva.' });
    }

    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: `La reserva ya está ${reserva.estado}.` });
    }

    reserva.estado = 'rechazada';
    reserva.notaOwner = req.body.nota || '';
    await reserva.save();

    await enviarRechazoReserva(reserva.jugador, reserva);

    res.json({ mensaje: 'Reserva rechazada.', reserva });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al rechazar la reserva.', error: err.message });
  }
};

// Jugador u owner: cancelar una reserva
export const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('cancha', 'nombre')
      .populate('complejo', 'name owner')
      .populate('jugador', 'nombre apellido email');

    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada.' });

    const esJugador = String(reserva.jugador._id) === String(req.user._id);
    const esOwner = String(reserva.complejo.owner) === String(req.user._id);

    if (!esJugador && !esOwner) {
      return res.status(403).json({ mensaje: 'No tenés permisos sobre esta reserva.' });
    }

    if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
      return res.status(400).json({ mensaje: `No se puede cancelar una reserva ${reserva.estado}.` });
    }

    reserva.estado = 'cancelada';
    await reserva.save();

    await enviarCancelacionReserva(reserva.jugador, reserva);

    res.json({ mensaje: 'Reserva cancelada.', reserva });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cancelar la reserva.', error: err.message });
  }
};
