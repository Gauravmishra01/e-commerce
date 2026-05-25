import Features from "@/components/ui/Features";
import Footer from "@/components/ui/Footer";
import Hero from "@/components/ui/Hero";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/product/getallproducts");
        setProducts((res.data.products || []).slice(0, 4));
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_50%,_#e2e8f0)]">
      <Hero />
      <Features />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-0">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Featured products
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Popular picks for your storefront
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ProductCard key={index} product={{ productImg: [] }} loading />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                loading={false}
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm backdrop-blur">
              No featured products yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
