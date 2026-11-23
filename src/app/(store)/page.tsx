export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  ArrowRight,
  ShoppingBag,
  Check,
  Shield,
  Truck,
  RotateCcw,
  Award,
  Heart,
  Star,
  TrendingUp,
  Sparkles,
  Lock,
  Instagram,
  ExternalLink,
  Play,
} from "lucide-react";
import { AVRO_THEMES, AvroThemeDefinition, resolveStoreTheme } from "@/lib/themes-registry";
import { ProductCard } from "@/components/product-card";
import { HeroBannerSlider, HeroBannerSlide } from "@/components/hero-banner-slider";
import { getCachedStoreTheme } from "@/lib/theme-cache";
import { getStorePermissions } from "@/lib/permissions";

function renderTrustIcon(icon: string) {
  switch (icon) {
    case "truck":
      return <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "shield":
      return <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "award":
      return <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "refresh":
      return <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "heart":
      return <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "sparkles":
      return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "lock":
      return <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
    case "check":
    default:
      return <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />;
  }
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoreHomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const themeParam = (
    typeof resolvedParams.theme === "string"
      ? resolvedParams.theme
      : typeof resolvedParams.previewTheme === "string"
      ? resolvedParams.previewTheme
      : undefined
  );

  let dbTheme: any = null;
  try {
    dbTheme = await getCachedStoreTheme();
  } catch (e) {
    // Database unseeded or unreachable
  }

  // Find theme definition matching query param OR db setting (supports both presets and custom merchant themes)
  const activeCode = themeParam || dbTheme?.activeTheme || "AVRO_SIGNATURE";
  const themeDef: AvroThemeDefinition = resolveStoreTheme(activeCode, dbTheme);

  // Check if DB customizer has overrides
  let customOverrides: any = {};
  try {
    if (dbTheme?.socialLinksJson) {
      customOverrides = JSON.parse(dbTheme.socialLinksJson);
    }
  } catch (e) {}

  const heroSlides: HeroBannerSlide[] = Array.isArray(customOverrides.heroSlides) ? customOverrides.heroSlides : [];

  const primaryColor = !themeParam && dbTheme?.primaryColor ? dbTheme.primaryColor : themeDef.palette.primary;
  const accentColor = !themeParam && dbTheme?.accentColor ? dbTheme.accentColor : themeDef.palette.accent;
  const backgroundColor = !themeParam && customOverrides.backgroundColor ? customOverrides.backgroundColor : themeDef.palette.background;
  const cardBgColor = !themeParam && customOverrides.cardBg ? customOverrides.cardBg : themeDef.palette.cardBg;
  const textColor = !themeParam && customOverrides.textColor ? customOverrides.textColor : themeDef.palette.text;
  const textMutedColor = !themeParam && customOverrides.textMuted ? customOverrides.textMuted : themeDef.palette.textMuted;
  const buttonRadius = !themeParam && customOverrides.buttonRadius ? customOverrides.buttonRadius : themeDef.typography.buttonRadius;
  const badgeRadius = !themeParam && customOverrides.badgeRadius ? customOverrides.badgeRadius : themeDef.typography.badgeRadius;
  const heroBadge = !themeParam && (dbTheme?.heroBadge || customOverrides.heroBadge) ? (dbTheme?.heroBadge || customOverrides.heroBadge) : themeDef.hero.badge;
  const headlineHighlight = !themeParam && customOverrides.headlineHighlight !== undefined ? customOverrides.headlineHighlight : themeDef.hero.headlineHighlight;
  const ctaPrimary = !themeParam && (dbTheme?.heroCtaText || customOverrides.ctaPrimary) ? (dbTheme?.heroCtaText || customOverrides.ctaPrimary) : themeDef.hero.ctaPrimary;
  const ctaPrimaryLink = !themeParam && dbTheme?.heroCtaLink ? dbTheme.heroCtaLink : "/shop";
  const ctaSecondary = !themeParam && customOverrides.ctaSecondary ? customOverrides.ctaSecondary : themeDef.hero.ctaSecondary;
  const showTrustBadges = !themeParam && customOverrides.showTrustBadges !== undefined ? customOverrides.showTrustBadges : true;
  const trustBadges = !themeParam && Array.isArray(customOverrides.trustBadges) ? customOverrides.trustBadges : themeDef.trustBadges;

  // Instagram Integration Settings (Admin Synced)
  const showInstagram = !themeParam && customOverrides.showInstagramSection !== undefined ? customOverrides.showInstagramSection : true;
  const instagramUrl = !themeParam && customOverrides.instagramUrl ? customOverrides.instagramUrl : "https://instagram.com/aithrithi.in";
  const instagramHandle = !themeParam && customOverrides.instagramHandle ? customOverrides.instagramHandle : "@aithrithi.in";
  const instagramButtonText = !themeParam && customOverrides.instagramButtonText ? customOverrides.instagramButtonText : `Follow ${instagramHandle} on Instagram`;
  const instagramTitle = !themeParam && customOverrides.instagramTitle ? customOverrides.instagramTitle : "Atelier on Instagram";
  const instagramSubtitle = !themeParam && customOverrides.instagramSubtitle ? customOverrides.instagramSubtitle : "Tag #AithrithiDevika to be featured in our royal couture gallery";
  const instagramPosts =
    !themeParam && Array.isArray(customOverrides.instagramPosts) && customOverrides.instagramPosts.length > 0
      ? customOverrides.instagramPosts
      : [
          {
            id: "ig-1",
            imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            caption: "Crimson Zari Kanjivaram Silk Saree · Devika's signature handloom edition draped with royal elegance.",
            likes: "4.8k",
            postUrl: instagramUrl,
            isVideo: false,
          },
          {
            id: "ig-2",
            imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
            caption: "Pure Tussar Silk Saree in Raw Honey Gold · Handwoven with generational heritage craftsmanship.",
            likes: "3.2k",
            postUrl: instagramUrl,
            isVideo: true,
          },
          {
            id: "ig-3",
            imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
            caption: "Festive Embroidered Kurti Set with Banarasi Dupatta · Styled for grand celebrations.",
            likes: "2.9k",
            postUrl: instagramUrl,
            isVideo: false,
          },
          {
            id: "ig-4",
            imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
            caption: "Regal Emerald Green Chanderi Silk · Delicate zari motifs finished by hand.",
            likes: "5.1k",
            postUrl: instagramUrl,
            isVideo: true,
          },
        ];

  const headline = dbTheme?.bannerHeadline && !themeParam ? dbTheme.bannerHeadline : themeDef.hero.headline;
  const subheadline = dbTheme?.bannerSubheadline && !themeParam ? dbTheme.bannerSubheadline : themeDef.hero.subheadline;
  const heroImage = dbTheme?.bannerImageUrl && !themeParam ? dbTheme.bannerImageUrl : themeDef.hero.imageUrl;

  const permissions = await getStorePermissions();
  const allowReviews = permissions.check("productReviews").allowed;

  let dbCategories: any[] = [];
  try {
    dbCategories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    // Database unseeded or unreachable
  }

  let dbFeaturedProducts: any[] = [];
  try {
    dbFeaturedProducts = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        featured: true,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
        reviews: allowReviews
          ? {
              where: { isApproved: true },
              select: { rating: true },
            }
          : false,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // Database unseeded or unreachable
  }

  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
        reviews: allowReviews
          ? {
              where: { isApproved: true },
              select: { rating: true },
            }
          : false,
      },
      take: 12,
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // Database unseeded or unreachable
  }

  // Curated Featured Products: Prioritize marked featured products, else recent products
  const featuredProductsToDisplay =
    dbFeaturedProducts.length > 0
      ? dbFeaturedProducts
      : dbProducts.slice(0, 4);

  // Live Catalog products: Remaining products not already shown in Featured showcase
  const catalogProducts =
    dbFeaturedProducts.length > 0
      ? dbProducts.filter((p) => !dbFeaturedProducts.some((fp) => fp.id === p.id))
      : dbProducts.slice(4);

  // Categories for showcase: Live DB categories from Admin Panel or theme defaults
  const categoriesToDisplay =
    dbCategories.length > 0
      ? dbCategories.map((c) => ({
          slug: c.slug,
          name: c.name,
          imageUrl:
            c.image ||
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
          itemCount: `${c._count?.products || 0} Products`,
        }))
      : themeDef.sampleCategories;

  // Hero Quick Chips: Live DB categories if available, else curated keywords
  const heroQuickChips =
    dbCategories.length > 0
      ? dbCategories.slice(0, 6).map((c) => ({
          label: c.name,
          href: `/shop?category=${encodeURIComponent(c.slug)}`,
        }))
      : [
          { label: "Handloom Sarees", href: "/shop?q=Saree" },
          { label: "Designer Kurtis", href: "/shop?q=Kurti" },
          { label: "Pure Tussar Silks", href: "/shop?q=Silk" },
          { label: "Festive Royale", href: "/shop?q=Festive" },
          { label: "New Arrivals", href: "/shop?q=New" },
        ];

  const isDarkHero =
    themeDef.hero.style === "tech-contrast" ||
    themeDef.hero.style === "luxury-dark" ||
    themeDef.hero.style === "industrial-bold";

  const btnBorderRadius =
    buttonRadius === "rounded-full" ? "9999px"
    : buttonRadius === "rounded-none" ? "0px"
    : buttonRadius === "rounded-2xl" ? "16px"
    : "12px";

  const badgeBorderRadius =
    badgeRadius === "rounded-full" ? "9999px"
    : badgeRadius === "rounded-none" ? "0px"
    : "8px";

  const cardBorderRadius =
    themeDef.typography.buttonRadius === "rounded-none" ? "0px"
    : "16px";

  return (
    <div
      className="pb-24 transition-colors duration-300"
      style={{ backgroundColor: backgroundColor, color: textColor }}
    >
      {/* =====================================================
          1. HERO SECTION — Cinematic Full Banner for Aithrithi / Split for others
          ===================================================== */}
      {themeDef.code === "AITHRITHI_MAROON" ? (
        <section
          className="relative overflow-hidden pt-3 sm:pt-4 pb-5 sm:pb-7 border-b border-black/5 transition-colors duration-300"
          style={{ backgroundColor: backgroundColor }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
            {/* Full-width Cinematic Hero Banner with 3D Depth Frame */}
            <div className="relative group overflow-hidden rounded-xl sm:rounded-3xl shadow-[0_20px_50px_-12px_rgba(88,17,26,0.22)] border border-[#C5A880]/30 ring-1 ring-[#C5A880]/20 bg-[#58111A] avro-3d-hero-frame">
              <HeroBannerSlider
                slides={heroSlides}
                fallbackImage={heroImage || "/aithrithi-hero.jpg"}
                fallbackTitle={themeDef.name}
                fallbackTagline={themeDef.tagline}
                themeDef={themeDef}
                isDarkHero={isDarkHero}
                primaryColor={primaryColor}
                accentColor={accentColor}
                buttonRadius={buttonRadius}
              />
            </div>

            {/* Quick Category Chips — Refined Editorial 3D Strip (Live Synced with Admin Categories) */}
            <div className="mt-3.5 sm:mt-6 flex items-center sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-0.5 touch-pan-x">
              {heroQuickChips.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs font-serif font-medium tracking-[0.14em] uppercase border shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex-shrink-0 whitespace-nowrap active:scale-95 hover:border-[#58111A] hover:bg-[#58111A] hover:text-white"
                  style={{
                    borderColor: "rgba(88, 17, 26, 0.15)",
                    backgroundColor: cardBgColor,
                    color: textColor,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section
          className={`relative overflow-hidden border-b transition-colors duration-300 ${
            isDarkHero
              ? "py-20 sm:py-28 text-white border-white/10"
              : "py-16 sm:py-24 text-slate-900 border-black/5"
          }`}
          style={{ backgroundColor: isDarkHero ? cardBgColor : backgroundColor }}
        >
          {/* Decorative background orbs */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <div
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 avro-float-slow"
              style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
            />
            <div
              className="absolute -bottom-24 right-0 w-72 h-72 rounded-full blur-3xl opacity-15 avro-float"
              style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`, animationDelay: "2s" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 items-center lg:grid-cols-12 gap-12">
              {/* Left — Hero content */}
              <div className="space-y-6 lg:col-span-7">
                {/* Badge */}
                <div
                  className="avro-slide-up inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{
                    backgroundColor: themeDef.palette.badgeBg,
                    color: themeDef.palette.badgeText,
                    borderRadius: badgeBorderRadius,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
                  {heroBadge}
                </div>

                {/* Headline */}
                <h1
                  className={`avro-slide-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${themeDef.typography.headingClass}`}
                  style={{ color: isDarkHero ? "#FFFFFF" : textColor }}
                >
                  {headline}{" "}
                  {headlineHighlight && (
                    <span
                      className="italic font-serif"
                      style={{ color: accentColor }}
                    >
                      {headlineHighlight}
                    </span>
                  )}
                </h1>

                {/* Subheadline */}
                <p
                  className="avro-slide-up-delay-2 text-base sm:text-lg max-w-xl leading-relaxed"
                  style={{ color: isDarkHero ? "#CBD5E1" : textMutedColor }}
                >
                  {subheadline}
                </p>

                {/* CTA Buttons */}
                <div className="avro-slide-up-delay-3 flex flex-wrap gap-4 pt-2">
                  <Link
                    href={ctaPrimaryLink}
                    className="avro-btn px-6 py-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-white"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: btnBorderRadius,
                    }}
                  >
                    {ctaPrimary}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="#categories"
                    className="avro-btn px-6 py-3.5 font-bold text-xs uppercase tracking-wider border transition-all"
                    style={{
                      borderColor: isDarkHero ? "rgba(255,255,255,0.2)" : themeDef.palette.border,
                      backgroundColor: isDarkHero ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                      color: isDarkHero ? "#FFFFFF" : textColor,
                      borderRadius: btnBorderRadius,
                    }}
                  >
                    {ctaSecondary}
                  </Link>
                </div>

                {/* Trust micro-strip */}
                <div className="avro-slide-up-delay-4 flex flex-wrap gap-4 pt-1">
                  {[
                    { icon: <Shield className="w-3.5 h-3.5" />, text: "Secure Checkout" },
                    { icon: <Truck className="w-3.5 h-3.5" />, text: "Fast Delivery" },
                    { icon: <RotateCcw className="w-3.5 h-3.5" />, text: "Easy Returns" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-1.5 text-[11px] font-semibold opacity-70"
                      style={{ color: isDarkHero ? "#94A3B8" : textMutedColor }}
                    >
                      <span style={{ color: accentColor }}>{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Hero banner slider / carousel (supports images & video ads with right scroll) */}
              <div className="avro-slide-right lg:col-span-5">
                <HeroBannerSlider
                  slides={heroSlides}
                  fallbackImage={heroImage}
                  fallbackTitle={themeDef.name}
                  fallbackTagline={themeDef.tagline}
                  themeDef={themeDef}
                  isDarkHero={isDarkHero}
                  primaryColor={primaryColor}
                  accentColor={accentColor}
                  buttonRadius={buttonRadius}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          2. BRAND HERITAGE & PROMISE STRIP — Ultra-Minimal & Refined
          ===================================================== */}
      {showTrustBadges && trustBadges.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
          <div
            className={`border-y py-3 sm:py-4.5 grid grid-cols-2 ${
              trustBadges.length === 1
                ? "grid-cols-1"
                : trustBadges.length === 2
                ? "grid-cols-2 lg:grid-cols-2"
                : trustBadges.length === 3
                ? "grid-cols-2 lg:grid-cols-3"
                : "grid-cols-2 lg:grid-cols-4"
            } gap-3.5 sm:gap-6`}
            style={{ borderColor: "rgba(88, 17, 26, 0.12)" }}
          >
            {trustBadges.map((badge: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3 group min-w-0"
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: "rgba(88, 17, 26, 0.05)",
                    color: primaryColor,
                  }}
                >
                  {renderTrustIcon(badge.icon)}
                </div>
                <div className="min-w-0 flex-1">
                  <strong
                    className="block text-[11px] sm:text-xs font-serif font-bold tracking-wider uppercase truncate"
                    style={{ color: textColor }}
                  >
                    {badge.title}
                  </strong>
                  <span
                    className="text-[10px] sm:text-[10.5px] line-clamp-1 block leading-tight text-stone-500 font-sans mt-0.5"
                  >
                    {badge.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          3. CATEGORY SHOWCASE — hover lift + zoom
          ===================================================== */}
      <section id="categories" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 mt-10 sm:mt-16">
        <div className="avro-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
          <div>
            <span
              className="text-[10px] sm:text-[11px] font-serif font-medium tracking-[0.18em] uppercase block mb-1"
              style={{ color: themeDef.palette.accent }}
            >
              Curated Collections
            </span>
            <h2
              className={`text-2xl sm:text-3xl font-serif font-medium tracking-tight ${themeDef.typography.headingClass}`}
              style={{ color: themeDef.palette.text }}
            >
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="avro-link-underline text-xs font-serif font-medium tracking-[0.12em] uppercase flex items-center gap-1 self-start sm:self-auto"
            style={{ color: themeDef.palette.accent }}
          >
            Browse All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 avro-stagger-grid">
          {categoriesToDisplay.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              className="avro-3d-card avro-slide-up group overflow-hidden border shadow-xs relative flex flex-col justify-end aspect-square"
              style={{
                borderColor: themeDef.palette.border,
                borderRadius: cardBorderRadius,
              }}
            >
              <img
                src={category.imageUrl}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

              <div className="relative z-10 p-3 sm:p-5 text-white">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                  {category.itemCount}
                </span>
                <h3 className="font-serif font-medium text-sm sm:text-base tracking-wide leading-snug group-hover:text-white transition-colors truncate">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          4. FEATURED PRODUCTS — theme curated or database
          ===================================================== */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 mt-10 sm:mt-16">
        <div className="avro-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
          <div>
            <span
              className="text-[10px] sm:text-[11px] font-serif font-medium tracking-[0.18em] uppercase block mb-1"
              style={{ color: themeDef.palette.accent }}
            >
              Signature Collection · Handcrafted
            </span>
            <h2
              className={`text-2xl sm:text-3xl font-serif font-medium tracking-tight ${themeDef.typography.headingClass}`}
              style={{ color: themeDef.palette.text }}
            >
              Curated Bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="avro-link-underline text-xs font-serif font-medium tracking-[0.12em] uppercase flex items-center gap-1"
            style={{ color: themeDef.palette.accent }}
          >
            View Complete Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid — 2 columns on mobile, 4 on desktop (Live Synced with Admin Featured status) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 avro-stagger-grid">
          {featuredProductsToDisplay.length > 0 ? (
            featuredProductsToDisplay.map((p: any) => (
              <ProductCard key={p.id} product={p} showReviews={allowReviews} />
            ))
          ) : (
            themeDef.sampleProducts.map((p) => {
              const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price;
              const discountPct = hasDiscount
                ? Math.round(((p.compareAtPrice! - p.price) / p.compareAtPrice!) * 100)
                : 0;
              return (
                <div
                  key={p.slug}
                  className="avro-3d-card avro-slide-up group overflow-hidden shadow-xs flex flex-col border"
                  style={{
                    backgroundColor: themeDef.palette.cardBg,
                    borderColor: themeDef.palette.border,
                    borderRadius: cardBorderRadius,
                  }}
                >
                  {/* Product image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {p.badge && (
                        <span
                          className="px-2 py-0.5 text-[9.5px] font-serif font-medium tracking-[0.14em] uppercase text-white shadow-sm"
                          style={{
                            backgroundColor: themeDef.palette.primary,
                            borderRadius: themeDef.typography.badgeRadius === "rounded-none" ? "0px" : "6px",
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="px-2 py-0.5 text-[9.5px] font-serif font-medium tracking-[0.14em] uppercase bg-[#58111A] text-white shadow-sm"
                          style={{ borderRadius: "6px" }}>
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    {/* Wishlist placeholder */}
                    <button
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 duration-200"
                      title="Save to wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[9.5px] sm:text-[10px] font-serif font-medium tracking-[0.16em] uppercase block mb-0.5 sm:mb-1"
                        style={{ color: themeDef.palette.textMuted }}
                      >
                        {p.category}
                      </span>
                      <h3
                        className="font-serif font-medium text-xs sm:text-sm line-clamp-2 leading-snug"
                        style={{ color: themeDef.palette.text }}
                      >
                        {p.title}
                      </h3>

                      {/* Star rating */}
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 ${i < Math.floor(p.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                          />
                        ))}
                        <span className="text-[10px] ml-0.5 font-sans" style={{ color: textMutedColor }}>{p.rating}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <span
                          className="text-xs sm:text-sm font-semibold font-sans tracking-tight"
                          style={{ color: themeDef.palette.text }}
                        >
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] sm:text-[11px] text-slate-400 line-through ml-1.5 font-sans">
                            ₹{p.compareAtPrice?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/shop"
                        className="avro-btn p-1.5 sm:p-2 rounded-xl transition-all flex items-center justify-center text-white"
                        style={{
                          backgroundColor: themeDef.palette.primary,
                          borderRadius: themeDef.typography.buttonRadius === "rounded-none" ? "0px" : "10px",
                        }}
                        title="View product"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* =====================================================
          5. DATABASE PRODUCTS (Live Catalog / Discover Collections)
          ===================================================== */}
      {catalogProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-black/5">
          <div className="avro-slide-up flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-stone-500 flex items-center gap-1.5 font-sans">
                <TrendingUp className="w-3.5 h-3.5" /> Live Catalog
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-medium text-slate-900">
                Latest Collections & New Arrivals
              </h2>
            </div>
            <Link href="/shop" className="avro-link-underline text-xs font-serif font-medium tracking-[0.12em] uppercase flex items-center gap-1" style={{ color: primaryColor }}>
              View All ({dbProducts.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 avro-stagger-grid">
            {catalogProducts.map((p) => (
              <ProductCard key={p.id} product={p} showReviews={allowReviews} />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          6. INSTAGRAM SHOWCASE & CURATED LOOKS (Synced with Admin Panel)
          ===================================================== */}
      {showInstagram && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-18 pt-8 sm:pt-10 border-t border-black/5">
          <div className="avro-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-serif font-medium tracking-[0.18em] uppercase mb-1" style={{ color: accentColor }}>
                <Instagram className="w-3.5 h-3.5" />
                <span>{instagramSubtitle}</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-serif font-medium tracking-tight ${themeDef.typography.headingClass}`} style={{ color: textColor }}>
                {instagramTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-serif font-medium tracking-[0.12em] uppercase text-xs shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{instagramButtonText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <Link
                href="/instagram"
                className="px-4 py-2 rounded-full border border-stone-300 hover:border-[#58111A] text-stone-800 hover:text-[#58111A] font-serif font-medium tracking-[0.12em] uppercase text-xs transition-all hover:bg-stone-50"
              >
                View Lookbook
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 avro-stagger-grid">
            {instagramPosts.slice(0, 4).map((post: any, idx: number) => (
              <a
                key={post.id || idx}
                href={post.postUrl || instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-black/5 shadow-xs hover:shadow-xl transition-all duration-500 block bg-stone-100"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Aithrithi Instagram"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 text-white">
                  <div className="flex justify-between items-center">
                    <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
                      <Instagram className="w-3.5 h-3.5" />
                    </span>
                    {post.isVideo && (
                      <span className="p-1 rounded-full bg-black/40 backdrop-blur-md">
                        <Play className="w-3 h-3 fill-white" />
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] leading-snug line-clamp-2 font-sans mb-2 text-stone-200">
                      {post.caption}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-serif">
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                        {post.likes || "2.4k"}
                      </span>
                      <span className="text-[#C5A880] flex items-center gap-0.5">
                        View on Instagram <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          7. CALLOUT BANNER — full-width CTA strip
          ===================================================== */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-16">
        <div
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
          style={{ backgroundColor: themeDef.palette.footerBg }}
        >
          <div className="max-w-xl space-y-3 relative z-10">
            <span
              className="text-[11px] font-serif font-medium tracking-[0.16em] uppercase px-3.5 py-1 rounded-full bg-white/10 inline-block font-sans"
              style={{ color: accentColor }}
            >
              {themeDef.code === "AITHRITHI_MAROON" ? "Devika's Atelier · Handcrafted Elegance" : "Curated Collections · Fast Dispatch"}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-serif font-medium tracking-tight ${themeDef.typography.headingClass}`}>
              {themeDef.code === "AITHRITHI_MAROON" ? "Woven with Devotion, Styled for Royalty" : "Engineered for Quality & Reliability"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-normal">
              {themeDef.code === "AITHRITHI_MAROON"
                ? "Experience the timeless allure of authentic artisanal sarees and handcrafted designer kurtis delivered directly to your doorstep with luxury concierge unboxing."
                : (allowReviews
                    ? "Discover our carefully curated catalog with verified customer reviews, transparent pricing, and rapid doorstep delivery across India."
                    : "Discover our carefully curated catalog with premium quality, transparent pricing, and rapid doorstep delivery across India.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 flex-shrink-0">
            <Link
              href="/shop"
              className="avro-btn px-6 py-3 rounded-xl bg-white text-slate-900 font-serif font-medium tracking-[0.14em] uppercase text-xs hover:bg-[#FAF7F5] transition-colors shadow-sm text-center"
              style={{
                borderRadius: btnBorderRadius,
              }}
            >
              {themeDef.code === "AITHRITHI_MAROON" ? "Explore Sarees & Kurtis" : "Browse All Products"}
            </Link>
            <Link
              href="/track"
              className="avro-btn px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif font-medium tracking-[0.14em] uppercase text-xs border border-white/20 transition-colors text-center"
              style={{
                borderRadius: btnBorderRadius,
              }}
            >
              Track My Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
