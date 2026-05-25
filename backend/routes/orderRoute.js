import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  getAllOrders,
  processRefund,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/all-orders", isAuthenticated, isAdmin, getAllOrders);
router.put("/:orderId/status", isAuthenticated, isAdmin, updateOrderStatus);
router.put("/:orderId/refund", isAuthenticated, isAdmin, processRefund);

export default router;
