import FilterSidebar from "@/components/ui/FilterSidebar";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import ProductCard from "@/components/ui/ProductCard";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "@/redux/productsSlice";
import api from "@/lib/api";
import { ArrowRight, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const Products = () => {
  const { products } = useSelector((store) => store.product);

  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [sortOrder, setSortOrder] = useState("");

  const dispatch = useDispatch();

  const counts = useMemo(() => {
    const visible = products || [];
    return {
      total: visible.length,
      featured: visible.filter((item) => item.isFeatured).length,
      active: visible.filter((item) => item.isActive !== false).length,
    };
  }, [products]);

  // ✅ FETCH PRODUCTS
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/product/getallproducts");

      const productsList = res.data.products || [];
      setAllProducts(productsList);
      dispatch(setProducts(productsList));
    } catch (error) {
      console.log(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER + SORT LOGIC
  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    // ✅ SEARCH
    if (search.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.productName?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // ✅ CATEGORY
    if (category !== "all") {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase(),
      );
    }

    // ✅ BRAND
    if (brand !== "all") {
      filtered = filtered.filter(
        (p) => p.brand?.toLowerCase() === brand.toLowerCase(),
      );
    }

    // ✅ PRICE RANGE
    filtered = filtered.filter(
      (p) => p.productPrice >= priceRange[0] && p.productPrice <= priceRange[1],
    );

    // ✅ SORTING
    if (sortOrder === "lowToHigh") {
      filtered.sort((a, b) => a.productPrice - b.productPrice);
    } else if (sortOrder === "highToLow") {
      filtered.sort((a, b) => b.productPrice - a.productPrice);
    }

    dispatch(setProducts(filtered));
  }, [search, category, brand, priceRange, sortOrder, allProducts, dispatch]);

  useEffect(() => {
    getAllProducts();
  }, []);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    const categoryQuery = searchParams.get("category") || "";

    if (query) setSearch(query);
    if (categoryQuery) setCategory(categoryQuery);
  }, [searchParams]);

  return (
    <div className="px-4 pb-16 pt-28 lg:px-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(71,85,105,0.9))] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">
                Product catalog
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                Browse a refined catalog built for discovery.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                Premium filtering, focused product cards, and polished
                merchandising help shoppers move faster from browsing to
                checkout.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                [counts.total, "items"],
                [counts.featured, "featured"],
                [counts.active, "active"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center backdrop-blur"
                >
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[340px_1fr]">
          <FilterSidebar
            search={search}
            setSearch={setSearch}
            brand={brand}
            setBrand={setBrand}
            category={category}
            setCategory={setCategory}
            setPriceRange={setPriceRange}
            allProducts={allProducts}
            priceRange={priceRange}
          />

          <div className="flex flex-col">
            <div className="mb-5 flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Search className="h-4 w-4 text-slate-400" />
                {products.length} products ready to explore
              </div>
              <div className="flex items-center gap-3">
                <Select onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Sort products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="lowToHigh">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="highToLow">
                        Price: High to Low
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  View cart
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductCard
                    key={index}
                    product={{ productImg: [] }}
                    loading
                  />
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm backdrop-blur">
                  No products match the current filters.
                </div>
              ) : (
                products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    loading={loading}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
