import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Complex from "../models/Complex.js";

const REVIEWABLE_STATUSES = ["pending", "confirmed", "completed"];

const recalculateComplexRating = async (complexId) => {
  const stats = await Review.aggregate([
    { $match: { complex: new mongoose.Types.ObjectId(complexId) } },
    {
      $group: { _id: "$complex", avg: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};

  await Complex.findByIdAndUpdate(complexId, {
    ratingAverage: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

export const createReview = async (req, res) => {
  try {
    const { complexId, rating, comment, tags } = req.body;

    if (!complexId || !rating) {
      return res
        .status(400)
        .json({ message: "complexId and rating are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(complexId)) {
      return res.status(404).json({ message: "Complex not found." });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    const booking = await Booking.findOne({
      player: req.user._id,
      complex: complexId,
      status: { $in: REVIEWABLE_STATUSES },
    });

    if (!booking) {
      return res.status(403).json({
        message:
          "Solo podés valorar complejos donde tengas una reserva confirmada.",
      });
    }

    const exists = await Review.findOne({
      complex: complexId,
      user: req.user._id,
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Ya enviaste una valoración para este complejo." });
    }

    const review = await Review.create({
      complex: complexId,
      user: req.user._id,
      booking: booking._id,
      rating,
      comment,
      tags: Array.isArray(tags) ? tags : [],
    });

    await recalculateComplexRating(complexId);

    res
      .status(201)
      .json({
        message: "Valoración enviada. ¡Gracias por tu feedback!",
        review,
      });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Ya enviaste una valoración para este complejo." });
    }
    res
      .status(500)
      .json({ message: "Error creating review.", error: error.message });
  }
};

export const getComplexReviews = async (req, res) => {
  try {
    const { complexId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(complexId)) {
      return res.status(404).json({ message: "Complex not found." });
    }

    const [reviews, complex] = await Promise.all([
      Review.find({ complex: complexId })
        .populate("user", "name")
        .sort({ createdAt: -1 }),
      Complex.findById(complexId).select("ratingAverage ratingCount"),
    ]);

    if (!complex)
      return res.status(404).json({ message: "Complex not found." });

    res.json({
      average: complex.ratingAverage,
      count: complex.ratingCount,
      reviews,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews.", error: error.message });
  }
};

export const canReview = async (req, res) => {
  try {
    const { complexId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(complexId)) {
      return res.status(404).json({ message: "Complex not found." });
    }

    const [booking, existingReview] = await Promise.all([
      Booking.findOne({
        player: req.user._id,
        complex: complexId,
        status: { $in: REVIEWABLE_STATUSES },
      }),
      Review.findOne({ complex: complexId, user: req.user._id }),
    ]);

    res.json({
      canReview: Boolean(booking) && !existingReview,
      alreadyReviewed: Boolean(existingReview),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error checking review eligibility.",
        error: error.message,
      });
  }
};

export const getOwnerReviews = async (req, res) => {
  try {
    const complex = await Complex.findOne({ owner: req.user._id });
    if (!complex)
      return res.status(404).json({ message: "No complex registered." });

    const reviews = await Review.find({ complex: complex._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({
      average: complex.ratingAverage,
      count: complex.ratingCount,
      reviews,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews.", error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Review not found." });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });

    if (String(review.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "No tenés permisos para editar esta valoración." });
    }

    const { rating, comment, tags } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5." });
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;
    if (tags !== undefined) review.tags = Array.isArray(tags) ? tags : [];

    await review.save();
    await recalculateComplexRating(review.complex);

    res.json({ message: "Valoración actualizada.", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review.", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Review not found." });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });

    const isOwnerOfReview = String(review.user) === String(req.user._id);
    if (!isOwnerOfReview && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "No tenés permisos para eliminar esta valoración." });
    }

    const { complex } = review;
    await review.deleteOne();
    await recalculateComplexRating(complex);

    res.json({ message: "Valoración eliminada." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review.", error: error.message });
  }
};
