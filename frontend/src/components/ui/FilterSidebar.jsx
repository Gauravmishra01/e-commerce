import React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Filter, RotateCcw, Search } from "lucide-react";

const FilterSidebar = ({
  search,
  setSearch,
  category,
  setCategory,
  brand,
  setBrand,
  setPriceRange,
  allProducts,
  priceRange,
}) => {
  const Categories = allProducts.map((p) => p.category?.trim().toLowerCase());
  const UniqueCategory = ["all", ...new Set(Categories)];

  const Brands = allProducts.map((p) => p.brand?.trim().toLowerCase());
  const UniqueBrand = ["all", ...new Set(Brands)];

  const handleCategoryClick = (val) => {
    setCategory(val);
  };

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
  };

  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    if (value <= priceRange[1]) {
      setPriceRange([value, priceRange[1]]);
    }
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value >= priceRange[0]) {
      setPriceRange([priceRange[0], value]);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setBrand("all");
    setPriceRange([0, 999999]);
  };

  return (
    <aside className="sticky top-24 hidden h-max w-80 rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:block">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Filter className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Smart filters
          </p>
          <h2 className="text-lg font-semibold text-slate-950">
            Refine results
          </h2>
        </div>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {UniqueCategory.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCategoryClick(item)}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${category === item ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Brand
          </h3>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
            value={brand}
            onChange={handleBrandChange}
          >
            {UniqueBrand.map((item, index) => (
              <option key={index} value={item}>
                {item.toUpperCase()}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Price Range
            </h3>
            <p className="text-sm font-medium text-slate-700">
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              max="999999"
              value={priceRange[0]}
              onChange={handleMinChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
            />
            <input
              type="number"
              min="0"
              max="999999"
              value={priceRange[1]}
              onChange={handleMaxChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
            />
          </div>

          <input
            type="range"
            min="0"
            max="999999"
            step="100"
            className="w-full accent-slate-950"
            value={priceRange[0]}
            onChange={handleMinChange}
          />

          <input
            type="range"
            min="0"
            max="999999"
            step="100"
            className="w-full accent-slate-950"
            value={priceRange[1]}
            onChange={handleMaxChange}
          />
        </section>

        <Button onClick={resetFilters} className="w-full">
          <RotateCcw className="h-4 w-4" />
          Reset filters
        </Button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
