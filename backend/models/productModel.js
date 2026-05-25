import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    productName: {
      type: String,
      required: true,
    },

    productDesc: {
      type: String,
      required: true,
    },

    // ✅ FIXED SPELLING HERE
    productImg: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    productPrice: {
      type: Number,
    },

    category: {
      type: String,
    },

    subCategory: {
      type: String,
      default: "",
    },

    brand: {
      type: String,
    },

    stock: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
