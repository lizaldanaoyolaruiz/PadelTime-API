import { getMetrics as fetchMetrics } from '../services/metricsService.js';

export const getMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const metrics = await fetchMetrics(startDate, endDate);
    res.status(200).json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo métricas' });
  }
};
