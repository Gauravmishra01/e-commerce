import { Order } from "../models/orderModel.js";
import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";

export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.id || req.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { shippingAddress = "", notes = "" } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Your cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(
        item.productId?._id || item.productId,
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products no longer exist",
        });
      }

      if (product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} is currently unavailable`,
        });
      }

      if (Number(product.stock || 0) < Number(item.quantity || 0)) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.productName}`,
        });
      }

      const safePrice = Number(item.price || product.productPrice || 0);
      const safeQty = Number(item.quantity || 0);

      orderItems.push({
        productId: product._id,
        quantity: safeQty,
        price: safePrice,
      });

      subtotal += safePrice * safeQty;

      product.stock = Number(product.stock || 0) - safeQty;
      await product.save();
    }

    const shippingFee = subtotal >= 1000 ? 0 : 50;
    const totalAmount = subtotal + shippingFee;

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentStatus: "pending",
      shippingAddress,
      notes,
    });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("userId", "firstName lastName email role isBlocked")
      .populate(
        "items.productId",
        "productName productPrice productImg stock isActive",
      );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.id || req.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ userId })
      .populate(
        "items.productId",
        "productName productPrice productImg stock isActive",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email role isBlocked")
      .populate(
        "items.productId",
        "productName productPrice productImg stock isActive",
      );

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (status) order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("userId", "firstName lastName email role isBlocked")
      .populate(
        "items.productId",
        "productName productPrice productImg stock isActive",
      );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "refunded";
    order.paymentStatus = "refunded";
    await order.save();

    return res
      .status(200)
      .json({ success: true, message: "Refund processed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
