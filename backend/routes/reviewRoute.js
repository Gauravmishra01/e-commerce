import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createReview,
  deleteReview,
  getAllReviews,
  moderateReview,
  updateReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/all", isAuthenticated, isAdmin, getAllReviews);
router.post("/add", isAuthenticated, isAdmin, createReview);
router.put("/update/:reviewId", isAuthenticated, isAdmin, updateReview);
router.put("/moderate/:reviewId", isAuthenticated, isAdmin, moderateReview);
router.delete("/delete/:reviewId", isAuthenticated, isAdmin, deleteReview);

export default router;
