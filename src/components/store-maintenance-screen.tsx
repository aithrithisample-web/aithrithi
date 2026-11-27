"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  RefreshCw,
  MessageCircle,
  Mail,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface StoreMaintenanceScreenProps {
  brandName?: string;
  supportPhone?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  maintenanceHeadline?: string;
  maintenanceMessage?: string;
  disabledByAdmin?: boolean;
  licenseStatus?: {
    status?: string;
    plan?: string;
    expiresAt?: string;
    domain?: string;
    valid?: boolean;
    [key: string]: any;
  };
}

export function StoreMaintenanceScreen({
  brandName = "Aithrithi",
  supportPhone = "+91 94965 90984",
  supportEmail = "concierge@aithrithi.in",
  whatsappNumber,
  maintenanceHeadline,
  maintenanceMessage,
  disabledByAdmin,
  licenseStatus,
}: StoreMaintenanceScreenProps) {
  const [checking, setChecking] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const cleanPhone = (whatsappNumber || supportPhone).replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${brandName}! I am inquiring about the store maintenance and my order status.`
  )}`;

  const handleCheckStatus = async () => {
    setChecking(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/license/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success && data.license?.valid && data.license?.status === "ACTIVE") {
        setSyncMessage("Store is now active! Reloading...");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setSyncMessage("Maintenance in progress. Please check back in a few minutes.");
      }
    } catch (e) {
      setSyncMessage("Checked just now. Still undergoing scheduled updates.");
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#C5A880]/30 selection:text-white relative overflow-hidden">
      {/* Ambient Luxury Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-gradient-to-b from-[#58111A]/20 via-[#C5A880]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Top Bar Announcement */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/60 backdrop-blur-md px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300 font-semibold">
              Platform Maintenance
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-serif hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C5A880]" />
            <span>{brandName} Digital Flagship</span>
          </div>
        </div>
      </header>

      {/* Center Hero Maintenance Card */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        {/* Prominent AVRO Logo Display */}
        <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-white/95 shadow-2xl shadow-black/60 border border-white/20 backdrop-blur-xl transition-transform hover:scale-105 duration-300">
          <img
            src="/avro-logo.png"
            alt="AVRO Commerce Engine"
            className="h-10 sm:h-12 w-auto object-contain mx-auto"
          />
        </div>

        {/* Maintenance Icon Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-6">
          <Clock className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Scheduled Catalog & System Updates</span>
        </div>

        {/* Brand & Headline */}
        <span className="text-xs sm:text-sm font-serif tracking-[0.2em] uppercase text-[#C5A880] mb-2 font-medium">
          {brandName}
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          {maintenanceHeadline || "We'll Be Back Shortly"}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed font-sans mb-8">
          {maintenanceMessage ||
            "Our online boutique is currently undergoing scheduled platform upgrades and catalog synchronization to bring you an elevated shopping experience."}
        </p>

        {/* Interactive Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mb-8">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking System..." : "Check Status"}</span>
          </button>

          {cleanPhone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Concierge</span>
            </a>
          )}
        </div>

        {syncMessage && (
          <p className="text-xs font-mono text-amber-300/90 bg-amber-950/40 border border-amber-800/40 px-4 py-2 rounded-lg mb-6 animate-fade-in">
            {syncMessage}
          </p>
        )}

        {/* Customer Assistance Info Box */}
        <div className="w-full max-w-md p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left text-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Order & Concierge Inquiries</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Existing orders and shipments are actively being fulfilled without delay. For urgent inquiries or custom orders, reach our concierge team:
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">Email Concierge:</span>
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#C5A880] hover:underline font-mono"
            >
              {supportEmail}
            </a>
          </div>
        </div>

        {/* Discrete Admin Link */}
        <div className="mt-8 pt-4 border-t border-slate-900 w-full max-w-xs flex items-center justify-center">
          <Link
            href="/admin/settings/license"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3" />
            <span>Store Administrator? Sign in to Admin</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </main>

      {/* Powered by AVRO Footer */}
      <footer className="relative z-10 border-t border-white/5 py-5 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</span>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <strong className="text-slate-300 font-semibold tracking-wider">AVRO Commerce Engine</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
