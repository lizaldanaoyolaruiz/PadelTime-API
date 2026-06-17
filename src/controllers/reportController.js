import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Complex from '../models/Complex.js';
import { generateCsv, generatePdf } from '../services/exportService.js';

const buildDateRangeFilter = (startDate, endDate) => {
  const range = {};
  if (startDate) range.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
};

export const exportBookings = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const { complexId, courtId, startDate, endDate, status, format } = params;

    if (!complexId || !mongoose.Types.ObjectId.isValid(complexId)) {
      return res.status(400).json({ message: 'complexId is required.' });
    }

    if (format !== 'csv' && format !== 'pdf') {
      return res.status(400).json({ message: 'format must be "csv" or "pdf".' });
    }

    const complex = await Complex.findById(complexId);
    if (!complex) return res.status(404).json({ message: 'Complex not found.' });

    if (complex.owner.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to export reports for this complex.' });
    }

    const filter = { complex: complexId };
    if (courtId) filter.court = courtId;
    if (status) filter.status = status;
    if (startDate || endDate) filter.date = buildDateRangeFilter(startDate, endDate);

    const bookings = await Booking.find(filter)
      .populate('court', 'name')
      .populate('player', 'name email')
      .sort({ date: 1, startTime: 1 });

    if (format === 'csv') {
      const csv = generateCsv(bookings);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.csv"');
      return res.send(csv);
    }

    const pdfBuffer = generatePdf(bookings, { startDate, endDate, status });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.pdf"');
    return res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Error generating report.', error: error.message });
  }
};
