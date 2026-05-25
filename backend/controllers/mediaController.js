import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import { Media } from "../models/mediaModel.js";

export const getAllMedia = async (_, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, media });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Media file is required" });
    }

    const { tags, altText, folder } = req.body;
    const fileUri = getDataUri(req.file);
    const upload = await cloudinary.uploader.upload(fileUri, {
      folder: folder || "admin_media",
    });

    const media = await Media.create({
      filename: req.file.originalname,
      url: upload.secure_url,
      publicId: upload.public_id,
      folder: folder || "admin_media",
      tags: tags ? JSON.parse(tags) : [],
      altText: altText || "",
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.id || null,
    });

    return res
      .status(201)
      .json({ success: true, message: "Media uploaded successfully", media });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const media = await Media.findById(mediaId);
    if (!media) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }

    if (media.publicId) {
      await cloudinary.uploader.destroy(media.publicId);
    }

    await Media.findByIdAndDelete(mediaId);
    return res
      .status(200)
      .json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
