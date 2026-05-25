import React from "react";
import { Input } from "./input";
import { Button } from "./button";

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
    <div className="bg-gray-100 mt-10 p-4 rounded-md h-max hidden md:block w-64">
      <Input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white p-2 rounded-md border-gray-400 border-2 w-full"
      />

      <h1 className="mt-5 font-semibold text-xl">Category</h1>
      <div className="flex flex-col gap-2 mt-3">
        {UniqueCategory.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              checked={category === item}
              onChange={() => handleCategoryClick(item)}
            />
            <label>{item.toUpperCase()}</label>
          </div>
        ))}
      </div>

      <h1 className="mt-5 font-semibold text-xl">Brand</h1>
      <select
        className="bg-white w-full p-2 border-gray-200 border-2 rounded-md"
        value={brand}
        onChange={handleBrandChange}
      >
        {UniqueBrand.map((item, index) => (
          <option key={index} value={item}>
            {item.toUpperCase()}
          </option>
        ))}
      </select>

      <h1 className="mt-5 font-semibold text-xl mb-3">Price Range</h1>

      <label>
        Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
      </label>

      <div className="flex gap-2 items-center mt-2">
        <input
          type="number"
          min="0"
          max="999999"
          value={priceRange[0]}
          onChange={handleMinChange}
          className="w-24 p-1 border border-gray-300 rounded"
        />
        <span>-</span>
        <input
          type="number"
          min="0"
          max="999999"
          value={priceRange[1]}
          onChange={handleMaxChange}
          className="w-24 p-1 border border-gray-300 rounded"
        />
      </div>

      {/* ✅ Correct Range Sliders */}
      <input
        type="range"
        min="0"
        max="999999"
        step="100"
        className="w-full mt-2"
        value={priceRange[0]}
        onChange={handleMinChange}
      />

      <input
        type="range"
        min="0"
        max="999999"
        step="100"
        className="w-full"
        value={priceRange[1]}
        onChange={handleMaxChange}
      />

      {/* ✅ Reset Button Fixed */}
      <Button
        onClick={resetFilters}
        className="bg-red-600 text-white mt-5 cursor-pointer w-full"
      >
        Reset Filter
      </Button>
    </div>
  );
};

export default FilterSidebar;
