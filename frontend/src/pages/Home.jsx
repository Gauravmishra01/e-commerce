import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Headphones,
  Laptop,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Watch,
} from "lucide-react";

import Features from "@/components/ui/Features";
import Hero from "@/components/ui/Hero";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const sections = useMemo(() => {
    const activeProducts = products.filter((item) => item.isActive !== false);

    return {
      featured: activeProducts.filter((item) => item.isFeatured).slice(0, 4),
      trending: [...activeProducts]
        .sort(
          (a, b) => Number(b.productPrice || 0) - Number(a.productPrice || 0),
        )
        .slice(0, 4),
      arrivals: [...activeProducts].slice(-4).reverse(),
      bestSellers: activeProducts
        .filter((item) => Number(item.stock || 0) > 10)
        .slice(0, 4),
      flashDeals: [...activeProducts]
        .sort(
          (a, b) => Number(a.productPrice || 0) - Number(b.productPrice || 0),
        )
        .slice(0, 4),
    };
  }, [products]);

  const categories = [
    {
      icon: Laptop,
      label: "Electronics",
      value: "Laptops, tablets, and accessories",
    },
    {
      icon: MonitorSmartphone,
      label: "Smart Living",
      value: "Connected devices for modern homes",
    },
    {
      icon: Headphones,
      label: "Audio",
      value: "Immersive sound and premium listening",
    },
    {
      icon: Watch,
      label: "Wearables",
      value: "Lifestyle tech and daily essentials",
    },
  ];

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
    <div>
      <Hero />
      <Features />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 lg:px-0 lg:pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "10k+",
              "orders fulfilled",
              "Reliable fulfillment designed for trust",
            ],
            [
              "48h",
              "priority dispatch",
              "A premium experience with fast logistics",
            ],
            [
              "4.9/5",
              "customer rating",
              "High satisfaction across product discovery",
            ],
          ].map(([value, label, detail]) => (
            <div
              key={label}
              className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur"
            >
              <p className="text-3xl font-semibold text-slate-950">{value}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-sm text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-0">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(71,85,105,0.94))] p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75">
              <Sparkles className="h-4 w-4" />
              Hero promotion
            </div>
            <h2 className="mt-5 max-w-lg text-3xl font-semibold leading-tight md:text-4xl">
              Premium drops, seasonal offers, and elevated shopping in one
              place.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
              Merchandising that feels editorial, navigation that feels instant,
              and product journeys built around conversion.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                Shop featured
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View cart
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.label}
                  className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">
                    {category.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {category.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-0">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Featured products</p>
            <h2 className="section-title mt-2">
              Curated picks that feel premium
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ProductCard key={index} product={{ productImg: [] }} loading />
            ))
          ) : sections.featured.length > 0 ? (
            sections.featured.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                loading={false}
              />
            ))
          ) : (
            <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm backdrop-blur">
              No featured products yet.
            </div>
          )}
        </div>
      </section>

      {[
        ["Trending now", sections.trending],
        ["Best sellers", sections.bestSellers],
        ["Flash deals", sections.flashDeals],
        ["New arrivals", sections.arrivals],
      ].map(([title, lane]) => (
        <section key={title} className="mx-auto max-w-7xl px-4 py-8 lg:px-0">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">{title}</p>
              <h2 className="section-title mt-2">
                {title === "Flash deals"
                  ? "Limited-time picks with high visual impact"
                  : title}
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              Browse catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex snap-x gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(loading ? Array.from({ length: 4 }) : lane).map((item, index) => (
              <div
                key={item?._id || index}
                className="min-w-[280px] max-w-[280px] snap-start sm:min-w-[320px] sm:max-w-[320px]"
              >
                {loading ? (
                  <ProductCard product={{ productImg: [] }} loading />
                ) : (
                  <ProductCard product={item} loading={false} />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-0">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="section-label">Trust & service</p>
            <h2 className="section-title mt-2">
              Built like a premium retail platform
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                [Truck, "Fast fulfillment"],
                [ShieldCheck, "Protected checkout"],
                [Star, "High rating"],
              ].map(([FeatureIcon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-slate-50 p-4 text-center"
                >
                  {React.createElement(FeatureIcon, {
                    className: "mx-auto h-5 w-5 text-slate-950",
                  })}
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-950 bg-slate-950 p-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
              Newsletter
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Get drops, offers, and product launches first.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              A lightweight newsletter block with clean inputs and strong
              hierarchy keeps the page feeling premium without clutter.
            </p>
            <div className="mt-6 flex gap-3">
              <input
                className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none"
                placeholder="Email address"
                type="email"
              />
              <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Join
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
