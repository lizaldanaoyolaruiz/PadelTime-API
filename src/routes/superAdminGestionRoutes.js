const express = require("express");
const router = express.Router();

router.get("/stats", (req, res) => {
  res.json({
    totalComplexes: 142,
    totalReservations: 12840,
    totalUsers: 45200,
  });
});

module.exports = router;