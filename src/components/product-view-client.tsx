"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import {
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Heart,
  Play,
  Film,
  Star,
  MessageSquare,
} from "lucide-react";
import { ProductReviews } from "@/components/product-reviews";

export function ProductViewClient({
  product,
  allowReviews = true,
}: {
  product: any;
  allowReviews?: boolean;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isSaved = isInWishlist(product.id);

  const initialImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

  const [selectedImg, setSelectedImg] = useState<string>(initialImage);
  const [activeMediaType, setActiveMediaType] = useState<"image" | "video">("image");

  // Parse structured variant attributes (Size, Colour, Hex)
  const parsedVariants = useMemo(() => {
    return (product.variants || []).map((v: any) => {
      let size = "";
      let color = "";
      let colorHex = "";
      if (v.attributesJson) {
        try {
          const attrs = JSON.parse(v.attributesJson);
          size = attrs.size || attrs.Size || "";
          color = attrs.color || attrs.Color || "";
          colorHex = attrs.colorHex || "";
        } catch {}
      }
      if (!size && !color && v.title) {
        const parts = v.title.split("/").map((s: string) => s.trim());
        if (parts.length >= 2) {
          size = parts[0];
          color = parts[1];
        } else {
          size = v.title;
        }
      }
      return {
        ...v,
        size: size.trim(),
        color: color.trim(),
        colorHex: colorHex || "#58111A",
      };
    });
  }, [product.variants]);

  const availableSizes = useMemo(() => {
    const list: string[] = [];
    parsedVariants.forEach((v: any) => {
      if (v.size && !list.includes(v.size)) list.push(v.size);
    });
    return list;
  }, [parsedVariants]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    parsedVariants.forEach((v: any) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, v.colorHex || "#58111A");
      }
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [parsedVariants]);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return parsedVariants[0]?.size || "";
  });
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    return parsedVariants[0]?.color || "";
  });

  const [selectedVariant, setSelectedVariant] = useState<any | null>(
    product.variants?.length > 0 ? product.variants[0] : null
  );

  // Synchronize selectedVariant when selectedSize or selectedColor changes
  useEffect(() => {
    if (parsedVariants.length === 0) return;

    let match = parsedVariants.find(
      (v: any) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    );

    if (!match && selectedSize) {
      match = parsedVariants.find((v: any) => v.size === selectedSize);
      if (match && match.color) setSelectedColor(match.color);
    }

    if (!match && selectedColor) {
      match = parsedVariants.find((v: any) => v.color === selectedColor);
      if (match && match.size) setSelectedSize(match.size);
    }

    if (match) {
      setSelectedVariant(match);
    }
  }, [selectedSize, selectedColor, parsedVariants]);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.salePrice || product.regularPrice;

  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.stockQuantity;
  const isOutOfStock = Number(currentStock ?? 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        id: selectedVariant ? selectedVariant.id : product.id,
        productId: product.id,
        variantId: selectedVariant ? selectedVariant.id : null,
        title: product.title,
        variantTitle: selectedVariant ? selectedVariant.title : null,
        price: currentPrice,
        sku: currentSku,
        image: selectedImg,
      },
      qty
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  // Helper for YouTube/Vimeo embed URL
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = product.videoUrl ? getEmbedVideoUrl(product.videoUrl) : null;

  // Review statistics
  const reviewsList = product.reviews || [];
  const reviewCount = reviewsList.length;
  const avgRating =
    reviewCount > 0
      ? (reviewsList.reduce((s: number, r: any) => s + r.rating, 0) / reviewCount).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Media Gallery with Right Scroll View */}
      <div className="lg:col-span-7">
        <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
          {/* Main Active Media Viewport */}
          <div className="flex-1 w-full aspect-square bg-slate-900/5 rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative flex items-center justify-center">
            {activeMediaType === "video" && product.videoUrl ? (
              embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={product.videoTitle || product.title}
                  className="w-full h-full border-0 rounded-3xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-black rounded-3xl"
                />
              )
            ) : (
              <img
                src={selectedImg}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            )}

            {/* Video overlay badge if video is active */}
            {activeMediaType === "video" && product.videoTitle && (
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 shadow">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>{product.videoTitle}</span>
              </div>
            )}
          </div>

          {/* Right Scroll View (Vertical thumbnail gallery on md/lg, horizontal on mobile) */}
          <div className="w-full md:w-28 flex-shrink-0 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[580px] pr-1 pb-2 md:pb-0 scrollbar-thin">
            {/* 1. All Product Images */}
            {product.images?.map((img: any, idx: number) => {
              const isActive = activeMediaType === "image" && selectedImg === img.url;
              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedImg(img.url);
                    setActiveMediaType("image");
                  }}
                  className={`w-20 md:w-full aspect-square rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all relative group bg-white shadow-2xs ${
                    isActive
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md"
                      : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                  title={img.altText || `View photo ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.altText || ""}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {img.isPrimary && (
                    <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 rounded uppercase">
                      Primary
                    </span>
                  )}
                </button>
              );
            })}

            {/* 2. Product Demonstration Video Thumbnail (if present) */}
            {product.videoUrl && (
              <button
                type="button"
                onClick={() => setActiveMediaType("video")}
                className={`w-20 md:w-full aspect-square rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all relative group bg-slate-900 flex flex-col items-center justify-center text-white shadow-2xs ${
                  activeMediaType === "video"
                    ? "border-[var(--color-primary,#58111A)] ring-2 ring-[var(--color-primary,#58111A)]/20 shadow-md"
                    : "border-slate-800 hover:border-[#C5A880] opacity-90 hover:opacity-100"
                }`}
                title={product.videoTitle || "Play product video demonstration"}
              >
                {product.images?.[0]?.url && (
                  <img
                    src={product.images[0].url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="relative z-10 w-9 h-9 rounded-full bg-[var(--color-primary,#58111A)]/90 group-hover:bg-[var(--color-primary,#58111A)] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
                <span className="relative z-10 text-[9px] font-extrabold uppercase tracking-wider text-[#C5A880] mt-1">
                  Video
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Details Column */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          {product.category && (
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-[var(--color-accent,#C5A880)] block mb-1">
              {product.category.name}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-xs text-slate-400 font-mono">SKU: {currentSku}</span>
            {allowReviews && (
              <>
                <span className="text-slate-300">•</span>
                {/* Clickable Review Rating Anchor */}
                <a
                  href="#product-reviews"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[var(--color-primary,#58111A)] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(Number(avgRating))
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 group-hover:text-[var(--color-primary,#58111A)]">
                    {avgRating}
                  </span>
                  <span className="text-slate-500 underline decoration-slate-300 group-hover:decoration-[var(--color-primary,#58111A)]">
                    ({reviewCount} customer {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 pb-4 border-b border-slate-200">
          <span className="text-3xl font-extrabold text-slate-900">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          {product.salePrice && (
            <span className="text-sm text-slate-400 line-through">
              ₹{product.regularPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="text-xs text-emerald-600 font-bold ml-2">Inclusive of all taxes</span>
        </div>

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-xs text-slate-600 leading-relaxed">{product.shortDescription}</p>
        )}

        {/* Size Selector */}
        {availableSizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Size: <span className="font-extrabold text-[#222222]">{selectedSize || "Select a size"}</span>
              </span>
              <span className="text-[11px] text-stone-500 font-sans">Standard Boutique Fit</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => {
                const isSelected = selectedSize === sz;
                const matchingVariants = parsedVariants.filter((v: any) => v.size === sz);
                const totalStockForSize = matchingVariants.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) || 0), 0);
                const isSizeSoldOut = totalStockForSize <= 0;

                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[46px] px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-none border transition-all ${
                      isSelected
                        ? "bg-black text-white border-black shadow-xs ring-1 ring-black"
                        : isSizeSoldOut
                        ? "bg-stone-50 text-stone-400 border-stone-200 line-through opacity-70"
                        : "bg-white text-stone-800 border-stone-300 hover:border-black"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colour Selector */}
        {availableColors.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Select Colour: <span className="font-extrabold text-[#222222]">{selectedColor || "Select a colour"}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((col) => {
                const isSelected = selectedColor === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-none border text-xs font-sans font-semibold transition-all ${
                      isSelected
                        ? "border-black bg-stone-50 text-black shadow-xs ring-1 ring-black"
                        : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback Generic Variant Selector if no structured size/color */}
        {availableSizes.length === 0 && availableColors.length === 0 && product.variants?.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Choose Option / Variant:</label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v: any) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-slate-700 border-stone-300 hover:border-black"
                    }`}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock status */}
        <div className="text-xs pt-0.5">
          {!isOutOfStock ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                In Stock ({currentStock} available
                {selectedSize || selectedColor ? ` for ${[selectedSize, selectedColor].filter(Boolean).join(" / ")}` : ""} — ready for dispatch)
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-sans font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              Currently Out of Stock {selectedSize || selectedColor ? `in ${[selectedSize, selectedColor].filter(Boolean).join(" / ")}` : ""}
            </span>
          )}
        </div>

        {/* Quantity and Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <div className={`flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden ${isOutOfStock ? "opacity-40 pointer-events-none" : ""}`}>
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <span className="px-3 py-2 font-bold text-xs text-slate-900 min-w-[2rem] text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  : added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0A192F] hover:bg-[#1E293B] text-white cursor-pointer"
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-xl border transition-all ${
                isSaved
                  ? "bg-rose-50 border-rose-300 text-rose-600"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              }`}
              title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`w-full py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-md ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-[var(--color-primary,#58111A)] hover:opacity-90 text-white active:scale-98 cursor-pointer"
            }`}
          >
            {isOutOfStock ? "Product Currently Unavailable" : "Buy Now with 1-Click"}
          </button>
        </div>

        {/* Service assurances */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--color-primary,#58111A)]" />
            <span>Fast Express Courier</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#C5A880]" />
            <span>7-Day Return Policy</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Server Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#C5A880]" />
            <span>Instant Dispatch</span>
          </div>
        </div>

        {/* Detailed description */}
        <div className="pt-6 border-t border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
          <h4 className="font-bold text-slate-900 text-sm">Product Specifications</h4>
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      </div>
    </div>

    {/* Verified Customer Reviews Section */}
    {allowReviews && (
      <div className="border-t border-slate-200/90 pt-4">
        <ProductReviews
          productId={product.id}
          productTitle={product.title}
          initialReviews={reviewsList}
        />
      </div>
    )}

    {/* Mobile Sticky Quick-Purchase Bar */}
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between gap-3 z-40 sm:hidden shadow-2xl">
      <div className="min-w-0">
        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Price</span>
        <span className="text-base font-black text-slate-900 block leading-tight truncate">
          ₹{currentPrice.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-1 max-w-[220px]">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 py-2.5 px-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            added ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
          }`}
        >
          {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          <span>{added ? "Added" : "Cart"}</span>
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="flex-1 py-2.5 px-2.5 rounded-xl bg-[var(--color-primary,#58111A)] hover:opacity-90 text-white font-serif font-bold text-[11px] uppercase tracking-wider shadow-sm active:scale-95"
        >
          Buy Now
        </button>
      </div>
    </div>
  </div>
  );
}
