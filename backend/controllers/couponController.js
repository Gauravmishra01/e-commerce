import { Coupon } from "../models/couponModel.js";

const normalizeCoupon = (coupon) => ({
  ...coupon.toObject(),
  code: coupon.code.toUpperCase(),
});

export const getAllCoupons = async (_, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    if (!code || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and discount value are required",
      });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description,
      discountType: discountType || "percent",
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase || 0),
      usageLimit: Number(usageLimit || 0),
      expiresAt: expiresAt || null,
      isActive: isActive !== false && isActive !== "false",
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: normalizeCoupon(coupon),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      usageLimit,
      usedCount,
      expiresAt,
      isActive,
    } = req.body;

    if (code) coupon.code = code.trim().toUpperCase();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined)
      coupon.discountValue = Number(discountValue);
    if (minPurchase !== undefined)
      coupon.minPurchase = Number(minPurchase || 0);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit || 0);
    if (usedCount !== undefined) coupon.usedCount = Number(usedCount || 0);
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt || null;
    if (isActive !== undefined)
      coupon.isActive = isActive === true || isActive === "true";

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: normalizeCoupon(coupon),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
