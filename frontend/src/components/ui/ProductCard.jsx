import React from "react";
import { Button } from "../button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Skeleton } from "./skeleton";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/productsSlice";
import api from "@/lib/api";

const ProductCard = ({ product, loading }) => {
  const { productImg = [], productPrice, productName } = product || {};
  const dispatch = useDispatch();
  const isActive = product?.isActive !== false;
  const stock = Number(product?.stock || 0);
  const canPurchase = isActive && stock > 0;

  const addtoCart = async (productId) => {
    try {
      const res = await api.post("/cart/add", { productId });
      if (res.data.success) {
        toast.success("Product added to cart");
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add item");
    }
  };
  return (
    <div className="group h-max overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {loading ? (
          <Skeleton className="w-full h-full rounded-lg" />
        ) : (
          <>
            <img
              src={productImg[0]?.url || "/Ekart.png"}
              alt={productName || "Product"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Premium pick
            </div>
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-950 hover:text-white"
              onClick={() => toast.info("Wishlist coming soon")}
            >
              <Heart className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {loading ? (
        <div className="px-2 space-y-2 my-2">
          <Skeleton className="w-[200px] h-4" />
          <Skeleton className="w-[100px] h-4" />
          <Skeleton className="w-[150px] h-8" />
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div>
            <h1 className="line-clamp-2 min-h-12 text-sm font-semibold text-slate-950">
              {productName}
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
              {product?.category || "General"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
              {product?.isFeatured ? (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                  Featured
                </span>
              ) : null}
              {!isActive ? (
                <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
                  Disabled
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                {stock > 0 ? `${stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Starting at
              </p>
              <h2 className="text-lg font-semibold text-slate-950">
                ₹{Number(productPrice || 0).toLocaleString()}
              </h2>
            </div>
            <p className="text-xs text-slate-500">Fast dispatch</p>
          </div>
          <Button
            onClick={() => addtoCart(product._id)}
            className="mb-1 w-full"
            disabled={!canPurchase}
          >
            <ShoppingCart />
            {canPurchase ? "Add to Cart" : "Unavailable"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
