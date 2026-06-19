const express = require("express");

const router = express.Router();

const {
  getOwners,
  toggleOwnerStatus,
  getStats,
} = require("../controllers/superAdmin.controller");

// Dashboard
router.get("/stats", getStats);

// Owners
router.get("/owners", getOwners);

// Activar / Suspender
router.patch(
  "/owners/:id/status",
  toggleOwnerStatus
);

module.exports = router;