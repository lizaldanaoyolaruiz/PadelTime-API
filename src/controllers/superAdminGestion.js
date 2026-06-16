export const getStats = async (req, res) => {
  try {
    const stats = {
      totalComplexes: 142,
      totalReservations: 12840,
      totalUsers: 45200,
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo estadísticas",
    });
  }
};