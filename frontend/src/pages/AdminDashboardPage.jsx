import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  ChevronRight,
  CloudCog,
  Coins,
  CreditCard,
  Edit3,
  FolderKanban,
  Gauge,
  ImagePlus,
  LayoutDashboard,
  ListFilter,
  Megaphone,
  Package,
  Percent,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  Users,
} from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { setProducts as setReduxProducts } from "@/redux/productsSlice";

const sectionConfig = {
  dashboard: { label: "Dashboard Overview", icon: LayoutDashboard },
  products: { label: "Product Management", icon: Package },
  categories: { label: "Category Management", icon: FolderKanban },
  orders: { label: "Orders", icon: Truck },
  customers: { label: "Customers", icon: Users },
  coupons: { label: "Coupons", icon: Percent },
  reviews: { label: "Reviews", icon: Star },
  promotions: { label: "Promotions", icon: Megaphone },
  media: { label: "Media Library", icon: ImagePlus },
  reports: { label: "Reports", icon: BarChart3 },
  notifications: { label: "Notifications", icon: Bell },
  settings: { label: "Settings", icon: Settings },
};

const sectionOrder = [
  "dashboard",
  "products",
  "categories",
  "orders",
  "customers",
  "coupons",
  "reviews",
  "promotions",
  "media",
  "reports",
  "notifications",
  "settings",
];

const productDraftKey = "ekart-admin-product-draft";
const categoryDraftKey = "ekart-admin-category-draft";
const recentCategoriesKey = "ekart-admin-recent-categories";
const MAX_PRODUCT_IMAGES = 10;

const emptyCouponForm = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  minPurchase: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

const emptyPromotionForm = {
  title: "",
  description: "",
  targetType: "banner",
  productIds: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const emptyReviewForm = {
  productId: "",
  userId: "",
  rating: 5,
  comment: "",
  status: "pending",
};

const emptyMediaForm = {
  folder: "admin_media",
  tags: "",
  altText: "",
};

const emptyProductForm = {
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

const emptyCategoryForm = {
  name: "",
  description: "",
  parentCategory: "",
  sortOrder: 0,
  isActive: true,
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;
const filePreviewUrl = (file) => URL.createObjectURL(file);

const MetricCard = ({ icon: Icon, label, value, detail }) => (
  <Card className="border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)]">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-950">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-950/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SectionHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    <div className="flex flex-wrap gap-2">{actions}</div>
  </div>
);

const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-6 text-center">
    <div className="rounded-2xl bg-slate-950 p-3 text-white">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
  </div>
);

const SkeletonRows = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="h-20 animate-pulse rounded-2xl bg-slate-200/70"
      />
    ))}
  </div>
);

const AdminDashboardPage = () => {
  const { section: routeSection } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [productFiles, setProductFiles] = useState([]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [promotionForm, setPromotionForm] = useState(emptyPromotionForm);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [mediaForm, setMediaForm] = useState(emptyMediaForm);
  const [couponFile, setCouponFile] = useState(null);
  const [promotionFile, setPromotionFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [savingPromotion, setSavingPromotion] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [editingPromotionId, setEditingPromotionId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  const activeSection = sectionOrder.includes(routeSection)
    ? routeSection
    : "dashboard";

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      toast.error("Admin access required");
    }
  }, [navigate, user]);

  useEffect(() => {
    const savedProductDraft = localStorage.getItem(productDraftKey);
    const savedCategoryDraft = localStorage.getItem(categoryDraftKey);
    if (savedProductDraft) {
      try {
        setProductForm((prev) => ({
          ...prev,
          ...JSON.parse(savedProductDraft),
        }));
      } catch {
        localStorage.removeItem(productDraftKey);
      }
    }
    if (savedCategoryDraft) {
      try {
        setCategoryForm((prev) => ({
          ...prev,
          ...JSON.parse(savedCategoryDraft),
        }));
      } catch {
        localStorage.removeItem(categoryDraftKey);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(productDraftKey, JSON.stringify(productForm));
  }, [productForm]);

  useEffect(() => {
    localStorage.setItem(categoryDraftKey, JSON.stringify(categoryForm));
  }, [categoryForm]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        productRes,
        userRes,
        orderRes,
        categoryRes,
        overviewRes,
        reportsRes,
        couponRes,
        reviewRes,
        promotionRes,
        mediaRes,
      ] = await Promise.all([
        api.get("/product/getallproducts?includeInactive=true"),
        api.get("/user/all-user"),
        api.get("/order/all-orders"),
        api.get("/category/all?includeInactive=true"),
        api.get("/admin/overview"),
        api.get("/admin/reports"),
        api.get("/coupon/all"),
        api.get("/review/all"),
        api.get("/promotion/all"),
        api.get("/media/all"),
      ]);

      setProducts(productRes.data.products || []);
      dispatch(setReduxProducts(productRes.data.products || []));
      setUsers(userRes.data.users || []);
      setOrders(orderRes.data.orders || []);
      setCategories(categoryRes.data.categories || []);
      setOverview(overviewRes.data.overview || null);
      setReports(reportsRes.data.reports || null);
      setCoupons(couponRes.data.coupons || []);
      setReviews(reviewRes.data.reviews || []);
      setPromotions(promotionRes.data.promotions || []);
      setMediaItems(mediaRes.data.media || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeProducts =
      overview?.activeProducts ??
      products.filter((item) => item.isActive !== false).length;
    const featuredProducts = products.filter((item) => item.isFeatured).length;
    const blockedUsers =
      overview?.blockedUsers ?? users.filter((item) => item.isBlocked).length;
    const activeCategories = categories.filter(
      (item) => item.isActive !== false,
    ).length;
    const revenue =
      overview?.revenue ??
      orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return {
      activeProducts,
      featuredProducts,
      blockedUsers,
      activeCategories,
      revenue,
    };
  }, [categories, orders, overview, products, users]);

  const categorySuggestions = useMemo(
    () => [...new Set(categories.map((item) => item.name).filter(Boolean))],
    [categories],
  );
  const filteredCategoryOptions = useMemo(() => {
    const options = [
      ...new Set(categories.map((item) => item.name).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));
    const term = categorySearch.trim().toLowerCase();
    if (!term) return options;
    return options.filter((item) => item.toLowerCase().includes(term));
  }, [categorySearch, categories]);
  const dependentSubcategoryOptions = useMemo(() => {
    const selectedCategory = productForm.category.trim().toLowerCase();
    const productSubcategories = products
      .filter(
        (product) =>
          product.category?.trim().toLowerCase() === selectedCategory &&
          product.subCategory,
      )
      .map((product) => product.subCategory.trim())
      .filter(Boolean);

    const childCategories = categories
      .filter(
        (category) =>
          category.parentCategory?.name?.trim().toLowerCase() ===
            selectedCategory ||
          category.parentCategory?.slug?.trim().toLowerCase() ===
            selectedCategory,
      )
      .map((category) => category.name.trim())
      .filter(Boolean);

    return [...new Set([...productSubcategories, ...childCategories])].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [categories, productForm.category, products]);
  const filteredSubcategoryOptions = useMemo(() => {
    const term = subcategorySearch.trim().toLowerCase();
    if (!term) return dependentSubcategoryOptions;
    return dependentSubcategoryOptions.filter((item) =>
      item.toLowerCase().includes(term),
    );
  }, [dependentSubcategoryOptions, subcategorySearch]);
  const recentCategorySuggestions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(recentCategoriesKey) || "[]");
    } catch {
      return [];
    }
  }, [categories.length]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products
      .filter((product) => {
        if (!term) return true;
        const haystack = [
          product.productName,
          product.category,
          product.subCategory,
          product.brand,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [products, searchTerm]);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return categories.filter((category) => {
      if (!term) return true;
      return [category.name, category.slug, category.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [categories, searchTerm]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((item) => {
      if (!term) return true;
      return [item.firstName, item.lastName, item.email, item.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [searchTerm, users]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      if (!term) return true;
      return [order._id, order.status, order.paymentStatus, order.userId?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [orders, searchTerm]);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductFiles([]);
    setProductForm(emptyProductForm);
    setCategorySearch("");
    setSubcategorySearch("");
    localStorage.removeItem(productDraftKey);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryImage(null);
    setCategoryForm(emptyCategoryForm);
    localStorage.removeItem(categoryDraftKey);
  };

  const resetCouponForm = () => {
    setEditingCouponId(null);
    setCouponForm(emptyCouponForm);
    setCouponFile(null);
  };

  const resetPromotionForm = () => {
    setEditingPromotionId(null);
    setPromotionForm(emptyPromotionForm);
    setPromotionFile(null);
  };

  const resetReviewForm = () => {
    setEditingReviewId(null);
    setReviewForm(emptyReviewForm);
  };

  const resetMediaForm = () => {
    setEditingMediaId(null);
    setMediaForm(emptyMediaForm);
    setMediaFile(null);
  };

  const onProductChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCategoryChange = (field, value) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const openProductEditor = (product) => {
    setEditingProductId(product._id);
    setProductFiles([]);
    setCategorySearch(product.category || "");
    setSubcategorySearch(product.subCategory || "");
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
    navigate("/admin/products");
  };

  const openCategoryEditor = (category) => {
    setEditingCategoryId(category._id);
    setCategoryImage(null);
    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      parentCategory: category.parentCategory?._id || "",
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false,
    });
    navigate("/admin/categories");
  };

  const pushRecentCategory = (name) => {
    if (!name) return;
    const current = JSON.parse(
      localStorage.getItem(recentCategoriesKey) || "[]",
    );
    const next = [name, ...current.filter((item) => item !== name)].slice(0, 6);
    localStorage.setItem(recentCategoriesKey, JSON.stringify(next));
  };

  const validateProduct = () => {
    const errors = [];
    if (!productForm.productName.trim())
      errors.push("Product name is required");
    if (!productForm.productDesc.trim())
      errors.push("Product description is required");
    if (!productForm.category.trim()) errors.push("Category is required");
    if (!productForm.brand.trim()) errors.push("Brand is required");
    if (!productForm.productPrice || Number(productForm.productPrice) <= 0)
      errors.push("Price must be greater than zero");
    if (Number(productForm.stock) < 0) errors.push("Stock cannot be negative");
    if (productFiles.length > MAX_PRODUCT_IMAGES) {
      errors.push(`You can upload up to ${MAX_PRODUCT_IMAGES} images`);
    }
    return errors;
  };

  const validateCategory = () => {
    const errors = [];
    if (!categoryForm.name.trim()) errors.push("Category name is required");
    if (!categoryForm.description.trim())
      errors.push("Category description is required");
    return errors;
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const errors = validateProduct();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    try {
      setSavingProduct(true);
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) =>
        formData.append(key, value),
      );
      productFiles.forEach((file) => formData.append("files", file));

      let response;
      if (editingProductId) {
        const currentProduct = products.find(
          (item) => item._id === editingProductId,
        );
        formData.append(
          "existingImages",
          JSON.stringify(
            currentProduct?.productImg?.map((item) => item.public_id) || [],
          ),
        );
        response = await api.put(
          `/product/update/${editingProductId}`,
          formData,
        );
      } else {
        response = await api.post("/product/add", formData);
      }

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Product save failed");
      }

      toast.success(response.data.message || "Product saved successfully");

      if (response.data.product) {
        setProducts((prev) => {
          const nextProducts = editingProductId
            ? prev.map((item) =>
                item._id === response.data.product._id
                  ? response.data.product
                  : item,
              )
            : [response.data.product, ...prev];
          dispatch(setReduxProducts(nextProducts));
          return nextProducts;
        });
      }

      resetProductForm();
      navigate("/admin/products");

      loadData().catch((refreshError) => {
        console.warn("Admin refresh failed after save:", refreshError);
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save product",
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const errors = validateCategory();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    try {
      setSavingCategory(true);
      const formData = new FormData();
      formData.append("name", categoryForm.name);
      formData.append("description", categoryForm.description);
      formData.append("parentCategory", categoryForm.parentCategory || "");
      formData.append("sortOrder", categoryForm.sortOrder);
      formData.append("isActive", categoryForm.isActive);
      if (categoryImage) {
        formData.append("file", categoryImage);
      }

      if (editingCategoryId) {
        const response = await api.put(
          `/category/update/${editingCategoryId}`,
          formData,
        );
        if (response.data.success)
          toast.success("Category updated successfully");
      } else {
        const response = await api.post("/category/add", formData, {});
        if (response.data.success)
          toast.success("Category created successfully");
      }

      pushRecentCategory(categoryForm.name.trim());
      resetCategoryForm();
      await loadData();
      navigate("/admin/categories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const response = await api.delete(`/product/delete/${productId}`);
      if (response.data.success) {
        toast.success("Product deleted");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const response = await api.delete(`/category/delete/${categoryId}`);
      if (response.data.success) {
        toast.success("Category deleted");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const updateCategoryStatus = async (category, nextState) => {
    try {
      const formData = new FormData();
      formData.append("name", category.name || "");
      formData.append("description", category.description || "");
      formData.append("parentCategory", category.parentCategory?._id || "");
      formData.append("sortOrder", category.sortOrder || 0);
      formData.append("isActive", nextState);
      const response = await api.put(
        `/category/update/${category._id}`,
        formData,
      );
      if (response.data.success) {
        toast.success("Category updated");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const updateProductStatus = async (product, patch) => {
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
        JSON.stringify(product.productImg?.map((item) => item.public_id) || []),
      );

      const response = await api.put(
        `/product/update/${product._id}`,
        formData,
      );
      if (response.data.success) {
        toast.success("Product updated");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleBulkProductAction = async (action) => {
    if (selectedProductIds.length === 0) return;
    if (action === "delete" && !window.confirm("Delete selected products?"))
      return;

    try {
      const targets = products.filter((item) =>
        selectedProductIds.includes(item._id),
      );
      for (const product of targets) {
        if (action === "delete") {
          await api.delete(`/product/delete/${product._id}`);
        } else if (action === "activate") {
          await updateProductStatus(product, { isActive: true });
        } else if (action === "disable") {
          await updateProductStatus(product, { isActive: false });
        }
      }
      toast.success("Bulk action completed");
      setSelectedProductIds([]);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk action failed");
    }
  };

  const handleOrderSave = async (orderId, payload) => {
    try {
      const response = await api.put(`/order/${orderId}/status`, payload);
      if (response.data.success) {
        toast.success("Order updated");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const handleRefund = async (orderId) => {
    try {
      const response = await api.put(`/order/${orderId}/refund`);
      if (response.data.success) {
        toast.success("Refund processed");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const toggleUserRole = async (targetUser) => {
    try {
      const response = await api.put(`/user/change-role/${targetUser._id}`, {
        role: targetUser.role === "admin" ? "user" : "admin",
      });
      if (response.data.success) {
        toast.success("User role updated");
        await loadData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user role",
      );
    }
  };

  const toggleUserBlock = async (targetUser) => {
    try {
      const action = targetUser.isBlocked ? "unblock" : "block";
      const response = await api.put(`/user/${action}-user/${targetUser._id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const openCouponEditor = (coupon) => {
    setEditingCouponId(coupon._id);
    setCouponForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percent",
      discountValue: coupon.discountValue ?? "",
      minPurchase: coupon.minPurchase ?? "",
      usageLimit: coupon.usageLimit ?? "",
      expiresAt: coupon.expiresAt ? String(coupon.expiresAt).slice(0, 16) : "",
      isActive: coupon.isActive !== false,
    });
    navigate("/admin/coupons");
  };

  const saveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!couponForm.discountValue && couponForm.discountValue !== 0) {
      toast.error("Discount value is required");
      return;
    }

    try {
      setSavingCoupon(true);
      const payload = {
        ...couponForm,
        code: couponForm.code.trim(),
        description: couponForm.description.trim(),
        discountValue: Number(couponForm.discountValue),
        minPurchase: Number(couponForm.minPurchase || 0),
        usageLimit: Number(couponForm.usageLimit || 0),
        expiresAt: couponForm.expiresAt || null,
      };
      const response = editingCouponId
        ? await api.put(`/coupon/update/${editingCouponId}`, payload)
        : await api.post("/coupon/add", payload);

      if (response.data.success) {
        toast.success(response.data.message || "Coupon saved");
        resetCouponForm();
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const response = await api.delete(`/coupon/delete/${couponId}`);
      if (response.data.success) {
        toast.success("Coupon deleted");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  const openReviewEditor = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({
      productId: review.productId?._id || "",
      userId: review.userId?._id || "",
      rating: review.rating ?? 5,
      comment: review.comment || "",
      status: review.status || "pending",
    });
    navigate("/admin/reviews");
  };

  const saveReview = async (e) => {
    e.preventDefault();
    if (
      !reviewForm.productId ||
      !reviewForm.userId ||
      !reviewForm.comment.trim()
    ) {
      toast.error("Product, customer, and comment are required");
      return;
    }

    try {
      setSavingReview(true);
      const payload = {
        ...reviewForm,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };
      const response = editingReviewId
        ? await api.put(`/review/update/${editingReviewId}`, payload)
        : await api.post("/review/add", payload);
      if (response.data.success) {
        toast.success(response.data.message || "Review saved");
        resetReviewForm();
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save review");
    } finally {
      setSavingReview(false);
    }
  };

  const moderateReview = async (reviewId, status) => {
    try {
      const response = await api.put(`/review/moderate/${reviewId}`, {
        status,
      });
      if (response.data.success) {
        toast.success("Review updated");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update review");
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const response = await api.delete(`/review/delete/${reviewId}`);
      if (response.data.success) {
        toast.success("Review deleted");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const openPromotionEditor = (promotion) => {
    setEditingPromotionId(promotion._id);
    setPromotionForm({
      title: promotion.title || "",
      description: promotion.description || "",
      targetType: promotion.targetType || "banner",
      productIds: promotion.productIds?.map((item) => item._id).join(",") || "",
      startsAt: promotion.startsAt
        ? String(promotion.startsAt).slice(0, 16)
        : "",
      endsAt: promotion.endsAt ? String(promotion.endsAt).slice(0, 16) : "",
      isActive: promotion.isActive !== false,
    });
    navigate("/admin/promotions");
  };

  const savePromotion = async (e) => {
    e.preventDefault();
    if (!promotionForm.title.trim()) {
      toast.error("Promotion title is required");
      return;
    }

    try {
      setSavingPromotion(true);
      const formData = new FormData();
      formData.append("title", promotionForm.title.trim());
      formData.append("description", promotionForm.description.trim());
      formData.append("targetType", promotionForm.targetType);
      formData.append(
        "productIds",
        JSON.stringify(
          promotionForm.productIds
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
      formData.append("startsAt", promotionForm.startsAt || "");
      formData.append("endsAt", promotionForm.endsAt || "");
      formData.append("isActive", promotionForm.isActive);
      if (promotionFile) {
        formData.append("file", promotionFile);
      }

      const response = editingPromotionId
        ? await api.put(`/promotion/update/${editingPromotionId}`, formData)
        : await api.post("/promotion/add", formData);

      if (response.data.success) {
        toast.success(response.data.message || "Promotion saved");
        resetPromotionForm();
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save promotion");
    } finally {
      setSavingPromotion(false);
    }
  };

  const deletePromotion = async (promotionId) => {
    if (!window.confirm("Delete this promotion?")) return;
    try {
      const response = await api.delete(`/promotion/delete/${promotionId}`);
      if (response.data.success) {
        toast.success("Promotion deleted");
        await loadData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete promotion",
      );
    }
  };

  const saveMedia = async (e) => {
    e.preventDefault();
    if (!mediaFile) {
      toast.error("Select a media file to upload");
      return;
    }

    try {
      setSavingMedia(true);
      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("folder", mediaForm.folder || "admin_media");
      formData.append(
        "tags",
        JSON.stringify(
          mediaForm.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
      formData.append("altText", mediaForm.altText || "");

      const response = await api.post("/media/upload", formData);
      if (response.data.success) {
        toast.success(response.data.message || "Media uploaded");
        resetMediaForm();
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload media");
    } finally {
      setSavingMedia(false);
    }
  };

  const deleteMedia = async (mediaId) => {
    if (!window.confirm("Delete this media item?")) return;
    try {
      const response = await api.delete(`/media/delete/${mediaId}`);
      if (response.data.success) {
        toast.success("Media deleted");
        await loadData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete media");
    }
  };

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const sectionLabel =
    sectionConfig[activeSection]?.label || sectionConfig.dashboard.label;
  const SectionIcon =
    sectionConfig[activeSection]?.icon || sectionConfig.dashboard.icon;
  const breadcrumbs = ["Admin", sectionLabel];

  const heroCards = [
    {
      icon: ShoppingBag,
      label: "Total products",
      value: products.length,
      detail: "Product catalog records",
    },
    {
      icon: Gauge,
      label: "Active products",
      value: stats.activeProducts,
      detail: "Visible on storefront",
    },
    {
      icon: FolderKanban,
      label: "Categories",
      value: categories.length,
      detail: "Hierarchy and suggestions",
    },
    {
      icon: CreditCard,
      label: "Revenue",
      value: formatCurrency(overview?.revenue ?? stats.revenue),
      detail: `${overview?.orders ?? orders.length} orders in the database`,
    },
  ];

  const filteredCoupons = coupons.filter((coupon) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [coupon.code, coupon.description, coupon.discountType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const filteredReviews = reviews.filter((review) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [
      review.comment,
      review.status,
      review.productId?.productName,
      review.userId?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const filteredPromotions = promotions.filter((promotion) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [promotion.title, promotion.description, promotion.targetType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const filteredMedia = mediaItems.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [item.filename, item.altText, item.folder, ...(item.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const sidebarItems = sectionOrder.map((slug) => {
    const config = sectionConfig[slug];
    const Icon = config.icon;
    return (
      <button
        key={slug}
        onClick={() =>
          navigate(slug === "dashboard" ? "/admin" : `/admin/${slug}`)
        }
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
          activeSection === slug
            ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
            : "text-slate-600 hover:bg-white hover:text-slate-950"
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{config.label}</span>
        </span>
        <ChevronRight className="h-4 w-4 opacity-60" />
      </button>
    );
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#e2e8f0)] pb-10 pt-20">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 lg:px-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-80 shrink-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:block">
          <div className="rounded-[1.5rem] bg-slate-950 px-4 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-orange-300">
                  Ekart Admin
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Production Dashboard
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {user.firstName} {user.lastName}
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200">
                {user.role}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">{sidebarItems}</div>

          <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Quick Notes
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Products, categories, and orders are sectioned by route so the
              panel feels like a real admin app.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="rounded-[2.25rem] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-orange-300">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb}>
                      <span>{crumb}</span>
                      {index < breadcrumbs.length - 1 ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
                <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">
                  <SectionIcon className="h-8 w-8 text-orange-300" />
                  {sectionLabel}
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                  Manage your storefront with a clean, route-driven,
                  production-style workflow built for speed and clarity.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Signed in as
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Live search
                  </p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-300" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products, users, categories..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroCards.map((item) => (
              <MetricCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                detail={item.detail}
              />
            ))}
          </div>

          {activeSection === "dashboard" ? (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <BarChart3 className="h-5 w-5" /> Sales analytics
                  </CardTitle>
                  <Button
                    onClick={loadData}
                    className="rounded-full bg-slate-950 text-white"
                  >
                    Refresh data
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      Revenue overview
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {formatCurrency(overview?.revenue ?? stats.revenue)}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Derived from the order collection
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white/5 p-3">
                        Featured products
                        <br />
                        <span className="text-lg font-semibold">
                          {stats.featuredProducts}
                        </span>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3">
                        Blocked users
                        <br />
                        <span className="text-lg font-semibold">
                          {stats.blockedUsers}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      {(overview?.charts?.dailyRevenue || []).map((day) => (
                        <div key={day.date} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span>{day.date}</span>
                            <span>{formatCurrency(day.revenue)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className="h-2 rounded-full bg-orange-400"
                              style={{
                                width: `${Math.min(100, ((day.revenue || 0) / Math.max(1, overview?.revenue || stats.revenue || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-950">
                        Recent activity
                      </p>
                      <Sparkles className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                      {(overview?.recentActivity?.length
                        ? overview.recentActivity
                        : [
                            {
                              label: "Products",
                              value: `${products.length} items tracked`,
                              detail: "Catalog sync is live",
                            },
                            {
                              label: "Categories",
                              value: `${stats.activeCategories} active`,
                              detail: "Smart suggestions ready",
                            },
                            {
                              label: "Orders",
                              value: `${orders.length} records`,
                              detail: "Refund and status tools enabled",
                            },
                            {
                              label: "Customers",
                              value: `${users.length} accounts`,
                              detail: "RBAC and block controls active",
                            },
                          ]
                      ).map((item, index) => (
                        <ActivityItem
                          key={`${item.label || item.type}-${index}`}
                          label={item.label || item.type}
                          value={item.value || item.label}
                          detail={
                            item.detail ||
                            new Date(
                              item.createdAt || Date.now(),
                            ).toLocaleString()
                          }
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Gauge className="h-5 w-5" /> Inventory overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(overview?.lowStockProducts?.length
                    ? overview.lowStockProducts
                    : products.slice(0, 6)
                  ).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {product.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.category || "Uncategorized"}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-slate-950">
                          {formatCurrency(product.productPrice)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Stock {product.stock ?? 0}
                        </p>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 ? (
                    <EmptyState
                      icon={Boxes}
                      title="No products yet"
                      description="Start by creating the first product in the management section."
                    />
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeSection === "products" ? (
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Edit3 className="h-5 w-5" />{" "}
                    {editingProductId ? "Edit product" : "Add product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveProduct} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Product name" required>
                        <Input
                          value={productForm.productName}
                          onChange={(e) =>
                            onProductChange("productName", e.target.value)
                          }
                          placeholder="Nike Air Max"
                        />
                      </Field>
                      <Field label="Brand" required>
                        <Input
                          value={productForm.brand}
                          onChange={(e) =>
                            onProductChange("brand", e.target.value)
                          }
                          placeholder="Nike"
                        />
                      </Field>
                      <Field
                        label="Category"
                        required
                        className="md:col-span-2"
                      >
                        <Input
                          value={categorySearch}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCategorySearch(value);
                            onProductChange("category", value);
                          }}
                          placeholder="Search categories"
                        />
                        <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <select
                            value={productForm.category}
                            onChange={(e) => {
                              const value = e.target.value;
                              onProductChange("category", value);
                              setCategorySearch(value);
                              onProductChange("subCategory", "");
                              setSubcategorySearch("");
                            }}
                            className="h-11 min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                          >
                            <option value="">Select category</option>
                            {filteredCategoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            onClick={() => navigate("/admin/categories")}
                            className="bg-white text-slate-700"
                          >
                            Create new category
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                          {recentCategorySuggestions.slice(0, 4).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                onProductChange("category", item);
                                setCategorySearch(item);
                              }}
                              className="rounded-full bg-slate-100 px-3 py-1 transition hover:bg-slate-200"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Subcategory">
                        <Input
                          value={subcategorySearch}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSubcategorySearch(value);
                            onProductChange("subCategory", value);
                          }}
                          placeholder={
                            productForm.category
                              ? `Search subcategories in ${productForm.category}`
                              : "Select a category first"
                          }
                          disabled={!productForm.category}
                        />
                        <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3">
                          <select
                            value={productForm.subCategory}
                            onChange={(e) => {
                              const value = e.target.value;
                              onProductChange("subCategory", value);
                              setSubcategorySearch(value);
                            }}
                            disabled={!productForm.category}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 disabled:bg-slate-50"
                          >
                            <option value="">
                              {productForm.category
                                ? "Select subcategory"
                                : "Select a category first"}
                            </option>
                            {filteredSubcategoryOptions.map((subCategory) => (
                              <option key={subCategory} value={subCategory}>
                                {subCategory}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-[11px] text-slate-500">
                            Suggestions are pulled from existing products and
                            child categories.
                          </p>
                        </div>
                      </Field>
                      <Field label="Price" required>
                        <Input
                          type="number"
                          min="1"
                          value={productForm.productPrice}
                          onChange={(e) =>
                            onProductChange("productPrice", e.target.value)
                          }
                          placeholder="4999"
                        />
                      </Field>
                      <Field label="Stock" required>
                        <Input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) =>
                            onProductChange("stock", e.target.value)
                          }
                          placeholder="25"
                        />
                      </Field>
                      <Field label="Images" className="md:col-span-2">
                        <Input
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
                          Up to {MAX_PRODUCT_IMAGES} images. Selected images:{" "}
                          {productFiles.length}
                        </p>
                      </Field>
                      <Field
                        label="Description"
                        className="md:col-span-2"
                        required
                      >
                        <textarea
                          value={productForm.productDesc}
                          onChange={(e) =>
                            onProductChange("productDesc", e.target.value)
                          }
                          rows={5}
                          className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                          placeholder="Describe the product, materials, fit, and selling points..."
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                      <CheckField
                        label="Featured product"
                        checked={productForm.isFeatured}
                        onChange={(value) =>
                          onProductChange("isFeatured", value)
                        }
                      />
                      <CheckField
                        label="Visible on storefront"
                        checked={productForm.isActive}
                        onChange={(value) => onProductChange("isActive", value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={savingProduct}
                        className="bg-slate-950 text-white hover:bg-slate-800"
                      >
                        {savingProduct
                          ? "Saving..."
                          : editingProductId
                            ? "Update product"
                            : "Publish product"}
                      </Button>
                      <Button
                        type="button"
                        onClick={resetProductForm}
                        className="bg-white text-slate-700"
                      >
                        Save as draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3 text-slate-950">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> Product preview
                      </span>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                        Live draft
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductPreview
                      product={productForm}
                      files={productFiles}
                    />
                  </CardContent>
                </Card>

                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-950">
                      <ListFilter className="h-5 w-5" /> Inventory management
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-white text-slate-700"
                        onClick={() =>
                          setSelectedProductIds(
                            filteredProducts.map((item) => item._id),
                          )
                        }
                      >
                        Select all
                      </Button>
                      <Button
                        className="bg-white text-slate-700"
                        onClick={() => setSelectedProductIds([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="bg-slate-950 text-white"
                        onClick={() => handleBulkProductAction("activate")}
                        disabled={selectedProductIds.length === 0}
                      >
                        Activate
                      </Button>
                      <Button
                        className="bg-white text-slate-700"
                        onClick={() => handleBulkProductAction("disable")}
                        disabled={selectedProductIds.length === 0}
                      >
                        Disable
                      </Button>
                      <Button
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={() => handleBulkProductAction("delete")}
                        disabled={selectedProductIds.length === 0}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                      <div className="max-h-[520px] overflow-auto">
                        {loading ? (
                          <SkeletonRows rows={5} />
                        ) : filteredProducts.length === 0 ? (
                          <EmptyState
                            icon={Package}
                            title="No products found"
                            description="Adjust your filters or create a new product."
                          />
                        ) : (
                          filteredProducts.map((product) => (
                            <div
                              key={product._id}
                              className="grid gap-4 border-b border-slate-100 p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
                            >
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(
                                  product._id,
                                )}
                                onChange={(e) =>
                                  setSelectedProductIds((prev) =>
                                    e.target.checked
                                      ? [...prev, product._id]
                                      : prev.filter((id) => id !== product._id),
                                  )
                                }
                              />
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    product.productImg?.[0]?.url || "/Ekart.png"
                                  }
                                  alt={product.productName}
                                  className="h-14 w-14 rounded-2xl object-cover"
                                />
                                <div>
                                  <p className="font-medium text-slate-950">
                                    {product.productName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {product.category}{" "}
                                    {product.subCategory
                                      ? `• ${product.subCategory}`
                                      : ""}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                                    <Pill>
                                      {formatCurrency(product.productPrice)}
                                    </Pill>
                                    <Pill>{product.stock ?? 0} stock</Pill>
                                    <Pill
                                      tone={
                                        product.isFeatured ? "amber" : "slate"
                                      }
                                    >
                                      {product.isFeatured
                                        ? "Featured"
                                        : "Standard"}
                                    </Pill>
                                    <Pill
                                      tone={
                                        product.isActive === false
                                          ? "rose"
                                          : "emerald"
                                      }
                                    >
                                      {product.isActive === false
                                        ? "Disabled"
                                        : "Active"}
                                    </Pill>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  className="bg-slate-950 text-white"
                                  onClick={() => openProductEditor(product)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  className="bg-white text-slate-700"
                                  onClick={() =>
                                    updateProductStatus(product, {
                                      isFeatured: !product.isFeatured,
                                    })
                                  }
                                >
                                  {product.isFeatured ? "Unfeature" : "Feature"}
                                </Button>
                                <Button
                                  className="bg-white text-slate-700"
                                  onClick={() =>
                                    updateProductStatus(product, {
                                      isActive: !product.isActive,
                                    })
                                  }
                                >
                                  {product.isActive === false
                                    ? "Enable"
                                    : "Disable"}
                                </Button>
                                <Button
                                  className="bg-red-600 text-white hover:bg-red-500"
                                  onClick={() => deleteProduct(product._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          {activeSection === "categories" ? (
            <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <FolderKanban className="h-5 w-5" />{" "}
                    {editingCategoryId ? "Edit category" : "Add category"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveCategory} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Category name"
                        required
                        className="md:col-span-2"
                      >
                        <Input
                          list="category-hints"
                          value={categoryForm.name}
                          onChange={(e) =>
                            onCategoryChange("name", e.target.value)
                          }
                          placeholder="Men's Shoes"
                        />
                        <datalist id="category-hints">
                          {categorySuggestions.map((category) => (
                            <option key={category} value={category} />
                          ))}
                          {recentCategorySuggestions.map((category) => (
                            <option
                              key={`recent-cat-${category}`}
                              value={category}
                            />
                          ))}
                        </datalist>
                      </Field>
                      <Field label="Parent category">
                        <select
                          value={categoryForm.parentCategory}
                          onChange={(e) =>
                            onCategoryChange("parentCategory", e.target.value)
                          }
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                        >
                          <option value="">No parent</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Sort order">
                        <Input
                          type="number"
                          value={categoryForm.sortOrder}
                          onChange={(e) =>
                            onCategoryChange("sortOrder", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Category image">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setCategoryImage(e.target.files?.[0] || null)
                          }
                        />
                      </Field>
                      <Field
                        label="Description"
                        className="md:col-span-2"
                        required
                      >
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) =>
                            onCategoryChange("description", e.target.value)
                          }
                          rows={4}
                          className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                          placeholder="Describe what belongs in this category..."
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                      <CheckField
                        label="Category active"
                        checked={categoryForm.isActive}
                        onChange={(value) =>
                          onCategoryChange("isActive", value)
                        }
                      />
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        Prevent duplicates with slug validation and smart
                        suggestions.
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={savingCategory}
                        className="bg-slate-950 text-white hover:bg-slate-800"
                      >
                        {savingCategory
                          ? "Saving..."
                          : editingCategoryId
                            ? "Update category"
                            : "Create category"}
                      </Button>
                      <Button
                        type="button"
                        onClick={resetCategoryForm}
                        className="bg-white text-slate-700"
                      >
                        Save as draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-950">
                      <Tag className="h-5 w-5" /> Category preview and
                      suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CategoryPreview
                      form={categoryForm}
                      image={categoryImage}
                    />
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Recently used
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recentCategorySuggestions.length > 0 ? (
                          recentCategorySuggestions.map((item) => (
                            <Pill key={item}>{item}</Pill>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">
                            No recent categories yet.
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3 text-slate-950">
                      <span className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" /> Category hierarchy
                      </span>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                        {categories.length} items
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      <SkeletonRows rows={4} />
                    ) : filteredCategories.length === 0 ? (
                      <EmptyState
                        icon={FolderKanban}
                        title="No categories found"
                        description="Create categories to power product suggestions and hierarchy."
                      />
                    ) : (
                      filteredCategories.map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div>
                            <p className="font-medium text-slate-950">
                              {category.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {category.parentCategory?.name || "Root category"}{" "}
                              • {category.slug}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              <Pill
                                tone={
                                  category.isActive === false
                                    ? "rose"
                                    : "emerald"
                                }
                              >
                                {category.isActive === false
                                  ? "Disabled"
                                  : "Active"}
                              </Pill>
                              <Pill>{category.sortOrder ?? 0} sort</Pill>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="bg-slate-950 text-white"
                              onClick={() => openCategoryEditor(category)}
                            >
                              Edit
                            </Button>
                            <Button
                              className="bg-white text-slate-700"
                              onClick={() =>
                                updateCategoryStatus(
                                  category,
                                  !(category.isActive !== false),
                                )
                              }
                            >
                              {category.isActive === false
                                ? "Enable"
                                : "Disable"}
                            </Button>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-500"
                              onClick={() => deleteCategory(category._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          {activeSection === "orders" ? (
            <SectionHeader
              title="Orders"
              description="Monitor payment status, shipping state, tracking numbers, and refunds."
              actions={[
                <Button
                  key="refresh"
                  className="bg-slate-950 text-white"
                  onClick={loadData}
                >
                  Refresh
                </Button>,
              ]}
            />
          ) : null}
          {activeSection === "orders" ? (
            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardContent className="space-y-3 p-5">
                {loading ? (
                  <SkeletonRows rows={5} />
                ) : filteredOrders.length === 0 ? (
                  <EmptyState
                    icon={Truck}
                    title="No orders yet"
                    description="Orders will appear here once checkout is connected."
                  />
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <OrderRow
                        order={order}
                        onSave={handleOrderSave}
                        onRefund={handleRefund}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {activeSection === "customers" ? (
            <SectionHeader
              title="Customers"
              description="Manage blocking, verification, and admin role changes."
              actions={[
                <Button
                  key="refresh"
                  className="bg-slate-950 text-white"
                  onClick={loadData}
                >
                  Refresh
                </Button>,
              ]}
            />
          ) : null}
          {activeSection === "customers" ? (
            <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardContent className="p-5">
                {loading ? (
                  <SkeletonRows rows={5} />
                ) : filteredUsers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No customers found"
                    description="Use the search box or wait for users to sign up."
                  />
                ) : (
                  filteredUsers.map((item) => (
                    <div
                      key={item._id}
                      className="mb-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm last:mb-0"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-slate-950">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{item.email}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            <Pill>{item.role || "user"}</Pill>
                            <Pill tone={item.isVerified ? "emerald" : "amber"}>
                              {item.isVerified ? "Verified" : "Unverified"}
                            </Pill>
                            <Pill tone={item.isBlocked ? "rose" : "emerald"}>
                              {item.isBlocked ? "Blocked" : "Active"}
                            </Pill>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            className="bg-slate-950 text-white"
                            onClick={() => toggleUserRole(item)}
                          >
                            {item.role === "admin" ? "Make user" : "Make admin"}
                          </Button>
                          <Button
                            className={
                              item.isBlocked
                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                : "bg-red-600 text-white hover:bg-red-500"
                            }
                            onClick={() => toggleUserBlock(item)}
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

          {activeSection === "coupons" ? (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Percent className="h-5 w-5" />{" "}
                    {editingCouponId ? "Edit coupon" : "Create coupon"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveCoupon} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Code" required>
                        <Input
                          value={couponForm.code}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              code: e.target.value,
                            }))
                          }
                          placeholder="SAVE20"
                        />
                      </Field>
                      <Field label="Type">
                        <select
                          value={couponForm.discountType}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              discountType: e.target.value,
                            }))
                          }
                          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-950"
                        >
                          <option value="percent">Percent</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </Field>
                      <Field label="Discount value" required>
                        <Input
                          type="number"
                          min="0"
                          value={couponForm.discountValue}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              discountValue: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Minimum purchase">
                        <Input
                          type="number"
                          min="0"
                          value={couponForm.minPurchase}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              minPurchase: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Usage limit">
                        <Input
                          type="number"
                          min="0"
                          value={couponForm.usageLimit}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              usageLimit: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Expires at">
                        <Input
                          type="datetime-local"
                          value={couponForm.expiresAt}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              expiresAt: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Description" className="md:col-span-2">
                        <textarea
                          value={couponForm.description}
                          onChange={(e) =>
                            setCouponForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                          placeholder="Optional coupon description"
                        />
                      </Field>
                    </div>
                    <CheckField
                      label="Coupon active"
                      checked={couponForm.isActive}
                      onChange={(value) =>
                        setCouponForm((prev) => ({ ...prev, isActive: value }))
                      }
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={savingCoupon}
                        className="bg-slate-950 text-white"
                      >
                        {savingCoupon
                          ? "Saving..."
                          : editingCouponId
                            ? "Update coupon"
                            : "Create coupon"}
                      </Button>
                      <Button
                        type="button"
                        className="bg-white text-slate-700"
                        onClick={resetCouponForm}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Percent className="h-5 w-5" /> Coupon library
                  </CardTitle>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                    {filteredCoupons.length} items
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <SkeletonRows rows={4} />
                  ) : filteredCoupons.length === 0 ? (
                    <EmptyState
                      icon={Percent}
                      title="No coupons found"
                      description="Create discount codes to power campaigns and checkout flows."
                    />
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {coupon.code}
                            </p>
                            <p className="text-sm text-slate-500">
                              {coupon.description || "No description"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              <Pill>{coupon.discountType}</Pill>
                              <Pill>
                                {coupon.discountValue}
                                {coupon.discountType === "percent" ? "%" : ""}
                              </Pill>
                              <Pill>
                                {coupon.isActive === false
                                  ? "Disabled"
                                  : "Active"}
                              </Pill>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="bg-slate-950 text-white"
                              onClick={() => openCouponEditor(coupon)}
                            >
                              Edit
                            </Button>
                            <Button
                              className={
                                coupon.isActive === false
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white text-slate-700"
                              }
                              onClick={async () => {
                                await api.put(`/coupon/update/${coupon._id}`, {
                                  isActive: !coupon.isActive,
                                  code: coupon.code,
                                  discountValue: coupon.discountValue,
                                });
                                await loadData();
                              }}
                            >
                              {" "}
                              {coupon.isActive === false ? "Enable" : "Disable"}
                            </Button>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-500"
                              onClick={() => deleteCoupon(coupon._id)}
                            >
                              Delete
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

          {activeSection === "reviews" ? (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Star className="h-5 w-5" />{" "}
                    {editingReviewId ? "Edit review" : "Moderate / add review"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveReview} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Product" required>
                        <select
                          value={reviewForm.productId}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              productId: e.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-950"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.productName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Customer" required>
                        <select
                          value={reviewForm.userId}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              userId: e.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-950"
                        >
                          <option value="">Select customer</option>
                          {users.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.firstName} {item.lastName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Rating" required>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={reviewForm.rating}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Status">
                        <select
                          value={reviewForm.status}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-950"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </Field>
                      <Field label="Comment" className="md:col-span-2">
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          rows={4}
                          className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                          placeholder="Review text"
                        />
                      </Field>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={savingReview}
                        className="bg-slate-950 text-white"
                      >
                        {savingReview
                          ? "Saving..."
                          : editingReviewId
                            ? "Update review"
                            : "Save review"}
                      </Button>
                      <Button
                        type="button"
                        className="bg-white text-slate-700"
                        onClick={resetReviewForm}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Star className="h-5 w-5" /> Review moderation
                  </CardTitle>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                    {filteredReviews.length} items
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <SkeletonRows rows={4} />
                  ) : filteredReviews.length === 0 ? (
                    <EmptyState
                      icon={Star}
                      title="No reviews found"
                      description="Customer reviews will appear here once created."
                    />
                  ) : (
                    filteredReviews.map((review) => (
                      <div
                        key={review._id}
                        className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-slate-950">
                              {review.productId?.productName ||
                                "Unknown product"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {review.userId?.email || "Unknown customer"}
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {review.comment}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              <Pill>{review.rating} star</Pill>
                              <Pill>{review.status}</Pill>
                              <Pill>{review.reportCount || 0} reports</Pill>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="bg-slate-950 text-white"
                              onClick={() => openReviewEditor(review)}
                            >
                              Edit
                            </Button>
                            <Button
                              className="bg-white text-slate-700"
                              onClick={() =>
                                moderateReview(
                                  review._id,
                                  review.status === "approved"
                                    ? "rejected"
                                    : "approved",
                                )
                              }
                            >
                              {review.status === "approved"
                                ? "Reject"
                                : "Approve"}
                            </Button>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-500"
                              onClick={() => deleteReview(review._id)}
                            >
                              Delete
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

          {activeSection === "promotions" ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Megaphone className="h-5 w-5" />{" "}
                    {editingPromotionId ? "Edit promotion" : "Create promotion"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={savePromotion} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title" required>
                        <Input
                          value={promotionForm.title}
                          onChange={(e) =>
                            setPromotionForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Summer Sale"
                        />
                      </Field>
                      <Field label="Type">
                        <select
                          value={promotionForm.targetType}
                          onChange={(e) =>
                            setPromotionForm((prev) => ({
                              ...prev,
                              targetType: e.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-950"
                        >
                          <option value="banner">Banner</option>
                          <option value="campaign">Campaign</option>
                          <option value="featured">Featured</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </Field>
                      <Field label="Products (comma IDs)">
                        <Input
                          value={promotionForm.productIds}
                          onChange={(e) =>
                            setPromotionForm((prev) => ({
                              ...prev,
                              productIds: e.target.value,
                            }))
                          }
                          placeholder="productId1, productId2"
                        />
                      </Field>
                      <Field label="Banner image">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setPromotionFile(e.target.files?.[0] || null)
                          }
                        />
                      </Field>
                      <Field label="Starts at">
                        <Input
                          type="datetime-local"
                          value={promotionForm.startsAt}
                          onChange={(e) =>
                            setPromotionForm((prev) => ({
                              ...prev,
                              startsAt: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Ends at">
                        <Input
                          type="datetime-local"
                          value={promotionForm.endsAt}
                          onChange={(e) =>
                            setPromotionForm((prev) => ({
                              ...prev,
                              endsAt: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Description" className="md:col-span-2">
                        <textarea
                          value={promotionForm.description}
                          onChange={(e) =>
                            setPromotionForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                          placeholder="Promotion details"
                        />
                      </Field>
                    </div>
                    <CheckField
                      label="Promotion active"
                      checked={promotionForm.isActive}
                      onChange={(value) =>
                        setPromotionForm((prev) => ({
                          ...prev,
                          isActive: value,
                        }))
                      }
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={savingPromotion}
                        className="bg-slate-950 text-white"
                      >
                        {savingPromotion
                          ? "Saving..."
                          : editingPromotionId
                            ? "Update promotion"
                            : "Create promotion"}
                      </Button>
                      <Button
                        type="button"
                        className="bg-white text-slate-700"
                        onClick={resetPromotionForm}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Megaphone className="h-5 w-5" /> Promotion board
                  </CardTitle>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                    {filteredPromotions.length} items
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <SkeletonRows rows={4} />
                  ) : filteredPromotions.length === 0 ? (
                    <EmptyState
                      icon={Megaphone}
                      title="No promotions found"
                      description="Create banners and campaigns for the storefront."
                    />
                  ) : (
                    filteredPromotions.map((promotion) => (
                      <div
                        key={promotion._id}
                        className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-3">
                            <img
                              src={promotion.bannerUrl || "/Ekart.png"}
                              alt={promotion.title}
                              className="h-16 w-24 rounded-2xl object-cover"
                            />
                            <div>
                              <p className="font-medium text-slate-950">
                                {promotion.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {promotion.description || "No description"}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                <Pill>{promotion.targetType}</Pill>
                                <Pill>
                                  {promotion.isActive === false
                                    ? "Disabled"
                                    : "Active"}
                                </Pill>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="bg-slate-950 text-white"
                              onClick={() => openPromotionEditor(promotion)}
                            >
                              Edit
                            </Button>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-500"
                              onClick={() => deletePromotion(promotion._id)}
                            >
                              Delete
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

          {activeSection === "media" ? (
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <ImagePlus className="h-5 w-5" /> Upload media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveMedia} className="space-y-4">
                    <Field label="File" required>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setMediaFile(e.target.files?.[0] || null)
                        }
                      />
                    </Field>
                    <Field label="Folder">
                      <Input
                        value={mediaForm.folder}
                        onChange={(e) =>
                          setMediaForm((prev) => ({
                            ...prev,
                            folder: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Tags">
                      <Input
                        value={mediaForm.tags}
                        onChange={(e) =>
                          setMediaForm((prev) => ({
                            ...prev,
                            tags: e.target.value,
                          }))
                        }
                        placeholder="banner, hero, sale"
                      />
                    </Field>
                    <Field label="Alt text">
                      <Input
                        value={mediaForm.altText}
                        onChange={(e) =>
                          setMediaForm((prev) => ({
                            ...prev,
                            altText: e.target.value,
                          }))
                        }
                        placeholder="Descriptive alt text"
                      />
                    </Field>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={savingMedia}
                        className="bg-slate-950 text-white"
                      >
                        {savingMedia ? "Uploading..." : "Upload media"}
                      </Button>
                      <Button
                        type="button"
                        className="bg-white text-slate-700"
                        onClick={resetMediaForm}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <ImagePlus className="h-5 w-5" /> Media library
                  </CardTitle>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                    {filteredMedia.length} files
                  </span>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <SkeletonRows rows={4} />
                  ) : filteredMedia.length === 0 ? (
                    <EmptyState
                      icon={ImagePlus}
                      title="No media uploaded"
                      description="Upload images to link them with products, banners, and categories."
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredMedia.map((item) => (
                        <div
                          key={item._id}
                          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                        >
                          <img
                            src={item.url}
                            alt={item.altText || item.filename}
                            className="h-40 w-full object-cover"
                          />
                          <div className="space-y-2 p-4">
                            <p className="font-medium text-slate-950">
                              {item.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.folder}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(item.tags || []).join(", ") || "No tags"}
                            </p>
                            <Button
                              className="bg-red-600 text-white hover:bg-red-500"
                              onClick={() => deleteMedia(item._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeSection === "reports" ? (
            <div className="space-y-6">
              <SectionHeader
                title="Reports"
                description="Revenue, order status, category performance, and top products."
                actions={[
                  <Button
                    key="refresh"
                    className="bg-slate-950 text-white"
                    onClick={loadData}
                  >
                    Refresh
                  </Button>,
                ]}
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={CreditCard}
                  label="Revenue"
                  value={formatCurrency(reports?.revenue || 0)}
                  detail="All recorded orders"
                />
                <MetricCard
                  icon={Truck}
                  label="Orders"
                  value={reports?.orders || 0}
                  detail="Status-tracked records"
                />
                <MetricCard
                  icon={Users}
                  label="Customers"
                  value={reports?.customers || 0}
                  detail="Registered users"
                />
                <MetricCard
                  icon={FolderKanban}
                  label="Categories"
                  value={categories.length}
                  detail="Catalog grouping"
                />
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-slate-950">
                      Order status breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reports?.salesByStatus ? (
                      Object.entries(reports.salesByStatus).map(
                        ([status, count]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <span className="capitalize text-slate-700">
                              {status}
                            </span>
                            <span className="font-semibold text-slate-950">
                              {count}
                            </span>
                          </div>
                        ),
                      )
                    ) : (
                      <SkeletonRows rows={3} />
                    )}
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-slate-950">
                      Top products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reports?.topProducts ? (
                      reports.topProducts.map((item) => (
                        <div
                          key={item.productName}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-slate-950">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.category}
                            </p>
                          </div>
                          <span className="font-semibold text-slate-950">
                            {item.sold} sold
                          </span>
                        </div>
                      ))
                    ) : (
                      <SkeletonRows rows={3} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          {activeSection === "notifications" ? (
            <div className="space-y-6">
              <SectionHeader
                title="Notifications"
                description="Live system signals from inventory, orders, and recent activity."
                actions={[
                  <Button
                    key="refresh"
                    className="bg-slate-950 text-white"
                    onClick={loadData}
                  >
                    Refresh
                  </Button>,
                ]}
              />
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-950">
                      <Bell className="h-5 w-5" /> System alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(overview?.lowStockProducts?.length
                      ? overview.lowStockProducts
                      : products.filter((item) => Number(item.stock || 0) <= 5)
                    ).length === 0 ? (
                      <EmptyState
                        icon={Bell}
                        title="No alerts"
                        description="Inventory and order notifications will surface here automatically."
                      />
                    ) : (
                      (overview?.lowStockProducts?.length
                        ? overview.lowStockProducts
                        : products.filter(
                            (item) => Number(item.stock || 0) <= 5,
                          )
                      ).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-slate-950">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Low inventory alert
                            </p>
                          </div>
                          <Pill tone="amber">Stock {item.stock ?? 0}</Pill>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-950">
                      <Sparkles className="h-5 w-5" /> Recent events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(overview?.recentActivity?.length
                      ? overview.recentActivity
                      : []
                    ).length === 0 ? (
                      <EmptyState
                        icon={Sparkles}
                        title="No events yet"
                        description="Admin activity will appear here as products, orders, and users change."
                      />
                    ) : (
                      overview.recentActivity.map((item, index) => (
                        <ActivityItem
                          key={`${item.label}-${index}`}
                          label={item.type}
                          value={item.label}
                          detail={new Date(item.createdAt).toLocaleString()}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
          {activeSection === "settings" ? (
            <div className="space-y-6">
              <SectionHeader
                title="Settings"
                description="Account and store status summary for the current admin session."
                actions={[
                  <Button
                    key="users"
                    className="bg-slate-950 text-white"
                    onClick={() => navigate("/admin/customers")}
                  >
                    Manage users
                  </Button>,
                  <Button
                    key="products"
                    className="bg-white text-slate-700"
                    onClick={() => navigate("/admin/products")}
                  >
                    Manage products
                  </Button>,
                ]}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={ShieldCheck}
                  label="Admin account"
                  value="Active"
                  detail={`${user.firstName} ${user.lastName}`}
                />
                <MetricCard
                  icon={Users}
                  label="Admin users"
                  value={users.filter((item) => item.role === "admin").length}
                  detail="Privileged accounts"
                />
                <MetricCard
                  icon={Boxes}
                  label="Catalog health"
                  value={stats.activeProducts}
                  detail="Visible products"
                />
                <MetricCard
                  icon={Truck}
                  label="Orders tracked"
                  value={orders.length}
                  detail="Status managed"
                />
              </div>
              <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Settings className="h-5 w-5" /> Operational shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Button
                    className="bg-slate-950 text-white"
                    onClick={() => navigate("/admin/orders")}
                  >
                    Open orders
                  </Button>
                  <Button
                    className="bg-white text-slate-700"
                    onClick={() => navigate("/admin/coupons")}
                  >
                    Open coupons
                  </Button>
                  <Button
                    className="bg-white text-slate-700"
                    onClick={() => navigate("/admin/reports")}
                  >
                    Open reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {sectionOrder.map((slug) => {
            const config = sectionConfig[slug];
            const Icon = config.icon;
            return (
              <button
                key={slug}
                onClick={() =>
                  navigate(slug === "dashboard" ? "/admin" : `/admin/${slug}`)
                }
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${activeSection === slug ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children, className = "" }) => (
  <div className={`grid gap-2 ${className}`}>
    <Label className="text-sm font-medium text-slate-700">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </Label>
    {children}
  </div>
);

const CheckField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-slate-300 text-slate-950"
    />
    {label}
  </label>
);

const ProductPreview = ({ product, files }) => {
  const previewFile = files[0];
  const previewImage = previewFile ? filePreviewUrl(previewFile) : "/Ekart.png";
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="aspect-[4/3] bg-slate-100">
        <img
          src={previewImage}
          alt="Product preview"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-950">
            {product.productName || "Product title"}
          </p>
          {product.isFeatured ? <Pill tone="amber">Featured</Pill> : null}
        </div>
        <p className="text-sm text-slate-500">
          {product.category || "Category"}{" "}
          {product.subCategory ? `• ${product.subCategory}` : ""}
        </p>
        <p className="line-clamp-2 text-sm text-slate-600">
          {product.productDesc ||
            "The product description preview appears here before publishing."}
        </p>
        <div className="flex items-center justify-between pt-2">
          <p className="text-lg font-semibold text-slate-950">
            {formatCurrency(product.productPrice || 0)}
          </p>
          <p className="text-sm text-slate-500">Stock {product.stock ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

const CategoryPreview = ({ form, image }) => {
  const previewImage = image ? filePreviewUrl(image) : "/Ekart.png";
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="aspect-[16/9] bg-slate-100">
        <img
          src={previewImage}
          alt="Category preview"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-950">
            {form.name || "Category name"}
          </p>
          {form.isActive ? (
            <Pill tone="emerald">Active</Pill>
          ) : (
            <Pill tone="rose">Disabled</Pill>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {form.description || "Category description preview"}
        </p>
        <p className="text-sm text-slate-600">
          Sort order: {form.sortOrder || 0}
        </p>
      </div>
    </div>
  );
};

const ActivityItem = ({ label, value, detail }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-950">{label}</p>
      <Coins className="h-4 w-4 text-orange-500" />
    </div>
    <p className="mt-2 text-sm text-slate-700">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>
);

const FeatureSection = ({ title, icon: Icon, description }) => (
  <Card className="border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
    <CardContent className="p-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/20">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
        <div className="mt-8 grid w-full gap-4 md:grid-cols-3">
          <QuickTile
            title="Modern UI"
            text="Premium cards, spacing, and motion."
          />
          <QuickTile
            title="Dedicated pages"
            text="Each section is route-driven and reachable."
          />
          <QuickTile
            title="Production ready"
            text="Designed for actual store operations."
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickTile = ({ title, text }) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-left">
    <p className="font-medium text-slate-950">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{text}</p>
  </div>
);

const OrderRow = ({ order, onSave, onRefund }) => {
  const [status, setStatus] = useState(order.status || "pending");
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || "",
  );

  useEffect(() => {
    setStatus(order.status || "pending");
    setTrackingNumber(order.trackingNumber || "");
  }, [order]);

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 xl:grid-cols-[1fr_auto] xl:items-center">
      <div>
        <div className="flex items-center gap-3">
          <p className="font-semibold text-slate-950">
            Order #{order._id.slice(-6).toUpperCase()}
          </p>
          <Pill tone="slate">{order.status || "pending"}</Pill>
          <Pill tone="emerald">{order.paymentStatus || "pending"}</Pill>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {order.userId?.email || "Unknown customer"}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Total: {formatCurrency(order.totalAmount || 0)}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:min-w-[540px]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-slate-950"
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
            className="bg-slate-950 text-white"
            onClick={() => onSave(order._id, { status, trackingNumber })}
          >
            Save
          </Button>
          <Button
            className="bg-white text-slate-700"
            onClick={() => onRefund(order._id)}
          >
            Refund
          </Button>
        </div>
      </div>
    </div>
  );
};

const Pill = ({ children, tone = "slate" }) => {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
};

export default AdminDashboardPage;
