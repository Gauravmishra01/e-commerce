import express from "express";
import { singleUpload } from "../middleware/multer.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/all", getAllCategories);
router.post("/add", isAuthenticated, isAdmin, singleUpload, addCategory);
router.put(
  "/update/:categoryId",
  isAuthenticated,
  isAdmin,
  singleUpload,
  updateCategory,
);
router.delete("/delete/:categoryId", isAuthenticated, isAdmin, deleteCategory);

export default router;
