"use client";

import Link from "next/link";
import { ShoppingBag, Check, Heart, PackagePlus, Star, Eye } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useState } from "react";

export function ProductCard({
  product,
  showReviews = true,
}: {
  product: any;
  showReviews?: boolean;
}) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  const primaryImg =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";

  const effectivePrice = product.salePrice || product.regularPrice;
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const discountPct = hasDiscount
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: effectivePrice,
      sku: product.sku,
      image: primaryImg,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="avro-3d-card group rounded-2xl bg-white border border-[#EFE7E4] hover:border-[#C5A880]/60 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative">
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-[#FAF7F5] overflow-hidden">
        <img
          src={primaryImg}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? "opacity-75 grayscale-[20%]" : "group-hover:scale-105"
          }`}
        />

        {/* Gradient shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-serif font-bold tracking-[0.14em] uppercase bg-stone-900/95 text-stone-100 border border-stone-600 shadow-md">
              OUT OF STOCK
            </span>
          ) : (
            <>
              {product.isComboDeal && (
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-serif font-medium tracking-[0.14em] uppercase bg-[#58111A] text-[#FAF7F5] border border-[#C5A880]/30 shadow-sm flex items-center gap-1">
                  <PackagePlus className="w-3 h-3" />
                  COMBO
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-serif font-medium tracking-[0.14em] uppercase bg-[#58111A] text-[#FAF7F5] border border-[#C5A880]/30 shadow-sm">
                  {discountPct}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Action buttons — always accessible on mobile, appear on hover on desktop */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="p-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-200
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-90 sm:group-hover:scale-100
                       hover:bg-white active:scale-95"
            title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? "fill-[#58111A] text-[#58111A]" : "text-slate-400 hover:text-[#58111A]"}`} />
          </button>

          {/* Quick view */}
          <Link
            href={`/product/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-sm text-slate-400 hover:text-[#58111A]
                       opacity-0 sm:group-hover:opacity-100 scale-90 sm:group-hover:scale-100 transition-all duration-200 delay-75"
            title="View product"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Low stock badge */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-serif font-medium tracking-[0.14em] uppercase bg-[#C5A880] text-slate-900 shadow-sm">
            ONLY {product.stockQuantity} LEFT
          </span>
        )}

        {/* Quick add overlay — slides up from bottom on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 p-3">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 rounded-xl text-xs font-serif font-medium uppercase tracking-[0.14em] transition-all shadow-md bg-stone-900/90 text-stone-300 border border-stone-700/60 cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-1.5">
                Out of Stock
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`w-full py-2.5 rounded-xl text-xs font-serif font-medium uppercase tracking-[0.14em] transition-all shadow-lg active:scale-98 ${
                added
                  ? "bg-[#58111A] text-white"
                  : "bg-[#58111A] text-white hover:bg-[#36080F] backdrop-blur-sm"
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Added to Cart
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                </span>
              )}
            </button>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-serif font-medium uppercase tracking-[0.18em] text-[#C5A880] block mb-1">
              {product.category.name}
            </span>
          )}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif font-medium text-sm sm:text-base text-slate-900 group-hover:text-[#58111A] transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Stars & Rating Summary */}
          {showReviews && (() => {
            const reviewsCount = product.reviews?.length || 0;
            const computedRating =
              reviewsCount > 0
                ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviewsCount
                : product.rating || 5.0;
            return (
              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(computedRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
                <span className="text-[10px] text-slate-500 font-semibold ml-1">
                  {Number(computedRating).toFixed(1)}
                  {reviewsCount > 0 && (
                    <span className="text-slate-400 font-normal"> ({reviewsCount})</span>
                  )}
                </span>
              </div>
            );
          })()}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-sm sm:text-base font-semibold text-slate-900 font-sans tracking-tight">
              ₹{effectivePrice.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through ml-2">
                ₹{product.regularPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* 1-Tap Add to Cart button (active on both mobile & desktop) */}
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="flex px-3 py-2 sm:p-2 rounded-xl transition-all shadow-2xs items-center justify-center bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
              title="Currently out of stock"
              aria-label="Out of stock"
            >
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-stone-500">Sold Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex p-2.5 sm:p-2 rounded-xl transition-all shadow-sm active:scale-95 items-center justify-center cursor-pointer ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 hover:bg-[#58111A] text-slate-800 hover:text-white"
              }`}
              title="Quick add to cart"
              aria-label="Add to cart"
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
