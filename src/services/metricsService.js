import Booking from '../models/Booking.js';
import Complex from '../models/Complex.js';

const DAY_NAMES  = ['', 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTH_NAMES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const toISO = (d) => d.toISOString().split('T')[0];

const getDateRange = (periodo) => {
  const now = new Date();

  if (periodo === 'semana') {
    const from = new Date(now); from.setDate(from.getDate() - 6);
    return { from: toISO(from), to: toISO(now) };
  }
  if (periodo === 'mes') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toISO(from), to: toISO(now) };
  }
  if (periodo === 'año') {
    return { from: `${now.getFullYear()}-01-01`, to: toISO(now) };
  }
  return null;
};

const getPrevDateRange = (periodo, currentFrom, currentTo) => {
  const from = new Date(currentFrom + 'T00:00:00');
  const to   = new Date(currentTo   + 'T00:00:00');
  const diffMs = to - from + 86400000; // inclusive days in ms

  if (periodo === 'semana') {
    const prevTo   = new Date(from); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - 6);
    return { from: toISO(prevFrom), to: toISO(prevTo) };
  }
  if (periodo === 'mes') {
    const prevTo   = new Date(from); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo.getFullYear(), prevTo.getMonth(), 1);
    return { from: toISO(prevFrom), to: toISO(prevTo) };
  }
  if (periodo === 'año') {
    const y = from.getFullYear() - 1;
    return { from: `${y}-01-01`, to: `${y}-12-31` };
  }
  // personalizado: mismo rango hacia atrás
  const prevTo   = new Date(from); prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo.getTime() - diffMs + 86400000);
  return { from: toISO(prevFrom), to: toISO(prevTo) };
};

const calcTrend = (current, prev) => {
  if (!prev || prev === 0) return null;
  const pct = ((current - prev) / prev) * 100;
  return parseFloat(pct.toFixed(1));
};

export const getMetrics = async ({ ownerId, periodo = 'mes', startDate, endDate } = {}) => {
  // ── Owner's complexes ──────────────────────────────────────────────────────
  const filter = ownerId ? { owner: ownerId } : {};
  const complejos   = await Complex.find(filter).select('_id').lean();
  const complexIds  = complejos.map(c => c._id);

  if (complexIds.length === 0) {
    return emptyMetrics();
  }

  // ── Date range ─────────────────────────────────────────────────────────────
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = { $gte: startDate, $lte: endDate };
  } else {
    const range = getDateRange(periodo);
    if (range) dateFilter = { $gte: range.from, $lte: range.to };
  }

  const baseFilter = { complex: { $in: complexIds } };
  if (Object.keys(dateFilter).length) baseFilter.date = dateFilter;

  const confirmedFilter = { ...baseFilter, status: { $in: ['confirmed', 'completed'] } };

  // ── Previous period for trends ─────────────────────────────────────────────
  const currentFrom = Object.keys(dateFilter).length ? dateFilter.$gte : null;
  const currentTo   = Object.keys(dateFilter).length ? dateFilter.$lte : null;

  let prevBaseFilter = null;
  let prevConfirmedFilter = null;

  if (currentFrom && currentTo) {
    const prev = getPrevDateRange(periodo, currentFrom, currentTo);
    prevBaseFilter      = { complex: { $in: complexIds }, date: { $gte: prev.from, $lte: prev.to } };
    prevConfirmedFilter = { ...prevBaseFilter, status: { $in: ['confirmed', 'completed'] } };
  }

  // ── Aggregations ───────────────────────────────────────────────────────────
  const [
    totalReservas,
    reservasConfirmadas,
    ingresosResult,
    seniasResult,
    prevTotalReservas,
    prevReservasConfirmadas,
    prevIngresosResult,
    prevSeniasResult,
    rankingCanchas,
    reservasPorPeriodoRaw,
    heatmapRaw,
  ] = await Promise.all([

    Booking.countDocuments(baseFilter),
    Booking.countDocuments(confirmedFilter),

    // Total ingresos (reservas pagadas)
    Booking.aggregate([
      { $match: confirmedFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),

    // Señas cobradas
    Booking.aggregate([
      { $match: confirmedFilter },
      { $group: { _id: null, total: { $sum: '$depositAmount' } } },
    ]),

    // ── Previous period ──────────────────────────────────────────────────────
    ...(prevBaseFilter ? [
      Booking.countDocuments(prevBaseFilter),
      Booking.countDocuments(prevConfirmedFilter),
      Booking.aggregate([
        { $match: prevConfirmedFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: prevConfirmedFilter },
        { $group: { _id: null, total: { $sum: '$depositAmount' } } },
      ]),
    ] : [
      Promise.resolve(0),
      Promise.resolve(0),
      Promise.resolve([]),
      Promise.resolve([]),
    ]),

    // Ranking de canchas
    Booking.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$court', reservas: { $sum: 1 } } },
      {
        $lookup: {
          from: 'courts',
          localField: '_id',
          foreignField: '_id',
          as: 'court',
        },
      },
      { $unwind: '$court' },
      { $project: { _id: 0, name: '$court.name', reservas: 1 } },
      { $sort: { reservas: -1 } },
      { $limit: 6 },
    ]),

    // Reservas por período
    Booking.aggregate([
      { $match: baseFilter },
      {
        $addFields: {
          _parsedDate: { $dateFromString: { dateString: '$date', onError: new Date() } },
        },
      },
      {
        $group: {
          _id: periodo === 'año'
            ? { $month: '$_parsedDate' }                           // 1–12
            : periodo === 'semana'
              ? { $dayOfWeek: '$_parsedDate' }                     // 1=Dom … 7=Sáb
              : { $ceil: { $divide: [{ $dayOfMonth: '$_parsedDate' }, 7] } }, // semana del mes 1–5
          reservas: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Heatmap: (dayOfWeek × hour)
    Booking.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: {
            dayOfWeek: {
              $dayOfWeek: {
                $dateFromString: { dateString: '$date', onError: new Date() },
              },
            },
            hour: { $toInt: { $substr: ['$startTime', 0, 2] } },
          },
          reservas: { $sum: 1 },
        },
      },
    ]),
  ]);

  // ── Format reservasPorPeriodo — rellenar todos los períodos con 0 ──────────
  const rawMap = new Map(reservasPorPeriodoRaw.map(r => [r._id, r.reservas]));

  let reservasPorPeriodo;

  if (periodo === 'semana') {
    // 1=Dom…7=Sáb → mostrar Lun(2) a Dom(1) en orden
    const ORDER = [2, 3, 4, 5, 6, 7, 1];
    reservasPorPeriodo = ORDER.map(dow => ({
      dia: DAY_NAMES[dow],
      reservas: rawMap.get(dow) || 0,
    }));

  } else if (periodo === 'año') {
    // Todos los meses 1–12
    reservasPorPeriodo = Array.from({ length: 12 }, (_, i) => ({
      dia: MONTH_NAMES[i + 1],
      reservas: rawMap.get(i + 1) || 0,
    }));

  } else {
    // mes → semanas 1–5 (ceil de día / 7)
    reservasPorPeriodo = [1, 2, 3, 4, 5].map(s => ({
      dia: `S${s}`,
      reservas: rawMap.get(s) || 0,
    }));
  }

  // ── Format heatmap ─────────────────────────────────────────────────────────
  const heatmap = heatmapRaw.map(r => ({
    dayOfWeek: r._id.dayOfWeek, // 1=Dom … 7=Sab
    hour:      r._id.hour,
    reservas:  r.reservas,
  }));

  // ── Income breakdown ───────────────────────────────────────────────────────
  const totalIngresos  = ingresosResult[0]?.total  || 0;
  const totalSenias    = seniasResult[0]?.total    || 0;
  const pagosCompletos = Math.max(0, totalIngresos - totalSenias);

  const tasaNum  = totalReservas > 0 ? (reservasConfirmadas / totalReservas) * 100 : 0;

  const prevIngresos = prevIngresosResult[0]?.total || 0;
  const prevSenias   = prevSeniasResult[0]?.total   || 0;
  const prevTasa     = prevTotalReservas > 0
    ? (prevReservasConfirmadas / prevTotalReservas) * 100
    : 0;

  const trends = {
    ingresos: calcTrend(totalIngresos, prevIngresos),
    reservas: calcTrend(totalReservas, prevTotalReservas),
    tasa:     calcTrend(tasaNum, prevTasa),
    senias:   calcTrend(totalSenias, prevSenias),
  };

  const incomeByType = totalIngresos > 0
    ? [
        { name: 'Pago Completo', value: Math.round((pagosCompletos / totalIngresos) * 100) },
        { name: 'Señas',         value: Math.round((totalSenias    / totalIngresos) * 100) },
      ]
    : [
        { name: 'Pago Completo', value: 0 },
        { name: 'Señas',         value: 0 },
      ];

  // ── Peak hour analysis ─────────────────────────────────────────────────────
  const peakHour = heatmap.reduce((max, c) => (c.reservas > max.reservas ? c : max), { reservas: 0 });

  // ── Efficiency score (0–10) ────────────────────────────────────────────────
  const efficiency = Math.min(10, (tasaNum / 10)).toFixed(1);

  return {
    totalIngresos,
    totalReservas,
    ingresosSenias: totalSenias,
    tasaConfirmacion: tasaNum.toFixed(1),
    trends,
    rankingCanchas,
    reservasPorPeriodo,
    heatmap,
    incomeByType,
    peakHour: peakHour.reservas > 0
      ? { hour: peakHour.hour, label: `${peakHour.hour}:00 - ${peakHour.hour + 1}:00 hs` }
      : null,
    efficiency,
  };
};

const emptyMetrics = () => ({
  totalIngresos: 0, totalReservas: 0, ingresosSenias: 0,
  tasaConfirmacion: '0.0',
  trends: { ingresos: null, reservas: null, tasa: null, senias: null },
  rankingCanchas: [], reservasPorPeriodo: [], heatmap: [],
  incomeByType: [{ name: 'Pago Completo', value: 0 }, { name: 'Señas', value: 0 }],
  peakHour: null, efficiency: '0.0',
});
