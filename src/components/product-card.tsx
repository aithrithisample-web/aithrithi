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
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80";
  const secondaryImg = product.images?.[1]?.url;

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
    <div className="group rounded-none bg-white border border-[#EDEDED] hover:border-[#DEB660]/70 transition-all duration-300 flex flex-col justify-between relative shadow-2xs hover:shadow-md">
      {/* Product Image — Vedhika Tall 2:3 Portrait Aspect Ratio */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[2/3] bg-[#F7F7F7] overflow-hidden">
        <img
          src={primaryImg}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isOutOfStock
              ? "opacity-75 grayscale-[20%]"
              : secondaryImg
              ? "group-hover:opacity-0"
              : "group-hover:scale-105"
          }`}
        />

        {/* Secondary Angle Image (Shopify Kalles / Vedhika Crossfade on Hover) */}
        {secondaryImg && !isOutOfStock && (
          <img
            src={secondaryImg}
            alt={`${product.title} alternate angle`}
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          />
        )}

        {/* Gradient shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Badges — Sharp Rectangular (Vedhika Kalles Style) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-none text-[9px] font-sans font-bold tracking-[0.14em] uppercase bg-[#D9383A] text-white shadow-xs">
              SOLD OUT
            </span>
          ) : (
            <>
              {product.isComboDeal && (
                <span className="px-2 py-0.5 rounded-none text-[9px] font-sans font-semibold tracking-[0.12em] uppercase bg-[#222222] text-white shadow-xs flex items-center gap-1">
                  <PackagePlus className="w-3 h-3" />
                  COMBO
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded-none text-[9px] font-sans font-bold tracking-[0.12em] uppercase bg-[#DEB660] text-black shadow-xs">
                  {discountPct}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Action buttons — Wishlist & Quick View */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="p-2 rounded-none bg-white/95 backdrop-blur-sm shadow-xs transition-all duration-200
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-95 sm:group-hover:scale-100
                       hover:bg-white text-slate-700 hover:text-[#DEB660] active:scale-90"
            title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isSaved ? "fill-rose-600 text-rose-600" : "text-slate-600 hover:text-[#DEB660]"}`} />
          </button>

          <Link
            href={`/product/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-none bg-white/95 backdrop-blur-sm shadow-xs text-slate-600 hover:text-[#DEB660]
                       opacity-0 sm:group-hover:opacity-100 scale-95 sm:group-hover:scale-100 transition-all duration-200 delay-75"
            title="View product"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Low stock badge */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-none text-[9px] font-sans font-bold tracking-[0.12em] uppercase bg-[#DEB660] text-black shadow-xs">
            ONLY {product.stockQuantity} LEFT
          </span>
        )}

        {/* Quick add overlay — slides up from bottom on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 p-2.5">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full py-2 rounded-none text-[11px] font-sans font-bold uppercase tracking-[0.14em] transition-all bg-[#D9383A]/90 text-white cursor-not-allowed"
            >
              <span>Sold Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`w-full py-2.5 rounded-none text-[11px] font-sans font-bold uppercase tracking-[0.14em] transition-all shadow-md active:scale-98 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#222222] hover:bg-[#DEB660] text-white hover:text-black transition-colors"
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
      <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-[#999999] block mb-1">
              {product.category.name}
            </span>
          )}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-sans font-medium text-xs sm:text-[13px] uppercase tracking-[0.03em] text-[#222222] hover:text-[#DEB660] transition-colors line-clamp-2 leading-snug">
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

        <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-[#222222] font-sans tracking-tight">
              Rs. {effectivePrice.toLocaleString("en-IN")}.00
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through ml-2 font-sans">
                Rs. {product.regularPrice.toLocaleString("en-IN")}.00
              </span>
            )}
          </div>

          {/* 1-Tap Add to Cart button */}
          {isOutOfStock ? (
            <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-[#D9383A]">Sold Out</span>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex p-2 rounded-none transition-all items-center justify-center cursor-pointer ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 hover:bg-[#DEB660] text-slate-800 hover:text-white"
              }`}
              title="Quick add to cart"
              aria-label="Add to cart"
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
