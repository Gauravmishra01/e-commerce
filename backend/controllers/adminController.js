import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { Category } from "../models/categoryModel.js";
import User from "../models/userModel.js";
import { Coupon } from "../models/couponModel.js";
import { Review } from "../models/reviewModel.js";
import { Promotion } from "../models/promotionModel.js";
import { Media } from "../models/mediaModel.js";

const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));

export const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);

    const [
      products,
      categories,
      users,
      orders,
      coupons,
      reviews,
      promotions,
      media,
    ] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).limit(500),
      Category.find().sort({ createdAt: -1 }).limit(500),
      User.find().sort({ createdAt: -1 }).limit(500),
      Order.find()
        .populate("userId", "firstName lastName email role isBlocked")
        .populate(
          "items.productId",
          "productName productPrice productImg stock isActive",
        )
        .sort({ createdAt: -1 })
        .limit(500),
      Coupon.find().sort({ createdAt: -1 }).limit(500),
      Review.find().sort({ createdAt: -1 }).limit(500),
      Promotion.find().sort({ createdAt: -1 }).limit(500),
      Media.find().sort({ createdAt: -1 }).limit(500),
    ]);

    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );
    const dailyRevenue = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(weekAgo);
      day.setDate(weekAgo.getDate() + index);
      const dayStart = startOfDay(new Date(day));
      const dayKey = dayStart.toISOString().slice(0, 10);
      const total = orders
        .filter(
          (order) =>
            order.createdAt &&
            order.createdAt.toISOString().slice(0, 10) === dayKey,
        )
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

      return { date: dayKey, revenue: total };
    });

    const lowStockProducts = products
      .filter((product) => Number(product.stock || 0) <= 5)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      overview: {
        revenue,
        orders: orders.length,
        products: products.length,
        activeProducts: products.filter((item) => item.isActive !== false)
          .length,
        categories: categories.length,
        users: users.length,
        blockedUsers: users.filter((item) => item.isBlocked).length,
        coupons: coupons.length,
        reviews: reviews.length,
        promotions: promotions.length,
        media: media.length,
        lowStockProducts,
        recentOrders: orders.slice(0, 10),
        recentActivity: [
          ...products
            .slice(0, 3)
            .map((item) => ({
              type: "product",
              label: item.productName,
              createdAt: item.createdAt,
            })),
          ...orders
            .slice(0, 3)
            .map((item) => ({
              type: "order",
              label: `Order ${String(item._id).slice(-6)}`,
              createdAt: item.createdAt,
            })),
          ...users
            .slice(0, 3)
            .map((item) => ({
              type: "customer",
              label: `${item.firstName} ${item.lastName}`,
              createdAt: item.createdAt,
            })),
        ]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10),
      },
      charts: {
        dailyRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const orders = await Order.find().populate(
      "items.productId",
      "productName category",
    );
    const products = await Product.find();
    const users = await User.find();

    const salesByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const revenueByCategory = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const category = item.productId?.category || "Uncategorized";
        acc[category] =
          (acc[category] || 0) +
          Number(item.price || 0) * Number(item.quantity || 0);
      });
      return acc;
    }, {});

    const topProducts = products
      .map((product) => {
        const sold = orders.reduce((count, order) => {
          const item = order.items.find(
            (orderItem) =>
              String(orderItem.productId?._id || orderItem.productId) ===
              String(product._id),
          );
          return count + Number(item?.quantity || 0);
        }, 0);
        return {
          productName: product.productName,
          sold,
          stock: product.stock || 0,
          category: product.category || "Uncategorized",
        };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      reports: {
        revenue: orders.reduce(
          (sum, order) => sum + Number(order.totalAmount || 0),
          0,
        ),
        orders: orders.length,
        customers: users.length,
        salesByStatus,
        revenueByCategory,
        topProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
