import express from "express";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";
import {
  deleteMedia,
  getAllMedia,
  uploadMedia,
} from "../controllers/mediaController.js";

const router = express.Router();

router.get("/all", isAuthenticated, isAdmin, getAllMedia);
router.post("/upload", isAuthenticated, isAdmin, singleUpload, uploadMedia);
router.delete("/delete/:mediaId", isAuthenticated, isAdmin, deleteMedia);

export default router;
