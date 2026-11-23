"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Play,
  Film,
  Tag,
  Star,
} from "lucide-react";
import { AvroThemeDefinition } from "@/lib/themes-registry";

export interface HeroBannerSlide {
  id: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroBannerSliderProps {
  slides?: HeroBannerSlide[];
  fallbackImage: string;
  fallbackTitle: string;
  fallbackTagline: string;
  themeDef: AvroThemeDefinition;
  isDarkHero: boolean;
  primaryColor: string;
  accentColor: string;
  buttonRadius: string;
}

export function HeroBannerSlider({
  slides = [],
  fallbackImage,
  fallbackTitle,
  fallbackTagline,
  themeDef,
  isDarkHero,
  primaryColor,
  accentColor,
  buttonRadius,
}: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const activeSlides = Array.isArray(slides) && slides.length > 0 ? slides : [];
  const totalSlides = activeSlides.length;

  // Auto right-scroll timer every 5.5 seconds unless hovered/paused
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5500);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused]);

  // Restart video when active slide changes
  useEffect(() => {
    if (totalSlides > 0 && activeSlides[currentIndex]?.mediaType === "video") {
      const vid = videoRefs.current[currentIndex];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  }, [currentIndex, totalSlides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Touch Swipe Gesture Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 45) {
      // Swiped Left -> Advance to next slide
      handleNext();
    } else if (diff < -45) {
      // Swiped Right -> Go to prev slide
      handlePrev();
    }
    setTouchStartX(null);
  };

  const btnRadiusStyle =
    buttonRadius === "rounded-full"
      ? "9999px"
      : buttonRadius === "rounded-none"
      ? "0px"
      : buttonRadius === "rounded-2xl"
      ? "16px"
      : "12px";

  // If no banner slides configured, render single fallback image
  if (totalSlides === 0) {
    const isAithrithiTheme = themeDef.code === "AITHRITHI_MAROON";

    return (
      <div
        className={`relative overflow-hidden shadow-2xl border transition-all group ${
          isAithrithiTheme
            ? "aspect-[2/1] sm:aspect-[2/1] lg:aspect-[2/1] w-full"
            : "aspect-[4/5]"
        }`}
        style={{
          borderColor: isDarkHero ? "rgba(255,255,255,0.15)" : themeDef.palette.border,
          borderRadius: themeDef.typography.buttonRadius === "rounded-none" ? "0px" : "24px",
        }}
      >
        <Link href="/shop" className="block w-full h-full cursor-pointer">
          <img
            src={fallbackImage}
            alt={fallbackTitle}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/aithrithi-hero.jpg";
            }}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isAithrithiTheme ? "group-hover:scale-[1.015]" : "group-hover:scale-105"
            }`}
          />
        </Link>
        {!isAithrithiTheme && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        )}

        {/* Floating card at bottom (only for other themes so Aithrithi's artwork remains completely unobstructed) */}
        {!isAithrithiTheme && (
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-between avro-fade-in-delay-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                Featured Collection
              </span>
              <strong className="text-sm font-extrabold block">{fallbackTitle}</strong>
              <span className="text-[11px] text-slate-200 line-clamp-1">{fallbackTagline}</span>
            </div>
            <Link
              href="/shop"
              className="avro-btn p-2 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Subtle Luxury Corner Accent for Aithrithi */}
        {isAithrithiTheme && (
          <>
            {/* 3D Floating Haute Couture Badge */}
            <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-6 z-10 avro-3d-float">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[10.5px] font-serif font-bold uppercase tracking-[0.2em] bg-black/55 text-[#FAF7F5] backdrop-blur-md border border-white/25 shadow-xl">
                <span className="text-[#C5A880]">✦</span>
                <span>Haute Couture · Festive 2026</span>
              </span>
            </div>

            {/* Luxury 3D Glassmorphism Action Pill */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-5 sm:right-6 z-10">
              <Link
                href="/shop"
                className="avro-3d-btn inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-serif font-bold uppercase tracking-wider bg-white/95 hover:bg-white text-[#58111A] shadow-2xl backdrop-blur-md border border-[#C5A880]/50 transition-all active:scale-95 group/btn"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </div>

            {/* Luxury Inner Champagne Rim */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#C5A880]/25 rounded-xl sm:rounded-3xl" />
          </>
        )}
      </div>
    );
  }

  const currentSlide = activeSlides[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-hidden shadow-2xl border transition-all group select-none touch-pan-y ${
        themeDef.code === "AITHRITHI_MAROON"
          ? "aspect-[2/1] w-full"
          : "aspect-[4/5] min-h-[360px] sm:min-h-[440px]"
      }`}
      style={{
        borderColor: isDarkHero ? "rgba(255,255,255,0.15)" : themeDef.palette.border,
        borderRadius: themeDef.typography.buttonRadius === "rounded-none" ? "0px" : "24px",
      }}
    >
      {/* Slides Container with Smooth Right-Scroll Transition */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeSlides.map((slide, idx) => (
          <div key={slide.id || idx} className="w-full h-full flex-shrink-0 relative bg-slate-950">
            {slide.mediaType === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={slide.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={slide.mediaUrl}
                alt={slide.title || "Banner Ad"}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            )}

            {/* Gradient Darkening Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
          </div>
        ))}
      </div>

      {/* Top Banner Tag & Media Indicator */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-sm">
          {currentSlide?.badge ? (
            <>
              <Tag className="w-3 h-3 text-amber-400" />
              <span>{currentSlide.badge}</span>
            </>
          ) : (
            <>
              <Tag className="w-3 h-3 text-white/80" />
              <span>COLLECTION</span>
            </>
          )}
        </span>

        <div className="flex items-center gap-2">
          {currentSlide?.mediaType === "video" && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600/90 text-white flex items-center gap-1 backdrop-blur-sm shadow-xs">
              <Film className="w-2.5 h-2.5" /> VIDEO
            </span>
          )}

          {/* Slide Progress Counter Pill */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-slate-200 border border-white/20 backdrop-blur-sm">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Floating Bottom Card: Ad Title, Subtitle, & CTA */}
      <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white z-10 transition-all shadow-xl">
        <div className="space-y-1 mb-3">
          {currentSlide?.badge && (
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-400 block">
              {currentSlide.badge}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1">
            {currentSlide?.title || fallbackTitle}
          </h3>
          {currentSlide?.subtitle && (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {currentSlide.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          {currentSlide?.ctaLink ? (
            <Link
              href={currentSlide.ctaLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:scale-105 shadow-sm"
              style={{
                backgroundColor: accentColor,
                borderRadius: btnRadiusStyle,
              }}
            >
              <span>{currentSlide.ctaText || "Claim Offer"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:scale-105 shadow-sm"
              style={{
                backgroundColor: primaryColor,
                borderRadius: btnRadiusStyle,
              }}
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Pagination Navigation Dots */}
          <div className="flex items-center gap-1.5">
            {activeSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === dotIdx
                    ? "w-5 bg-white shadow-sm"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Scroll & Left Scroll Control Buttons */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-20 backdrop-blur-sm border border-white/20 cursor-pointer shadow-md active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-20 backdrop-blur-sm border border-white/20 cursor-pointer shadow-md active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
