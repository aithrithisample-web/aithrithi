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
  const activeCode = themeParam || dbTheme?.activeTheme || "VEDHIKA_BOUTIQUE";
  const themeDef: AvroThemeDefinition = resolveStoreTheme(activeCode, dbTheme);

  // Check if DB customizer has overrides
  let customOverrides: any = {};
  try {
    if (dbTheme?.socialLinksJson) {
      customOverrides = JSON.parse(dbTheme.socialLinksJson);
    }
  } catch (e) {}

  const heroSlides: HeroBannerSlide[] = Array.isArray(customOverrides.heroSlides) ? customOverrides.heroSlides : [];

  // Active Ad Banners from Admin Panel (eynretail-style dynamic ads)
  let activeAds: any[] = [];
  try {
    const adsSetting = await prisma.storeSetting.findUnique({
      where: { key: "ads_banners_json" },
    });
    if (adsSetting?.value) {
      const parsedAds = JSON.parse(adsSetting.value);
      if (Array.isArray(parsedAds)) {
        activeAds = parsedAds.filter((ad: any) => ad.isActive !== false);
      }
    }
  } catch (e) {}

  // Filter hero-specific ads and mid-page promotional ads
  const heroAds = activeAds.filter((ad: any) => ad.position === "HERO_BANNER" || !ad.position);
  const promoAds = activeAds.filter((ad: any) => ad.position === "PROMO_MIDDLE" || ad.position === "FOOTER_SPOTLIGHT");

  // Map active ads to HeroBannerSlide format
  const mappedAdSlides: HeroBannerSlide[] = (heroAds.length > 0 ? heroAds : activeAds).map((ad: any) => ({
    id: ad.id,
    mediaType: "image",
    mediaUrl: ad.imageUrl,
    badge: ad.position === "HERO_BANNER" ? "SPECIAL CAMPAIGN" : "PROMOTIONAL",
    title: ad.title,
    subtitle: ad.description,
    ctaText: "Shop Collection",
    ctaLink: ad.link || "/shop",
  }));

  // Dynamic slides prioritize active admin ads, falling back to theme overrides
  const effectiveHeroSlides: HeroBannerSlide[] =
    mappedAdSlides.length > 0
      ? mappedAdSlides
      : heroSlides.length > 0
      ? heroSlides
      : [];

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
          1. HERO SECTION — Full Widescreen Boutique Slider (Vedhika Style)
          ===================================================== */}
      <section
        className="relative w-full overflow-hidden border-b border-black/5 transition-colors duration-300"
        style={{ backgroundColor: backgroundColor }}
      >
        {/* Full-bleed Background Hero Slider without bulky frames or borders */}
        <HeroBannerSlider
          slides={effectiveHeroSlides}
          fallbackImage={activeAds[0]?.imageUrl || heroImage || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85"}
          fallbackTitle={themeDef.name}
          fallbackTagline={themeDef.tagline}
          themeDef={themeDef}
          isDarkHero={isDarkHero}
          primaryColor={primaryColor}
          accentColor={accentColor}
          buttonRadius={buttonRadius}
        />

        {/* Quick Category Chips — Fluid Mobile-Friendly Strip */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-t border-[#F0F0F0] bg-white">
          <div className="flex items-center sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-0.5 touch-pan-x">
            {heroQuickChips.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 sm:px-6 sm:py-2.5 text-[11px] sm:text-xs font-sans font-medium tracking-[0.14em] uppercase border shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex-shrink-0 whitespace-nowrap active:scale-95 hover:border-[#DEB660] hover:bg-[#DEB660] hover:text-black rounded-none"
                style={{
                  borderColor: "#E5E5E5",
                  backgroundColor: "#FFFFFF",
                  color: "#222222",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

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
          3. CATEGORY SHOWCASE — Vedhika Product Categories (Double-Framed Tiles)
          ===================================================== */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-12 sm:mt-18">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#222222]">
            Product Categories
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Explore handcrafted silhouettes curated for everyday grace and grand celebrations.
          </p>
        </div>

        {/* 5-Column Grid with Inset Double Frame (Vedhika Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-5 pt-2">
          {categoriesToDisplay.slice(0, 5).map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-square border border-[#DCDCDC] rounded-2xl p-1.5 sm:p-2 bg-white shadow-2xs group-hover:border-[#DEB660] group-hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="mt-2.5 text-sm sm:text-base font-sans font-medium text-[#222222] group-hover:text-[#DEB660] transition-colors text-center truncate w-full">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          3.5 DYNAMIC PROMOTIONAL ADS — Live Synced from Admin Panel (/admin/ads)
          ===================================================== */}
      {activeAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(promoAds.length > 0 ? promoAds : activeAds.slice(0, 2)).map((ad: any) => (
              <Link
                key={ad.id}
                href={ad.link || "/shop"}
                className="group relative overflow-hidden rounded-none min-h-[220px] sm:min-h-[280px] flex items-end p-6 sm:p-8 border border-black/5 shadow-xs transition-all duration-300 hover:shadow-lg active:scale-[0.99]"
              >
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 group-hover:from-black/90 transition-all duration-300" />

                <div className="relative z-10 space-y-1.5 sm:space-y-2 text-white max-w-md">
                  <span className="px-2.5 py-0.5 rounded-none text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.16em] bg-[#DEB660] text-black inline-block">
                    {ad.position === "HERO_BANNER" ? "FEATURED CAMPAIGN" : "SPECIAL EDIT"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white line-clamp-1 drop-shadow-sm">
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-sans font-normal drop-shadow-sm">
                      {ad.description}
                    </p>
                  )}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-white group-hover:underline">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          4. FEATURED PRODUCTS (New Arrivals / Curated Bestsellers)
          ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-12 sm:mt-18">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#222222]">
            New Arrivals
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Handpicked designer creations fresh from Kerala's master looms.
          </p>
        </div>

        {/* Product Cards Grid — 2 columns on mobile, 4 on desktop (Sharp 2:3 Vedhika Cards) */}
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
                  className="group overflow-hidden shadow-2xs flex flex-col border border-[#EDEDED] bg-white rounded-none"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {p.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-sans font-bold tracking-[0.14em] uppercase text-black bg-[#DEB660] rounded-none">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 space-y-1.5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-medium tracking-[0.16em] uppercase text-[#888888] block mb-0.5">
                        {p.category}
                      </span>
                      <h3 className="font-sans font-medium text-xs sm:text-[13px] uppercase tracking-[0.03em] line-clamp-2 text-[#222222]">
                        {p.title}
                      </h3>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <span className="text-xs sm:text-sm font-semibold text-[#222222] font-sans">
                        Rs. {p.price.toLocaleString("en-IN")}.00
                      </span>
                      <Link
                        href={`/shop?category=${encodeURIComponent(p.category)}`}
                        className="px-2.5 py-1 text-[11px] font-sans uppercase tracking-wider text-[#222222] hover:text-[#DEB660]"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Centered Sharp Rectangular View More Button (Vedhika Style) */}
        <div className="text-center pt-4 sm:pt-6">
          <Link
            href="/shop"
            className="inline-block px-10 py-3.5 border border-[#222222] text-[#222222] hover:bg-[#DEB660] hover:border-[#DEB660] hover:text-black rounded-none font-sans font-semibold text-xs uppercase tracking-[0.18em] transition-all duration-300 active:scale-95 shadow-xs"
          >
            View More
          </Link>
        </div>
      </section>

      {/* =====================================================
          4.5 WATCH & SHOP · DRAPES OF ROYALTY (Vedhika Feature)
          ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="text-center space-y-1 mb-8">
          <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#DEB660]">
            BOUTIQUE STYLING STORIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#222222]">
            Watch and Shop
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Explore drapes in motion, artisanal details, and festive styling reels by Devika.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {[
            {
              title: "Tussar Drape in Motion",
              category: "Saree Atelier",
              image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
              link: "/shop?category=sarees",
            },
            {
              title: "Festive Anarkali Styling",
              category: "Kurtis & Sets",
              image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85",
              link: "/shop?category=kurtis",
            },
            {
              title: "Bridal Zari Close-Up",
              category: "Kanjivaram Silk",
              image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85",
              link: "/shop?category=kanjivaram",
            },
            {
              title: "Aithrithi Lite Daily Luxe",
              category: "Mulmul & Linen",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85",
              link: "/shop?category=aithrithi-lite",
            },
          ].map((story, i) => (
            <Link
              key={i}
              href={story.link}
              className="group relative aspect-[9/16] overflow-hidden rounded-none bg-slate-900 shadow-xs border border-[#EDEDED] flex flex-col justify-end p-3.5 sm:p-4 text-white"
            >
              <img
                src={story.image}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 transition-all duration-300" />

              {/* Play Badge Overlay */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-[#DEB660] group-hover:text-black group-hover:border-[#DEB660] transition-colors">
                <span className="text-[10px] font-bold">▶</span>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.16em] text-[#DEB660] block">
                  {story.category}
                </span>
                <h3 className="font-sans font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
                  {story.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-white pt-1 group-hover:text-[#DEB660] transition-colors">
                  Shop Look →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          MID-PAGE EDITORIAL BANNER — "Style Within Reach" (Vedhika Style)
          ===================================================== */}
      <section className="w-full relative overflow-hidden min-h-[380px] sm:min-h-[480px] flex items-center justify-center my-12 sm:my-20">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
          alt="Aithrithi Lite Editorial"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 sm:bg-black/35 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white space-y-3 sm:space-y-4">
          <span className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.24em] text-[#DEB660]">
            AITHRITHI LITE · BESPOKE BOUTIQUE
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-white drop-shadow-md">
            Style Within Reach
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-100 max-w-lg mx-auto font-sans leading-relaxed drop-shadow-sm">
            Lightweight artisanal sarees, festive designer kurtas, and breezy everyday luxury handcrafted for modern royalty.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 bg-white text-[#222222] hover:bg-[#DEB660] hover:text-black font-sans font-bold text-xs uppercase tracking-[0.16em] transition-all rounded-none shadow-xl"
            >
              Shop Now
            </Link>
          </div>
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
          5.5 FEATURED IN / PRESS RECOGNITION (Vedhika Style)
          ===================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-18 pt-10 border-t border-[#EDEDED]">
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-center text-[#222222] tracking-tight mb-8">
          Featured In
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 items-center justify-center gap-4 sm:gap-6 opacity-85">
          <div className="flex items-center justify-center p-3 sm:p-4 font-serif font-bold text-slate-800 text-sm sm:text-base tracking-wider border border-slate-200/80 bg-white shadow-2xs">
            THE HINDU
          </div>
          <div className="flex items-center justify-center p-3 sm:p-4 font-serif font-bold text-slate-800 text-xs sm:text-sm tracking-widest border border-slate-200/80 bg-white shadow-2xs text-center">
            THE NEW INDIAN EXPRESS
          </div>
          <div className="flex items-center justify-center p-3 sm:p-4 font-sans font-black text-slate-800 text-xs sm:text-sm tracking-tight border border-slate-200/80 bg-white shadow-2xs">
            ET RETAIL.COM
          </div>
          <div className="flex items-center justify-center p-3 sm:p-4 font-serif font-bold text-slate-800 text-sm sm:text-base tracking-wider border border-slate-200/80 bg-white shadow-2xs">
            VANITHA
          </div>
          <div className="flex items-center justify-center p-3 sm:p-4 font-sans font-black text-slate-800 text-xs sm:text-sm tracking-widest border border-slate-200/80 bg-white shadow-2xs">
            PELIKKEN
          </div>
        </div>
      </section>

      {/* =====================================================
          6. CALLOUT BANNER — full-width CTA strip
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
              className="avro-btn px-6 py-3 rounded-none bg-white text-slate-900 font-sans font-bold tracking-[0.14em] uppercase text-xs hover:bg-[#FAF7F5] transition-colors shadow-sm text-center"
            >
              Explore Sarees & Kurtis
            </Link>
            <Link
              href="/track"
              className="avro-btn px-6 py-3 rounded-none bg-white/10 hover:bg-white/20 text-white font-sans font-bold tracking-[0.14em] uppercase text-xs border border-white/20 transition-colors text-center"
            >
              Track My Order
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FLOATING WHATSAPP CONCIERGE BUTTON (Synced with Admin WhatsApp)
          ===================================================== */}
      <a
        href={`https://wa.me/${(customOverrides.whatsappNumber || dbTheme?.supportPhone || "+919496590984").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Aithrithi! I would like to inquire about your designer collections.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group cursor-pointer"
        aria-label="Chat with Aithrithi Concierge on WhatsApp"
      >
        <span className="hidden sm:inline-block px-3 py-1.5 bg-white text-slate-800 text-[11px] font-sans font-semibold rounded-full shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          WhatsApp Concierge
        </span>
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110 active:scale-95">
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.99.54 1.785.83 2.795.83 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.767-5.767-5.767zm7.551 5.766c0 4.167-3.39 7.557-7.551 7.557-1.309 0-2.535-.335-3.606-.921l-4.425 1.16 1.181-4.318c-.689-1.121-1.071-2.433-1.071-3.778 0-4.167 3.39-7.558 7.551-7.558 4.161 0 7.551 3.391 7.551 7.558z" />
          </svg>
        </div>
      </a>
    </div>
  );
}
