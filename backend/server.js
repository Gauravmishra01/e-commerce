import cors from "cors";
import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import couponRoute from "./routes/couponRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import promotionRoute from "./routes/promotionRoute.js";
import mediaRoute from "./routes/mediaRoute.js";
import adminRoute from "./routes/adminRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === "true";

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    return true;
  }

  if (allowVercelPreviews && origin.endsWith(".vercel.app")) {
    return true;
  }

  return false;
};

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (_, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.get("/", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Ekart API is running",
    docs: "/health",
  });
});

// Post http://localhost:8000/api/v1/user/register
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/promotion", promotionRoute);
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/admin", adminRoute);

app.use((error, _, res, next) => {
  if (error?.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  if (error?.name === "MulterError") {
    const message =
      error.code === "LIMIT_UNEXPECTED_FILE"
        ? "Invalid file field or too many images uploaded"
        : error.message || "File upload failed";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  return next(error);
});

app.use((error, _, res, __) => {
  console.error("Unhandled server error:", error);
  return res.status(500).json({
    success: false,
    message: error?.message || "Internal server error",
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("Allowed origins:", allowedOrigins);
    console.log("Allow Vercel previews:", allowVercelPreviews);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
