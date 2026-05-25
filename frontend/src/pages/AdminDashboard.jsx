import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";

const emptyForm = {
  productName: "",
  productDesc: "",
  productPrice: "",
  category: "",
  brand: "",
};

const StatCard = ({ icon: Icon, label, value, description }) => (
  <Card className="border-white/10 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.user);

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [navigate, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [productRes, userRes] = await Promise.all([
        api.get("/product/getallproducts?includeInactive=true"),
        api.get("/user/all-user"),
      ]);

      setProducts(productRes.data.products || []);
      setUsers(userRes.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard();
    }
  }, [user]);

  const catalogValue = useMemo(
    () =>
      products.reduce(
        (total, item) => total + Number(item.productPrice || 0),
        0,
      ),
    [products],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      files.forEach((file) => formData.append("files", file));

      await api.post("/product/add", formData, {});

      toast.success("Product created successfully");
      setForm(emptyForm);
      setFiles([]);
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setDeletingId(productId);
      await api.delete(`/product/delete/${productId}`);
      toast.success("Product deleted");
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingId("");
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
            Sign in with an admin account to manage catalog and users.
          </p>
          <Button
            className="mt-6 bg-slate-950 text-white"
            onClick={() => navigate("/login")}
          >
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%,_#e2e8f0)] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-300">
            Admin dashboard
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold md:text-5xl">
                Operational control for Ekart
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                Manage products, users, and catalog operations from a single
                surface built on the existing backend.
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
            icon={Boxes}
            label="Products"
            value={products.length}
            description="Active catalog items"
          />
          <StatCard
            icon={Users}
            label="Users"
            value={users.length}
            description="Registered accounts"
          />
          <StatCard
            icon={BarChart3}
            label="Catalog value"
            value={`₹${catalogValue.toLocaleString()}`}
            description="Sum of product prices"
          />
          <StatCard
            icon={ShieldCheck}
            label="Admin users"
            value={users.filter((item) => item.role === "admin").length}
            description="Privileged accounts"
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <ClipboardList className="h-5 w-5" />
                Add product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="productName">Name</Label>
                    <Input
                      id="productName"
                      value={form.productName}
                      onChange={(e) =>
                        setForm({ ...form, productName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="productPrice">Price</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      value={form.productPrice}
                      onChange={(e) =>
                        setForm({ ...form, productPrice: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productDesc">Description</Label>
                  <textarea
                    id="productDesc"
                    rows="4"
                    value={form.productDesc}
                    onChange={(e) =>
                      setForm({ ...form, productDesc: e.target.value })
                    }
                    className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-0 transition focus:border-slate-900"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="files">Images</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-slate-950 text-white hover:bg-slate-800"
                >
                  {saving ? "Saving..." : "Create product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-950">
                  Catalog management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading catalog...</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-slate-500">No products yet.</p>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 8).map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-950">
                            {product.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.category || "Uncategorized"} • ₹
                            {Number(product.productPrice || 0).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="bg-red-600 text-white hover:bg-red-500"
                        >
                          {deletingId === product._id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-950">Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.slice(0, 8).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-950">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{item.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white">
                      {item.role || "user"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Orders", "Ready to connect once an order model is introduced."],
            ["Coupons", "Panel reserved for discount rule management."],
            ["Campaigns", "Banner and content slots can be wired next."],
          ].map(([title, text]) => (
            <Card
              key={title}
              className="border-dashed border-slate-300 bg-white/60"
            >
              <CardContent className="p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {title}
                </p>
                <p className="mt-3 text-sm text-slate-600">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
