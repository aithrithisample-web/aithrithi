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

  // 1. Single Fallback Hero Banner (No Slides)
  if (totalSlides === 0) {
    return (
      <div className="relative w-full overflow-hidden min-h-[400px] sm:min-h-[480px] md:min-h-[540px] lg:min-h-[620px] flex items-center justify-center select-none">
        {/* Background Ad Image - Full bleed, no frame */}
        <img
          src={fallbackImage}
          alt={fallbackTitle}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/aithrithi-hero.jpg";
          }}
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01]"
        />

        {/* Cinematic Gradient Vignette Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/50 sm:to-black/25 pointer-events-none" />

        {/* Content Container - Mobile-Friendly Layout */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center sm:text-left flex flex-col items-center sm:items-start justify-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10.5px] sm:text-xs font-serif font-bold uppercase tracking-[0.2em] bg-white/15 text-[#FAF7F5] backdrop-blur-md border border-white/25 shadow-sm mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 text-[#C5A880]" />
            <span>AITHRITHI COUTURE · BY DEVIKA</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-wide leading-[1.15] drop-shadow-md max-w-2xl">
            {fallbackTitle || "Timeless Elegance & Handcrafted Luxury"}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-200 max-w-lg font-sans font-normal leading-relaxed drop-shadow-sm">
            {fallbackTagline || "Discover handcrafted luxury sarees, designer kurtis, and festive ensembles made with master craftsmanship."}
          </p>

          {/* Action Button */}
          <div className="mt-6 sm:mt-8 flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-xs sm:text-sm font-serif font-bold uppercase tracking-wider bg-white text-[#58111A] hover:bg-[#FAF7F5] shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
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
      className="relative w-full overflow-hidden min-h-[400px] sm:min-h-[480px] md:min-h-[540px] lg:min-h-[620px] flex items-center select-none touch-pan-y"
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

            {/* Seamless Vignette Overlay - No Frames */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/55 sm:to-black/25 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Floating Content Over Background */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center sm:text-left flex flex-col items-center sm:items-start justify-center w-full">
        {/* Ad Campaign Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10.5px] sm:text-xs font-serif font-bold uppercase tracking-[0.2em] bg-white/15 text-[#FAF7F5] backdrop-blur-md border border-white/25 shadow-sm mb-3 sm:mb-4">
          <Tag className="w-3 h-3 text-[#C5A880]" />
          <span>{currentSlide?.badge || "SPECIAL OFFER"}</span>
          {currentSlide?.mediaType === "video" && (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-rose-600 text-white font-mono">
              LIVE
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-wide leading-[1.15] drop-shadow-md max-w-2xl">
          {currentSlide?.title || fallbackTitle}
        </h1>

        {/* Description */}
        {currentSlide?.subtitle && (
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-200 max-w-lg font-sans font-normal leading-relaxed drop-shadow-sm">
            {currentSlide.subtitle}
          </p>
        )}

        {/* Call to Action Button */}
        <div className="mt-6 sm:mt-8 flex items-center gap-3">
          <Link
            href={currentSlide?.ctaLink || "/shop"}
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-xs sm:text-sm font-serif font-bold uppercase tracking-wider bg-white text-[#58111A] hover:bg-[#FAF7F5] shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
          >
            <span>{currentSlide?.ctaText || "Shop Collection"}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Slide Navigation Pagination Dots at Bottom */}
      {totalSlides > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 z-20 pointer-events-auto">
          {activeSlides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === dotIdx
                  ? "w-6 sm:w-8 bg-white shadow-md"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Left / Right Arrow Controls */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-20 backdrop-blur-md border border-white/20 cursor-pointer shadow-lg active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-20 backdrop-blur-md border border-white/20 cursor-pointer shadow-lg active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}
    </div>
  );
}
