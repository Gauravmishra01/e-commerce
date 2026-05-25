import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/button";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
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
    <div className="bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#e2e8f0)] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Shopping cart
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Your selected items
            </h1>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Subtotal
            </p>
            <p className="text-2xl font-semibold text-slate-950">
              ₹{Number(cart?.totalPrice || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-white/70 bg-white/80 p-10 text-slate-500 shadow-sm backdrop-blur">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading cart...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm backdrop-blur">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productId?.productImg?.[0]?.url || "/Ekart.png"}
                    alt={item.productId?.productName || "Product"}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-lg font-medium text-slate-950">
                      {item.productId?.productName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.productId?.category || "General"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
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
                    className="bg-red-600 text-white hover:bg-red-500"
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

            <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Shipping address (optional)
              </label>
              <textarea
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                placeholder="House no, street, city, zip code"
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Shipping is free above ₹1,000. Otherwise ₹50 applies.
                </p>
                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || items.length === 0}
                  className="bg-slate-950 text-white hover:bg-slate-800"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
