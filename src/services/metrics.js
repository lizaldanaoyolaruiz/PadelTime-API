const Reserva = require("../models/Reserva");

const getMetrics = async (startDate, endDate) => {
  const filter = {};

  if (startDate || endDate) {
    filter.fecha = {};

    if (startDate) {
      filter.fecha.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.fecha.$lte = new Date(endDate);
    }
  }

  const totalReservas = await Reserva.countDocuments(filter);

  const reservasConfirmadas = await Reserva.countDocuments({
    ...filter,
    estado: "confirmada",
  });

  const ingresosResult = await Reserva.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: "$montoTotal" },
      },
    },
  ]);

  const seniasResult = await Reserva.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: "$montoSena" },
      },
    },
  ]);

  const rankingCanchas = await Reserva.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$cancha",
        reservas: { $sum: 1 },
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
  ]);

  const reservasPorPeriodo = await Reserva.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$fecha",
          },
        },
        reservas: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return {
    totalIngresos: ingresosResult[0]?.total || 0,
    totalReservas,
    ingresosSenias: seniasResult[0]?.total || 0,
    tasaConfirmacion:
      totalReservas > 0
        ? ((reservasConfirmadas / totalReservas) * 100).toFixed(1)
        : 0,
    rankingCanchas,
    reservasPorPeriodo,
  };
};

module.exports = {
  getMetrics,
};