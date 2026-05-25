import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.get("/all", isAuthenticated, isAdmin, getAllCoupons);
router.post("/add", isAuthenticated, isAdmin, createCoupon);
router.put("/update/:couponId", isAuthenticated, isAdmin, updateCoupon);
router.delete("/delete/:couponId", isAuthenticated, isAdmin, deleteCoupon);

export default router;
