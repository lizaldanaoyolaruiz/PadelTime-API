import Booking from '../models/Booking.js';
import Complex from '../models/Complex.js';
import { createPreference } from '../services/mpService.js';

export const createBooking = async (req, res) => {
  try {
    const {
      court,
      complex: complexId,
      date,
      startTime,
      endTime,
      totalAmount,
      confirmationMethod,
    } = req.body;

    if (!court || !complexId || !date || !startTime || !endTime || !totalAmount || !confirmationMethod) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const complex = await Complex.findById(complexId).select('+mpAccessToken');

    const depositAmount = complex
      ? Math.round(totalAmount * (complex.depositPercentage / 100) * 100) / 100
      : (Number(req.body.depositAmount) || Math.round(totalAmount * 0.3 * 100) / 100);

    if (!complex) {
      console.warn(`[Booking] Complex not found for id: ${complexId} — skipping MP flow.`);
    }

    const bookingDate = new Date(date);

    const conflict = await Booking.findOne({
      court,
      date: bookingDate,
      $or: [
        { status: 'confirmed' },
        { status: 'completed' },
        { status: 'pending', confirmationMethod: 'whatsapp' },
      ],
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json({ message: 'La cancha ya está reservada para ese horario.' });
    }

    const booking = await Booking.create({
      court,
      complex: complexId,
      player: req.user._id,
      date: bookingDate,
      startTime,
      endTime,
      totalAmount,
      depositAmount,
      confirmationMethod,
      status: 'pending',
    });

    await booking.populate([
      { path: 'court', select: 'name type' },
      { path: 'complex', select: 'name location city whatsapp' },
    ]);

    if (confirmationMethod !== 'mercadopago') {
      return res.status(201).json(booking);
    }

    if (!complex?.mpAccessToken) {
      return res.status(201).json(booking);
    }

    try {
      const preference = await createPreference(complex.mpAccessToken, {
        booking,
        complex,
        court: booking.court,
      });

      booking.preferenceId = preference.id;
      await booking.save();

      return res.status(201).json({
        ...booking.toObject(),
        payment: { initPoint: preference.init_point },
      });
    } catch (mpError) {
      console.error('[MP] createPreference error:', mpError.message);
      return res.status(201).json(booking);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la reserva.', error: error.message });
  }
};

export const getBookings = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet.' });
};

export const cancelBooking = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet.' });
};
