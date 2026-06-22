import Booking from '../models/Booking.js';
import Court from '../models/Court.js'
export const getMetrics = async (startDate, endDate) => {
  const filter = {};

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }

  const [
    totalReservas,
    reservasConfirmadas,
    ingresosResult,
    seniasResult,
    rankingCanchas,
    reservasPorPeriodo,
    reservasPorHora,
  ] = await Promise.all([
    Booking.countDocuments(filter),
    Booking.countDocuments({ ...filter, status: 'confirmed' }),
    Booking.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$depositAmount' } } },
    ]),
    Booking.aggregate([
  { $match: filter },

  {
    $group: {
      _id: '$court',
      reservas: { $sum: 1 },
    },
  },

  {
    $lookup: {
      from: 'courts',
      localField: '_id',
      foreignField: '_id',
      as: 'court',
    },
  },

  {
    $unwind: '$court',
  },

  {
    $project: {
      _id: 0,
      name: '$court.name',
      reservas: 1,
    },
  },

  {
    $sort: {
      reservas: -1,
    },
  },

  {
    $limit: 5,
  },
  ]),
    Booking.aggregate([
  { $match: filter },

  {
    $group: {
      _id: { $hour: "$date" },
      reservas: { $sum: 1 },
    },
  },

  {
    $project: {
      _id: 0,
      hora: {
        $concat: [
          { $toString: "$_id" },
          ":00",
        ],
      },
      reservas: 1,
    },
  },

  { $sort: { hora: 1 } },
]),
  ]);

  return {
    totalIngresos:     ingresosResult[0]?.total || 0,
    totalReservas,
    ingresosSenias:    seniasResult[0]?.total || 0,
    tasaConfirmacion:  totalReservas > 0
      ? ((reservasConfirmadas / totalReservas) * 100).toFixed(1)
      : 0,
    rankingCanchas,
    reservasPorPeriodo,
    reservasPorHora,
  };
};
