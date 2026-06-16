const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  try {
    const { court, complex, date, startTime, endTime, totalAmount, depositAmount, confirmationMethod } = req.body;

    if (!court || !complex || !date || !startTime || !endTime || !totalAmount || !depositAmount || !confirmationMethod) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const bookingDate = new Date(date);

    const conflict = await Booking.findOne({
      court,
      date: bookingDate,
      status: { $nin: ['cancelled'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json({ message: 'The court is already booked for the selected time slot.' });
    }

    const booking = await Booking.create({
      court,
      complex,
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

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating booking.', error: error.message });
  }
};

const getBookings = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet.' });
};

const cancelBooking = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet.' });
};

module.exports = { createBooking, getBookings, cancelBooking };
