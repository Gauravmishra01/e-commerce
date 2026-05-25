import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";
import {
  createPromotion,
  deletePromotion,
  getAllPromotions,
  updatePromotion,
} from "../controllers/promotionController.js";

const router = express.Router();

router.get("/all", isAuthenticated, isAdmin, getAllPromotions);
router.post("/add", isAuthenticated, isAdmin, singleUpload, createPromotion);
router.put(
  "/update/:promotionId",
  isAuthenticated,
  isAdmin,
  singleUpload,
  updatePromotion,
);
router.delete(
  "/delete/:promotionId",
  isAuthenticated,
  isAdmin,
  deletePromotion,
);

export default router;
