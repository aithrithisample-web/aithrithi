"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Grid3X3,
  LayoutGrid,
  Check,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";

interface ShopFilterLayoutProps {
  initialProducts: any[];
  categories: any[];
  allowReviews?: boolean;
}

const BOUTIQUE_SIZES = ["Free Size", "XS", "S", "M", "L", "XL", "XXL"];

const BOUTIQUE_COLORS = [
  { name: "Vermilion Red", hex: "#9B111E" },
  { name: "Royal Maroon", hex: "#58111A" },
  { name: "Emerald Green", hex: "#046307" },
  { name: "Antique Gold", hex: "#DEB660" },
  { name: "Kasavu / Off-White", hex: "#FAF5E8" },
  { name: "Pastel Rose", hex: "#D97D8F" },
  { name: "Midnight Black", hex: "#222222" },
];

export function ShopFilterLayout({
  initialProducts,
  categories,
  allowReviews = false,
}: ShopFilterLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get("category") || ""
  );
  const [selectedSort, setSelectedSort] = useState<string>(
    searchParams?.get("sort") || "featured"
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(4);

  // Sync with URL query parameters
  useEffect(() => {
    const cat = searchParams?.get("category") || "";
    setSelectedCategory(cat);
    const sort = searchParams?.get("sort") || "featured";
    setSelectedSort(sort);
  }, [searchParams]);

  // Lock background scroll when drawer is open on mobile
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    initialProducts.forEach((p) => {
      const slug = p.category?.slug;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category?.slug?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Price Range
    result = result.filter((p) => {
      const price = p.salePrice || p.regularPrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by Size (if variants contain size attribute or title)
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        const hasMatchingVariant = p.variants?.some((v: any) =>
          selectedSizes.some((s) =>
            v.title?.toLowerCase().includes(s.toLowerCase())
          )
        );
        const hasMatchingTitle = selectedSizes.some((s) =>
          p.title?.toLowerCase().includes(s.toLowerCase())
        );
        return hasMatchingVariant || hasMatchingTitle;
      });
    }

    // Filter by Color
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        const descAndTitle = `${p.title || ""} ${p.description || ""}`.toLowerCase();
        return selectedColors.some((c) => descAndTitle.includes(c.toLowerCase()));
      });
    }

    // Sort Logic (Vedhika Options)
    switch (selectedSort) {
      case "price-asc":
        result.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
        break;
      case "price-desc":
        result.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "featured":
      default:
        // maintain default ordering
        break;
    }

    return result;
  }, [initialProducts, selectedCategory, selectedSort, selectedSizes, selectedColors, priceRange]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleClearAll = () => {
    setSelectedCategory("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 100000]);
    setSelectedSort("featured");
    router.push("/shop");
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* =====================================================
          1. TOP TOOLBAR — Filter Button, Item Count, View Mode & Sort (Vedhika Style)
          ===================================================== */}
      <div className="border-b border-[#EDEDED] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Filter Toggle Button + Active Count */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#222222] bg-white text-[#222222] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#DEB660] hover:border-[#DEB660] hover:text-black transition-colors rounded-none shadow-2xs active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs text-[#878787] font-medium tracking-wide">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
          </span>
        </div>

        {/* Right: Grid Mode & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          {/* Desktop Column Switcher */}
          <div className="hidden lg:flex items-center gap-1 border-r border-[#E5E5E5] pr-3">
            <button
              type="button"
              onClick={() => setGridColumns(2)}
              className={`p-1.5 border transition-colors ${
                gridColumns === 2
                  ? "border-black text-black bg-slate-50"
                  : "border-transparent text-slate-400 hover:text-black"
              }`}
              title="2 Columns View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setGridColumns(3)}
              className={`p-1.5 border transition-colors ${
                gridColumns === 3
                  ? "border-black text-black bg-slate-50"
                  : "border-transparent text-slate-400 hover:text-black"
              }`}
              title="3 Columns View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setGridColumns(4)}
              className={`p-1.5 border transition-colors ${
                gridColumns === 4
                  ? "border-black text-black bg-slate-50"
                  : "border-transparent text-slate-400 hover:text-black"
              }`}
              title="4 Columns View"
            >
              <span className="font-bold text-xs px-1">4</span>
            </button>
          </div>

          {/* Sort By Dropdown (Vedhika Shopify Options) */}
          <div className="relative inline-flex items-center">
            <label htmlFor="shop-sort" className="text-xs text-[#878787] mr-2 hidden sm:inline">
              Sort by:
            </label>
            <select
              id="shop-sort"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 border border-[#EDEDED] bg-white text-xs font-medium text-[#222222] focus:outline-none focus:border-[#DEB660] rounded-none cursor-pointer tracking-wider"
            >
              <option value="featured">Featured</option>
              <option value="best-selling">Best Selling</option>
              <option value="title-asc">Alphabetically, A-Z</option>
              <option value="title-desc">Alphabetically, Z-A</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="newest">Date, new to old</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Strip */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-[11px] uppercase tracking-wider text-[#888888] font-bold">
            Active Filters:
          </span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FAF7F5] border border-[#DEB660] text-black">
              Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FAF7F5] border border-[#DEB660] text-black"
            >
              Size: {s}
              <button
                type="button"
                onClick={() => toggleSize(s)}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedColors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FAF7F5] border border-[#DEB660] text-black"
            >
              Color: {c}
              <button
                type="button"
                onClick={() => toggleColor(c)}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {(priceRange[0] > 0 || priceRange[1] < 100000) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FAF7F5] border border-[#DEB660] text-black">
              Rs. {priceRange[0].toLocaleString("en-IN")} — Rs. {priceRange[1].toLocaleString("en-IN")}
              <button
                type="button"
                onClick={() => setPriceRange([0, 100000])}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-bold text-rose-600 hover:underline uppercase tracking-wider ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* =====================================================
          2. PRODUCT GRID (2 columns on mobile, configurable on desktop)
          ===================================================== */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-500 space-y-3">
          <p className="text-base font-semibold text-[#222222]">
            No designer products found matching your active filters.
          </p>
          <p className="text-xs text-stone-500">
            Try adjusting your price range, color palette, or size choices.
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-block px-8 py-2.5 bg-[#222222] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#DEB660] hover:text-black transition-colors rounded-none cursor-pointer mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-2 ${
            gridColumns === 2
              ? "sm:grid-cols-2"
              : gridColumns === 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
          } gap-3 sm:gap-5`}
        >
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} showReviews={allowReviews} />
          ))}
        </div>
      )}

      {/* =====================================================
          3. LUXURY OFF-CANVAS FILTER DRAWER (Vedhika Style)
          ===================================================== */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[70]">
          {/* Backdrop */}
          <div
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[88vw] max-w-[360px] bg-white text-[#222222] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 font-sans">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FAF7F5]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#DEB660]" />
                  <span className="font-bold text-sm uppercase tracking-[0.14em] text-[#222222]">
                    Filter Products
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center text-[#222222] hover:bg-[#DEB660] hover:text-black transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Body */}
              <div className="p-5 space-y-6 divide-y divide-[#F0F0F0]">
                {/* 1. By Price */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#222222]">
                    By Price
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>Rs. {priceRange[0].toLocaleString("en-IN")}</span>
                      <span>Rs. {priceRange[1].toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={1000}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-[#DEB660] cursor-pointer"
                    />
                    {/* Quick Price Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPriceRange([0, 10000])}
                        className="py-1 px-2 border border-[#EDEDED] text-slate-700 hover:border-[#DEB660] transition-colors"
                      >
                        Under Rs. 10,000
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceRange([10000, 30000])}
                        className="py-1 px-2 border border-[#EDEDED] text-slate-700 hover:border-[#DEB660] transition-colors"
                      >
                        Rs. 10k — 30k
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceRange([30000, 60000])}
                        className="py-1 px-2 border border-[#EDEDED] text-slate-700 hover:border-[#DEB660] transition-colors"
                      >
                        Rs. 30k — 60k
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceRange([60000, 100000])}
                        className="py-1 px-2 border border-[#EDEDED] text-slate-700 hover:border-[#DEB660] transition-colors"
                      >
                        Above Rs. 60,000
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. By Type / Category */}
                <div className="space-y-3 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#222222]">
                    By Type
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("")}
                        className={`flex items-center justify-between w-full text-left py-1 transition-colors ${
                          !selectedCategory
                            ? "text-[#DEB660] font-bold"
                            : "text-slate-700 hover:text-black"
                        }`}
                      >
                        <span>All Collections</span>
                        <span className="text-[10px] text-slate-400">({initialProducts.length})</span>
                      </button>
                    </li>
                    {categories.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategory(selectedCategory === c.slug ? "" : c.slug)
                          }
                          className={`flex items-center justify-between w-full text-left py-1 transition-colors ${
                            selectedCategory === c.slug
                              ? "text-[#DEB660] font-bold"
                              : "text-slate-700 hover:text-black"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 border flex items-center justify-center ${
                                selectedCategory === c.slug
                                  ? "bg-black border-black text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {selectedCategory === c.slug && <Check className="w-2.5 h-2.5" />}
                            </span>
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({categoryCounts[c.slug] || 0})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. By Size */}
                <div className="space-y-3 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#222222]">
                    By Size
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {BOUTIQUE_SIZES.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border rounded-none transition-all ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-white text-slate-700 border-[#E5E5E5] hover:border-black"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. By Color */}
                <div className="space-y-3 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#222222]">
                    By Color
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {BOUTIQUE_COLORS.map((col) => {
                      const isSelected = selectedColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColor(col.name)}
                          className={`flex items-center gap-2 py-1 px-2 border transition-all text-left ${
                            isSelected
                              ? "border-black bg-slate-50 font-bold"
                              : "border-[#EDEDED] text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="text-[11px] truncate">{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Buttons */}
            <div className="p-4 border-t border-[#F0F0F0] bg-[#FAF7F5] space-y-2">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 bg-[#222222] hover:bg-[#DEB660] text-white hover:text-black font-sans font-bold text-xs uppercase tracking-[0.18em] transition-colors rounded-none shadow-md cursor-pointer"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full py-2 bg-transparent text-[#888888] hover:text-rose-600 font-sans font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
