const User = require("../models/user.model");

// GET OWNERS
const getOwners = async (req, res, next) => {
  try {
    const owners = await User.find({
      role: "owner",
    })
      .select("name email status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (error) {
    next(error);
  }
};

// ACTIVATE / SUSPEND OWNER
const toggleOwnerStatus = async (req, res, next) => {
  try {
    const owner = await User.findById(req.params.id);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    owner.status =
      owner.status === "active"
        ? "suspended"
        : "active";

    await owner.save();

    res.status(200).json({
      success: true,
      message: "Owner status updated",
      data: owner,
    });
  } catch (error) {
    next(error);
  }
};

// DASHBOARD STATS
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalOwners = await User.countDocuments({
      role: "owner",
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOwners,

        // TEMPORALES
        totalReservations: 0,
        totalComplexes: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwners,
  toggleOwnerStatus,
  getStats,
};