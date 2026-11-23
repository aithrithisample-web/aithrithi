"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppFloatingWidget({ theme }: { theme?: any }) {
  const [showTooltip, setShowTooltip] = useState(true);

  let customOverrides: any = {};
  try {
    if (theme?.socialLinksJson) {
      customOverrides = JSON.parse(theme.socialLinksJson);
    }
  } catch (e) {}

  // Configuration from Admin Panel
  const enabled = customOverrides.showWhatsAppButton !== false;
  const rawNumber = customOverrides.whatsappNumber || theme?.supportPhone || "+919496590984";
  const message =
    customOverrides.whatsappMessage ||
    "Hello Aithrithi! I would like to inquire about your handcrafted collection.";
  const tooltipText = customOverrides.whatsappTooltip || "Chat with Style Concierge";
  const position = customOverrides.whatsappPosition || "bottom-right";

  if (!enabled) return null;

  // Sanitize phone number (strip spaces, +, -, etc. for wa.me API)
  const cleanNumber = rawNumber.replace(/[^0-9]/g, "");

  const handleClick = () => {
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const isLeft = position === "bottom-left";

  return (
    <div
      className={`fixed ${isLeft ? "left-4 sm:left-6" : "right-4 sm:right-6"} bottom-[84px] sm:bottom-6 z-40 flex flex-col ${
        isLeft ? "items-start" : "items-end"
      } pointer-events-none select-none`}
    >
      {/* Tooltip greeting pill */}
      {showTooltip && (
        <div
          className={`pointer-events-auto mb-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-800 shadow-lg border border-slate-200/80 text-[11px] font-sans font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:shadow-xl`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="truncate max-w-[180px] sm:max-w-[220px] cursor-pointer" onClick={handleClick}>
            {tooltipText}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Chat on WhatsApp"
        className="pointer-events-auto relative group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
        title={`${tooltipText} (${rawNumber})`}
      >
        {/* Soft pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* WhatsApp Official Vector Logo */}
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 fill-white relative z-10 transition-transform group-hover:rotate-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Small Active Badge Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-white" />
      </button>
    </div>
  );
}
