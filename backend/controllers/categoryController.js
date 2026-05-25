import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import { Category } from "../models/categoryModel.js";

const buildSlug = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getAllCategories = async (req, res) => {
  try {
    const includeInactive = req.query?.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(filter)
      .populate("parentCategory", "name slug")
      .sort({ sortOrder: 1, name: 1 });

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, sortOrder, isActive } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const slug = buildSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const result = await cloudinary.uploader.upload(fileUri, {
        folder: "mern_categories",
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description,
      parentCategory: parentCategory || null,
      imageUrl,
      imagePublicId,
      sortOrder: Number(sortOrder || 0),
      isActive: isActive !== "false" && isActive !== false,
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Category created successfully",
        category,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, parentCategory, sortOrder, isActive } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (name && buildSlug(name) !== category.slug) {
      const duplicate = await Category.findOne({ slug: buildSlug(name) });
      if (duplicate) {
        return res
          .status(400)
          .json({ success: false, message: "Category already exists" });
      }
    }

    if (req.file) {
      if (category.imagePublicId) {
        await cloudinary.uploader.destroy(category.imagePublicId);
      }

      const fileUri = getDataUri(req.file);
      const result = await cloudinary.uploader.upload(fileUri, {
        folder: "mern_categories",
      });
      category.imageUrl = result.secure_url;
      category.imagePublicId = result.public_id;
    }

    if (name) {
      category.name = name.trim();
      category.slug = buildSlug(name);
    }
    if (description !== undefined) category.description = description;
    if (parentCategory !== undefined)
      category.parentCategory = parentCategory || null;
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder || 0);
    if (isActive !== undefined)
      category.isActive = isActive === "true" || isActive === true;

    await category.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Category updated successfully",
        category,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (category.imagePublicId) {
      await cloudinary.uploader.destroy(category.imagePublicId);
    }

    await Category.findByIdAndDelete(categoryId);
    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
