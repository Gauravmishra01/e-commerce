import { Review } from "../models/reviewModel.js";

export const getAllReviews = async (_, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "firstName lastName email role isBlocked")
      .populate("productId", "productName productPrice productImg isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, userId, rating, comment, status } = req.body;
    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product, user, rating, and comment are required",
      });
    }

    const review = await Review.create({
      productId,
      userId,
      rating: Number(rating),
      comment,
      status: status || "pending",
    });

    return res
      .status(201)
      .json({ success: true, message: "Review created successfully", review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const { rating, comment, status, isFlagged, reportCount } = req.body;
    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    if (status !== undefined) review.status = status;
    if (isFlagged !== undefined)
      review.isFlagged = isFlagged === true || isFlagged === "true";
    if (reportCount !== undefined)
      review.reportCount = Number(reportCount || 0);

    await review.save();

    return res
      .status(200)
      .json({ success: true, message: "Review updated successfully", review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    review.status = status || "approved";
    await review.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Review moderated successfully",
        review,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
