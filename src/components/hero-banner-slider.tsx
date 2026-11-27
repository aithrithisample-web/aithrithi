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
  Sparkles,
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

  // Auto-advance slides every 5.5s unless paused
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5500);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused]);

  // Restart video on active slide
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

  // Mobile Touch Swipe Handling
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
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  // 1. Single Fallback Hero Banner (No Slides) — Full Screen Viewport Height
  if (totalSlides === 0) {
    return (
      <div className="relative w-full overflow-hidden h-[calc(100svh-54px)] sm:h-[calc(100dvh-68px)] min-h-[560px] lg:min-h-[700px] flex items-center justify-center select-none">
        {/* Background Ad Image - Full bleed, no frame */}
        <img
          src={fallbackImage}
          alt={fallbackTitle}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/aithrithi-hero.jpg";
          }}
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01]"
        />

        {/* Subtle Vignette Overlay for Readability (Vedhika Mobile Style) */}
        <div className="absolute inset-0 bg-black/40 sm:bg-black/35 pointer-events-none" />

        {/* Content Container — Centered Luxury Boutique Layout */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20 text-center flex flex-col items-center justify-center w-full space-y-3.5">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-medium text-white tracking-tight leading-snug drop-shadow-md max-w-2xl">
            {fallbackTitle || "Celebrate all day, every day."}
          </h1>

          {fallbackTagline && (
            <p className="text-xs sm:text-sm text-slate-100 max-w-md font-sans font-normal leading-relaxed drop-shadow-sm">
              {fallbackTagline}
            </p>
          )}

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-7 py-2.5 sm:px-8 sm:py-3 text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.18em] bg-white text-black hover:bg-[#DEB660] transition-colors rounded-none shadow-md"
            >
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Edge Arrow Boxes (Vedhika Style) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-10 sm:w-10 sm:h-12 bg-white text-black border border-slate-200/90 shadow-md flex items-center justify-center z-20 pointer-events-none opacity-90">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-10 sm:w-10 sm:h-12 bg-white text-black border border-slate-200/90 shadow-md flex items-center justify-center z-20 pointer-events-none opacity-90">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
        </div>
      </div>
    );
  }

  // 2. Dynamic Active Ads / Slider Hero Banner
  const currentSlide = activeSlides[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden h-[calc(100svh-54px)] sm:h-[calc(100dvh-68px)] min-h-[560px] lg:min-h-[700px] flex items-center select-none touch-pan-y"
    >
      {/* Background Slides Container */}
      <div
        className="flex w-full h-full absolute inset-0 transition-transform duration-700 ease-out"
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
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={slide.mediaUrl}
                alt={slide.title || "Banner Ad"}
                className="w-full h-full object-cover object-center"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            )}

            {/* Seamless Vignette Overlay */}
            <div className="absolute inset-0 bg-black/40 sm:bg-black/35 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Floating Centered Content Over Background (Vedhika Style) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20 text-center flex flex-col items-center justify-center w-full space-y-3.5">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-medium text-white tracking-tight leading-snug drop-shadow-md max-w-2xl">
          {currentSlide?.title || fallbackTitle || "Celebrate all day, every day."}
        </h1>

        {currentSlide?.subtitle && (
          <p className="text-xs sm:text-sm text-slate-100 max-w-md font-sans font-normal leading-relaxed drop-shadow-sm">
            {currentSlide.subtitle}
          </p>
        )}

        <div className="pt-2">
          <Link
            href={currentSlide?.ctaLink || "/shop"}
            className="inline-block px-7 py-2.5 sm:px-8 sm:py-3 text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.18em] bg-white text-black hover:bg-[#DEB660] transition-colors rounded-none shadow-md"
          >
            {currentSlide?.ctaText || "SHOP NOW"}
          </Link>
        </div>
      </div>

      {/* Slide Navigation Pagination Dots at Bottom */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 z-20 pointer-events-auto">
          {activeSlides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-1 transition-all duration-300 cursor-pointer rounded-none ${
                currentIndex === dotIdx
                  ? "w-6 bg-[#DEB660] shadow-xs"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Left / Right White Square Arrow Controls Flush with Edges (Vedhika Style) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-10 sm:w-10 sm:h-12 bg-white text-black border border-slate-200/90 shadow-md flex items-center justify-center z-20 cursor-pointer active:scale-95 transition-all hover:bg-slate-50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-10 sm:w-10 sm:h-12 bg-white text-black border border-slate-200/90 shadow-md flex items-center justify-center z-20 cursor-pointer active:scale-95 transition-all hover:bg-slate-50"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </button>
        </>
      )}
    </div>
  );
}
