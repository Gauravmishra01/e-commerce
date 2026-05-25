import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import {
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/productsSlice";

const Cart = () => {
  const [cart, setCartState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const dispatch = useDispatch();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      if (res.data.success) {
        setCartState(res.data.cart);
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, type) => {
    try {
      setBusyId(`${productId}-${type}`);
      const res = await api.put("/cart/update", { productId, type });
      if (res.data.success) {
        setCartState(res.data.cart);
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update cart");
    } finally {
      setBusyId("");
    }
  };

  const removeItem = async (productId) => {
    try {
      setBusyId(productId);
      const res = await api.delete("/cart/remove", { data: { productId } });
      if (res.data.success) {
        setCartState(res.data.cart);
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove item");
    } finally {
      setBusyId("");
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const res = await api.post("/order/checkout", {
        shippingAddress,
      });

      if (res.data?.success) {
        setCartState({ items: [], totalPrice: 0 });
        dispatch(setCart({ items: [], totalPrice: 0 }));
        setShippingAddress("");
        toast.success("Order placed successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const items = cart?.items || [];

  return (
    <div className="px-4 pb-16 pt-28 lg:px-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(71,85,105,0.9))] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">
                Shopping cart
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                A calm, premium checkout flow.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                Review items, apply coupons, and place your order through a
                streamlined cart experience with visible trust cues.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/55">
                Subtotal
              </p>
              <p className="mt-2 text-3xl font-semibold">
                ₹{Number(cart?.totalPrice || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-[1.75rem] border border-white/70 bg-white/80 p-10 text-slate-500 shadow-sm backdrop-blur">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading cart...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm backdrop-blur">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-950">
              Your cart is empty.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Browse the catalog to add products to your order.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/90 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.productId?.productImg?.[0]?.url || "/Ekart.png"}
                      alt={item.productId?.productName || "Product"}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {item.productId?.productName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.productId?.category || "General"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        ₹
                        {Number(
                          item.productId?.productPrice || item.price || 0,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-full"
                        onClick={() =>
                          updateQuantity(
                            item.productId?._id || item.productId,
                            "decrease",
                          )
                        }
                        disabled={
                          busyId ===
                          `${item.productId?._id || item.productId}-decrease`
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-10 text-center text-sm font-semibold text-slate-950">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-full"
                        onClick={() =>
                          updateQuantity(
                            item.productId?._id || item.productId,
                            "increase",
                          )
                        }
                        disabled={
                          busyId ===
                          `${item.productId?._id || item.productId}-increase`
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        removeItem(item.productId?._id || item.productId)
                      }
                      disabled={
                        busyId === (item.productId?._id || item.productId)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Order summary
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>Free over ₹1,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Secure payment</span>
                    <span>Enabled</span>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Coupon
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Input placeholder="Enter coupon code" />
                    <Button variant="outline" className="shrink-0">
                      Apply
                    </Button>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="font-medium text-slate-700">Total</span>
                  <span className="text-2xl font-semibold text-slate-950">
                    ₹{Number(cart?.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-slate-700" />
                  Secure checkout and data protection are enabled.
                </div>
                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || items.length === 0}
                  className="mt-5 w-full"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place order"
                  )}
                </Button>
              </div>

              <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Delivery promise
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-slate-700" />
                    Fast dispatch across priority zones
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-slate-700" />
                    Premium packaging and presentation
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
