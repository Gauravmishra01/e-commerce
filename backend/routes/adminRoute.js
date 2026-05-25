import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  getDashboardOverview,
  getReports,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/overview", isAuthenticated, isAdmin, getDashboardOverview);
router.get("/reports", isAuthenticated, isAdmin, getReports);

export default router;
