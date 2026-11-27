"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
} from "lucide-react";

export default function StoreFooter({ theme }: { theme?: any }) {
  const brandName = theme?.brandName || "Aithrithi";
  const currentYear = new Date().getFullYear();

  let customOverrides: any = {};
  try {
    if (theme?.socialLinksJson) {
      customOverrides = JSON.parse(theme.socialLinksJson);
    }
  } catch (e) {
    customOverrides = {};
  }

  const supportEmail = customOverrides.supportEmail || theme?.supportEmail || "info@aithrithi.in";
  const supportPhone = customOverrides.whatsappNumber || theme?.supportPhone || "+91 94965 90984";
  const logoUrl = theme?.logoUrl || "/aithrithi-nav-logo-maroon.png";

  return (
    <footer id="nt_footer" className="w-full bg-white border-t border-[#EBEBEB] font-sans">
      {/* =====================================================
          FOOTER TOP — 4 Columns (Vedhika Boutique Shopify Style)
          ===================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-xs">
          {/* Column 1: Contact Us & Logo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-[0.12em] block sm:hidden">
              Contact Us
            </h3>
            
            <Link href="/" className="inline-block py-1" title={brandName}>
              <img
                src={logoUrl}
                alt={brandName}
                className="h-10 sm:h-12 w-auto max-w-[200px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/aithrithi-nav-logo-maroon.png";
                }}
              />
            </Link>

            <div className="space-y-2 text-[#878787] text-[13px] pt-1">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#878787] shrink-0" />
                <a
                  href={`mailto:${supportEmail}`}
                  className="hover:text-[#DEB660] transition-colors"
                >
                  {supportEmail}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#878787] shrink-0" />
                <a
                  href={`tel:${supportPhone.replace(/[^0-9+]/g, "")}`}
                  className="hover:text-[#DEB660] transition-colors"
                >
                  {supportPhone}
                </a>
              </div>
            </div>

            {/* Social Icons (Vedhika Style Border Icons) */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={customOverrides.facebookUrl || "https://facebook.com/aithrithi"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#222222] hover:border-[#DEB660] hover:bg-[#DEB660] hover:text-white transition-all shadow-2xs"
                title="Follow on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>

              <a
                href={customOverrides.twitterUrl || "https://twitter.com/aithrithi"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#222222] hover:border-[#DEB660] hover:bg-[#DEB660] hover:text-white transition-all shadow-2xs"
                title="Follow on Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>

              <a
                href={customOverrides.instagramUrl || "https://instagram.com/aithrithi.in"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#222222] hover:border-[#DEB660] hover:bg-[#DEB660] hover:text-white transition-all shadow-2xs"
                title="Follow on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Aithrithi! I would like to inquire about your collections.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#222222] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-2xs"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-[0.12em]">
              Collections
            </h3>
            <ul className="space-y-2.5 text-[13px] text-[#878787]">
              <li>
                <Link href="/shop?category=sarees" className="hover:text-[#DEB660] transition-colors">
                  Wedding Sarees
                </Link>
              </li>
              <li>
                <Link href="/shop?category=blouses" className="hover:text-[#DEB660] transition-colors">
                  Blouses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kanjivaram" className="hover:text-[#DEB660] transition-colors">
                  Aithrithi Kanjeevaram
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kurtis" className="hover:text-[#DEB660] transition-colors">
                  Kurtis
                </Link>
              </li>
              <li>
                <Link href="/shop?category=aithrithi-lite" className="hover:text-[#DEB660] transition-colors">
                  Aithrithi Lite
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-[0.12em]">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-[13px] text-[#878787]">
              <li>
                <Link href="/returns" className="hover:text-[#DEB660] transition-colors">
                  Return & Exchange Request
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#DEB660] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#DEB660] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#DEB660] transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Service */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-[0.12em]">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-[13px] text-[#878787]">
              <li>
                <Link href="/track" className="hover:text-[#DEB660] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#DEB660] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#DEB660] transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#DEB660] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#DEB660] transition-colors">
                  Disclaimer Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#DEB660] transition-colors">
                  Return & Exchange Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER BOTTOM — Solid #222222 Charcoal Bar (Vedhika Style)
          ===================================================== */}
      <div className="w-full bg-[#222222] text-[#FFFFFF] py-4 sm:py-5 px-4 text-center">
        <div className="max-w-7xl mx-auto text-xs font-sans text-center">
          <p className="tracking-wide text-white/90">
            Copyright © {currentYear} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
