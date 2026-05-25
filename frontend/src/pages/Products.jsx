import FilterSidebar from "@/components/ui/FilterSidebar";
import React, { useEffect, useState } from "react";
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

const Products = () => {
  const { products } = useSelector((store) => store.product);

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [sortOrder, setSortOrder] = useState("");

  const dispatch = useDispatch();

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

  return (
    <div className="bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_50%,_#e2e8f0)] pt-24 pb-12">
      <div className="mx-auto flex max-w-7xl gap-7 px-4 lg:px-0">
        {/* ✅ SIDEBAR */}
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

        {/* ✅ MAIN PRODUCT SECTION */}
        <div className="flex flex-col flex-1">
          <div className="mb-4 flex justify-end">
            <Select onValueChange={setSortOrder}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort By Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                  <SelectItem value="highToLow">Price: High to Low</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* ✅ PRODUCT GRID */}
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <ProductCard key={index} product={{ productImg: [] }} loading />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
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
  );
};

export default Products;
