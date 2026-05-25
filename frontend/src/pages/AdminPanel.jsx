import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  BadgeDollarSign,
  Box,
  Edit3,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Truck,
  Users,
} from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";

const initialProductForm = {
  productName: "",
  productDesc: "",
  productPrice: "",
  category: "",
  subCategory: "",
  brand: "",
  stock: 0,
  isFeatured: false,
  isActive: true,
};

const MAX_PRODUCT_IMAGES = 10;

const StatCard = ({ icon: Icon, label, value, description }) => (
  <Card className="border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-950">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-950/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.user);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [processingUserId, setProcessingUserId] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState("");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productFiles, setProductFiles] = useState([]);
  const [editingProductId, setEditingProductId] = useState("");
  const [productForm, setProductForm] = useState(initialProductForm);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      toast.error("Admin access required");
    }
  }, [navigate, user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [productRes, userRes, orderRes] = await Promise.all([
        api.get("/product/getallproducts?includeInactive=true"),
        api.get("/user/all-user"),
        api.get("/order/all-orders"),
      ]);

      setProducts(productRes.data.products || []);
      setUsers(userRes.data.users || []);
      setOrders(orderRes.data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const stats = useMemo(() => {
    const activeProducts = products.filter(
      (item) => item.isActive !== false,
    ).length;
    const featuredProducts = products.filter((item) => item.isFeatured).length;
    const blockedUsers = users.filter((item) => item.isBlocked).length;
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    return {
      activeProducts,
      featuredProducts,
      blockedUsers,
      revenue,
    };
  }, [orders, products, users]);

  const resetProductForm = () => {
    setEditingProductId("");
    setProductFiles([]);
    setProductForm(initialProductForm);
  };

  const startEditProduct = (product) => {
    setActiveTab("products");
    setEditingProductId(product._id);
    setProductFiles([]);
    setProductForm({
      productName: product.productName || "",
      productDesc: product.productDesc || "",
      productPrice: product.productPrice || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      brand: product.brand || "",
      stock: product.stock ?? 0,
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
    });
  };

  const handleProductFieldChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (productFiles.length > MAX_PRODUCT_IMAGES) {
      toast.error(`You can upload up to ${MAX_PRODUCT_IMAGES} images`);
      return;
    }

    try {
      setSavingProduct(true);
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (editingProductId) {
        const currentProduct = products.find(
          (item) => item._id === editingProductId,
        );
        const existingImages =
          currentProduct?.productImg?.map((image) => image.public_id) || [];
        formData.append("existingImages", JSON.stringify(existingImages));
        productFiles.forEach((file) => formData.append("files", file));

        const res = await api.put(
          `/product/update/${editingProductId}`,
          formData,
        );

        if (res.data.success) {
          toast.success("Product updated successfully");
        }
      } else {
        productFiles.forEach((file) => formData.append("files", file));
        const res = await api.post("/product/add", formData, {});

        if (res.data.success) {
          toast.success("Product created successfully");
        }
      }

      resetProductForm();
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/product/delete/${productId}`);
      toast.success("Product deleted");
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const toggleProductState = async (product, patch) => {
    try {
      const formData = new FormData();
      formData.append("productName", product.productName || "");
      formData.append("productDesc", product.productDesc || "");
      formData.append("productPrice", product.productPrice || 0);
      formData.append("category", product.category || "");
      formData.append("subCategory", product.subCategory || "");
      formData.append("brand", product.brand || "");
      formData.append("stock", product.stock ?? 0);
      formData.append("isFeatured", patch.isFeatured ?? product.isFeatured);
      formData.append("isActive", patch.isActive ?? product.isActive);
      formData.append(
        "existingImages",
        JSON.stringify(
          product.productImg?.map((image) => image.public_id) || [],
        ),
      );

      const res = await api.put(`/product/update/${product._id}`, formData, {});

      if (res.data.success) {
        toast.success("Product updated");
        await loadAdminData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleUserRole = async (userId, role) => {
    try {
      setProcessingUserId(userId + role);
      const res = await api.put(`/user/change-role/${userId}`, { role });
      if (res.data.success) {
        toast.success("User role updated");
        await loadAdminData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change user role",
      );
    } finally {
      setProcessingUserId("");
    }
  };

  const handleUserBlock = async (userId, isBlocked) => {
    try {
      setProcessingUserId(userId + String(isBlocked));
      const res = await api.put(
        `/user/${isBlocked ? "unblock" : "block"}-user/${userId}`,
      );
      if (res.data.success) {
        toast.success(res.data.message);
        await loadAdminData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setProcessingUserId("");
    }
  };

  const handleOrderSave = async (orderId, payload) => {
    try {
      setProcessingOrderId(orderId);
      const res = await api.put(`/order/${orderId}/status`, payload);
      if (res.data.success) {
        toast.success("Order updated");
        await loadAdminData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setProcessingOrderId("");
    }
  };

  const handleRefund = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      const res = await api.put(`/order/${orderId}/refund`);
      if (res.data.success) {
        toast.success("Refund processed");
        await loadAdminData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessingOrderId("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#e2e8f0)] px-4 pt-28">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <h1 className="text-3xl font-semibold text-slate-950">
            Admin access required
          </h1>
          <p className="mt-3 text-slate-600">
            Use the admin login page to access the dashboard.
          </p>
          <Button
            className="mt-6 bg-slate-950 text-white"
            onClick={() => navigate("/admin-login")}
          >
            Go to admin login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#e2e8f0)] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-300">
                Admin dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
                Operational control for Ekart
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                Manage products, users, and order operations from a single
                secure surface.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-200 md:min-w-[320px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Signed in as</p>
                <p className="mt-1 font-medium">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Role</p>
                <p className="mt-1 font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Box}
            label="Products"
            value={products.length}
            description="Catalog items in database"
          />
          <StatCard
            icon={Package}
            label="Active products"
            value={stats.activeProducts}
            description="Visible to customers"
          />
          <StatCard
            icon={Users}
            label="Users"
            value={users.length}
            description="Customer and admin accounts"
          />
          <StatCard
            icon={BadgeDollarSign}
            label="Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            description="Based on stored orders"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            ["overview", "Overview"],
            ["products", "Products"],
            ["users", "Users"],
            ["orders", "Orders"],
          ].map(([value, label]) => (
            <Button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`rounded-full px-5 ${activeTab === value ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}
            >
              {label}
            </Button>
          ))}
          <Button
            onClick={loadAdminData}
            className="rounded-full bg-white text-slate-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {activeTab === "overview" ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <ShoppingBag className="h-5 w-5" />
                  Recent products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading products...</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-slate-500">No products yet.</p>
                ) : (
                  products.slice(0, 5).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">
                          {product.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.category || "Uncategorized"} •{" "}
                          {product.brand || "Brand"}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <p>
                          ₹{Number(product.productPrice || 0).toLocaleString()}
                        </p>
                        <p className="text-xs">
                          Stock: {Number(product.stock || 0)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <Truck className="h-5 w-5" />
                  Recent orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No orders stored yet.
                  </p>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-950">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.userId?.email || "Unknown customer"}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium capitalize text-white">
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        <p>
                          Total: ₹
                          {Number(order.totalAmount || 0).toLocaleString()}
                        </p>
                        <p>Tracking: {order.trackingNumber || "Pending"}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "products" ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <Edit3 className="h-5 w-5" />
                  {editingProductId ? "Edit product" : "Add product"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="productName">Product name</Label>
                      <Input
                        id="productName"
                        value={productForm.productName}
                        onChange={(e) =>
                          handleProductFieldChange(
                            "productName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="productDesc">Description</Label>
                      <textarea
                        id="productDesc"
                        rows="4"
                        value={productForm.productDesc}
                        onChange={(e) =>
                          handleProductFieldChange(
                            "productDesc",
                            e.target.value,
                          )
                        }
                        className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-900"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="productPrice">Price</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        value={productForm.productPrice}
                        onChange={(e) =>
                          handleProductFieldChange(
                            "productPrice",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) =>
                          handleProductFieldChange("stock", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={productForm.category}
                        onChange={(e) =>
                          handleProductFieldChange("category", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subCategory">Subcategory</Label>
                      <Input
                        id="subCategory"
                        value={productForm.subCategory}
                        onChange={(e) =>
                          handleProductFieldChange(
                            "subCategory",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={productForm.brand}
                        onChange={(e) =>
                          handleProductFieldChange("brand", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="files">Images</Label>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setProductFiles(
                            Array.from(e.target.files || []).slice(
                              0,
                              MAX_PRODUCT_IMAGES,
                            ),
                          )
                        }
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Up to {MAX_PRODUCT_IMAGES} images. Selected images: {productFiles.length}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <label className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(productForm.isFeatured)}
                        onChange={(e) =>
                          handleProductFieldChange(
                            "isFeatured",
                            e.target.checked,
                          )
                        }
                      />
                      Featured product
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(productForm.isActive)}
                        onChange={(e) =>
                          handleProductFieldChange("isActive", e.target.checked)
                        }
                      />
                      Active / visible
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={savingProduct}
                      className="flex-1 bg-slate-950 text-white hover:bg-slate-800"
                    >
                      {savingProduct
                        ? "Saving..."
                        : editingProductId
                          ? "Update product"
                          : "Create product"}
                    </Button>
                    {editingProductId ? (
                      <Button
                        type="button"
                        className="bg-white text-slate-700"
                        onClick={resetProductForm}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-950">Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading products...</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No products available.
                  </p>
                ) : (
                  products.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <img
                            src={product.productImg?.[0]?.url || "/Ekart.png"}
                            alt={product.productName}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-950">
                              {product.productName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.category || "Uncategorized"}{" "}
                              {product.subCategory
                                ? `• ${product.subCategory}`
                                : ""}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              ₹
                              {Number(
                                product.productPrice || 0,
                              ).toLocaleString()}{" "}
                              • Stock {Number(product.stock || 0)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                                {product.brand || "Brand"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 ${product.isFeatured ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                              >
                                {product.isFeatured ? "Featured" : "Standard"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 ${product.isActive === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                              >
                                {product.isActive === false
                                  ? "Disabled"
                                  : "Active"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            className="bg-slate-950 text-white hover:bg-slate-800"
                            onClick={() => startEditProduct(product)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            type="button"
                            className="bg-white text-slate-700"
                            onClick={() =>
                              toggleProductState(product, {
                                isFeatured: !product.isFeatured,
                              })
                            }
                          >
                            {product.isFeatured ? (
                              <ToggleRight className="mr-2 h-4 w-4" />
                            ) : (
                              <ToggleLeft className="mr-2 h-4 w-4" />
                            )}
                            {product.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button
                            type="button"
                            className="bg-white text-slate-700"
                            onClick={() =>
                              toggleProductState(product, {
                                isActive: !product.isActive,
                              })
                            }
                          >
                            {product.isActive === false ? (
                              <ToggleRight className="mr-2 h-4 w-4" />
                            ) : (
                              <ToggleLeft className="mr-2 h-4 w-4" />
                            )}
                            {product.isActive === false ? "Enable" : "Disable"}
                          </Button>
                          <Button
                            type="button"
                            className="bg-red-600 text-white hover:bg-red-500"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "users" ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Users className="h-5 w-5" /> Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-slate-500">No users available.</p>
              ) : (
                users.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-slate-950">
                          {item.firstName} {item.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{item.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                            {item.role || "user"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 ${item.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {item.isBlocked ? "Blocked" : "Active"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 ${item.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {item.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className="bg-white text-slate-700"
                          disabled={processingUserId === item._id + "user"}
                          onClick={() =>
                            handleUserRole(
                              item._id,
                              item.role === "admin" ? "user" : "admin",
                            )
                          }
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          {item.role === "admin" ? "Make user" : "Make admin"}
                        </Button>
                        <Button
                          type="button"
                          className={
                            item.isBlocked
                              ? "bg-emerald-600 text-white hover:bg-emerald-500"
                              : "bg-red-600 text-white hover:bg-red-500"
                          }
                          disabled={
                            processingUserId ===
                            item._id + String(item.isBlocked)
                          }
                          onClick={() =>
                            handleUserBlock(item._id, item.isBlocked)
                          }
                        >
                          {item.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "orders" ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Truck className="h-5 w-5" /> Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders stored yet.</p>
              ) : (
                orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    processingOrderId={processingOrderId}
                    onSave={handleOrderSave}
                    onRefund={handleRefund}
                  />
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-dashed border-slate-300 bg-white/60">
            <CardContent className="p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Orders
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Real order management endpoints are available and ready for
                checkout records.
              </p>
            </CardContent>
          </Card>
          <Card className="border-dashed border-slate-300 bg-white/60">
            <CardContent className="p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Coupons
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Discount and promotion modules can plug into this dashboard
                next.
              </p>
            </CardContent>
          </Card>
          <Card className="border-dashed border-slate-300 bg-white/60">
            <CardContent className="p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Reports
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Analytics cards are wired to the database and can be extended
                with exports.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const OrderRow = ({ order, processingOrderId, onSave, onRefund }) => {
  const [status, setStatus] = useState(order.status || "pending");
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || "",
  );

  useEffect(() => {
    setStatus(order.status || "pending");
    setTrackingNumber(order.trackingNumber || "");
  }, [order]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-medium text-slate-950">
            Order #{order._id.slice(-6).toUpperCase()}
          </p>
          <p className="text-sm text-slate-500">
            {order.userId?.email || "Unknown customer"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Total: ₹{Number(order.totalAmount || 0).toLocaleString()}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[560px]">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking number"
          />
          <div className="flex gap-2">
            <Button
              className="bg-slate-950 text-white hover:bg-slate-800"
              disabled={processingOrderId === order._id}
              onClick={() => onSave(order._id, { status, trackingNumber })}
            >
              Save
            </Button>
            <Button
              className="bg-white text-slate-700"
              disabled={processingOrderId === order._id}
              onClick={() => onRefund(order._id)}
            >
              Refund
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
