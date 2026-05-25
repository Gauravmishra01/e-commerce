import { Product } from "../models/productModel.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const addProduct = async (req, res) => {
  try {
    const {
      productName,
      productDesc,
      productPrice,
      category,
      subCategory,
      brand,
      stock,
      isFeatured,
      isActive,
    } = req.body;
    const userId = req.id;

    const normalizedName = productName?.trim();
    const normalizedDesc = productDesc?.trim();
    const normalizedCategory = category?.trim();
    const normalizedBrand = brand?.trim();
    const normalizedPrice = Number(productPrice);
    const normalizedStock =
      stock === undefined || stock === null || stock === "" ? 0 : Number(stock);

    if (
      !normalizedName ||
      !normalizedDesc ||
      Number.isNaN(normalizedPrice) ||
      normalizedPrice <= 0 ||
      !normalizedCategory ||
      !normalizedBrand
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, description, valid price, category, and brand are required",
      });
    }

    if (Number.isNaN(normalizedStock) || normalizedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be zero or a positive number",
      });
    }

    if (req.files && req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 10 images",
      });
    }

    let productImg = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "mern_products",
        });

        productImg.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const newProduct = await Product.create({
      userId,
      productName: normalizedName,
      productDesc: normalizedDesc,
      productPrice: normalizedPrice,
      category: normalizedCategory,
      subCategory: subCategory?.trim() || "",
      brand: normalizedBrand,
      productImg,
      stock: normalizedStock,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isActive: isActive !== "false",
    });

    return res.status(200).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const includeInactive = req.query?.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: { $ne: false } };
    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // Delete images from cloudanary
    if (product.productImg && product.productImg.length > 0) {
      for (let img of product.productImg) {
        const result = await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Delete product from mongo DB
    await Product.findByIdAndDelete(productId);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      productDesc,
      productPrice,
      category,
      subCategory,
      brand,
      stock,
      isFeatured,
      isActive,
      existingImages,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not Found",
      });
    }

    const normalizedPrice =
      productPrice === undefined || productPrice === null || productPrice === ""
        ? product.productPrice
        : Number(productPrice);
    const normalizedStock =
      stock === undefined || stock === null || stock === ""
        ? product.stock
        : Number(stock);

    if (Number.isNaN(normalizedPrice) || normalizedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product price must be a valid number",
      });
    }

    if (Number.isNaN(normalizedStock) || normalizedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be zero or a positive number",
      });
    }

    if (req.files && req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "You can upload up to 10 images",
      });
    }

    let updateImages = [];

    // keep selected old images
    if (existingImages) {
      const keepIds = JSON.parse(existingImages);
      updateImages = product.productImg.filter((img) =>
        keepIds.includes(img.public_id),
      );

      //   delete only removed images
      const removedImages = product.productImg.filter(
        (img) => !keepIds.includes(img.public_id),
      );
      for (let img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } else {
      // keeps all if nothing sent
      updateImages = product.productImg;
    }

    // upload new images if any
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "mern_products",
        });
        updateImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }
    // update product
    product.productName = productName || product.productName;
    product.productDesc = productDesc || product.productDesc;
    product.productPrice = normalizedPrice;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.brand = brand || product.brand;
    product.productImg = updateImages;
    product.stock = normalizedStock;
    product.isFeatured =
      isFeatured !== undefined
        ? isFeatured === "true" || isFeatured === true
        : product.isFeatured;
    product.isActive =
      isActive !== undefined
        ? isActive === "true" || isActive === true
        : product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated sucessfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
