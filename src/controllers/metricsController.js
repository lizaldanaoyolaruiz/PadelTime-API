const metricsService = require("../services/metricsService");

const getMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const metrics = await metricsService.getMetrics(
      startDate,
      endDate
    );

    res.status(200).json(metrics);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo métricas",
    });
  }
};

module.exports = {
  getMetrics,
};