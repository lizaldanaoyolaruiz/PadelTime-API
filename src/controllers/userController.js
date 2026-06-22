const User = require('../models/user.model.js');
const Booking = require('../models/booking.model.js');
// GET /users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
// GET /users/:id/full
const getUserFullProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('favorites.courtId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const bookings = await Booking.find({ userId: req.params.id })
      .populate('courtId')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
// GET /users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /users
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      status,
      isVerified,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
      isVerified,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id
const updateUser = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'email',
      'role',
      'status',
      'isVerified',
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserFullProfile,
};