import { Order } from "../models/orderModel.js";

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

    return res
      .status(200)
      .json({
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
