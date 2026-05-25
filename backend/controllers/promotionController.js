import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import { Promotion } from "../models/promotionModel.js";

export const getAllPromotions = async (_, res) => {
  try {
    const promotions = await Promotion.find()
      .populate("productIds", "productName productPrice productImg isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, promotions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const {
      title,
      description,
      targetType,
      productIds,
      startsAt,
      endsAt,
      isActive,
    } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Promotion title is required" });
    }

    let bannerUrl = "";
    let bannerPublicId = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const upload = await cloudinary.uploader.upload(fileUri, {
        folder: "mern_promotions",
      });
      bannerUrl = upload.secure_url;
      bannerPublicId = upload.public_id;
    }

    const promotion = await Promotion.create({
      title: title.trim(),
      description,
      targetType: targetType || "banner",
      productIds: Array.isArray(productIds)
        ? productIds
        : productIds
          ? JSON.parse(productIds)
          : [],
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isActive: isActive !== false && isActive !== "false",
      bannerUrl,
      bannerPublicId,
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Promotion created successfully",
        promotion,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }

    const {
      title,
      description,
      targetType,
      productIds,
      startsAt,
      endsAt,
      isActive,
    } = req.body;
    if (title) promotion.title = title.trim();
    if (description !== undefined) promotion.description = description;
    if (targetType) promotion.targetType = targetType;
    if (productIds !== undefined)
      promotion.productIds = Array.isArray(productIds)
        ? productIds
        : JSON.parse(productIds || "[]");
    if (startsAt !== undefined) promotion.startsAt = startsAt || null;
    if (endsAt !== undefined) promotion.endsAt = endsAt || null;
    if (isActive !== undefined)
      promotion.isActive = isActive === true || isActive === "true";

    if (req.file) {
      if (promotion.bannerPublicId) {
        await cloudinary.uploader.destroy(promotion.bannerPublicId);
      }
      const fileUri = getDataUri(req.file);
      const upload = await cloudinary.uploader.upload(fileUri, {
        folder: "mern_promotions",
      });
      promotion.bannerUrl = upload.secure_url;
      promotion.bannerPublicId = upload.public_id;
    }

    await promotion.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Promotion updated successfully",
        promotion,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }

    if (promotion.bannerPublicId) {
      await cloudinary.uploader.destroy(promotion.bannerPublicId);
    }

    await Promotion.findByIdAndDelete(promotionId);
    return res
      .status(200)
      .json({ success: true, message: "Promotion deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
