import { getMetrics as fetchMetrics } from "../services/metricsService.js";

export const getMetrics = async (req, res) => {
  try {
    const { startDate, endDate, periodo = "mes" } = req.query;
    const ownerId = req.user._id;

    const metrics = await fetchMetrics({
      ownerId,
      periodo,
      startDate,
      endDate,
    });
    res.status(200).json(metrics);
  } catch (error) {
    console.error("Error en getMetrics:", error);
    res
      .status(500)
      .json({ message: "Error obteniendo métricas", error: error.message });
  }
};
