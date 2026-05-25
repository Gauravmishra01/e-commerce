import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    bannerPublicId: {
      type: String,
      default: "",
    },
    targetType: {
      type: String,
      enum: ["banner", "campaign", "featured", "scheduled"],
      default: "banner",
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Promotion = mongoose.model("Promotion", promotionSchema);
