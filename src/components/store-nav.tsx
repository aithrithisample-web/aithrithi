"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  User,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Home,
  Compass,
  Search,
  Truck,
  MessageCircle,
  Instagram,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useState, useEffect, useRef } from "react";
import { resolveStoreTheme } from "@/lib/themes-registry";

interface CustomerUser {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  ordersCount?: number;
  wishlistCount?: number;
}

export function StoreNav({ theme }: { theme?: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const previewParam = searchParams?.get("theme") || searchParams?.get("previewTheme");
  const matchingThemeDef = resolveStoreTheme(previewParam || theme?.activeTheme, theme);

  let customOverrides: any = {};
  try {
    if (theme?.socialLinksJson) {
      customOverrides = typeof theme.socialLinksJson === "string" ? JSON.parse(theme.socialLinksJson) : theme.socialLinksJson;
    }
  } catch {
    customOverrides = {};
  }

  // Preserve store brand name without overriding on theme switch
  const brandName = theme?.brandName || "AVRO Store";
  const announcementText = theme?.announcementBarText || matchingThemeDef.announcementBar.text;
  const showAnnouncement = theme?.showAnnouncementBar ?? true;

  const isDarkNav =
    matchingThemeDef.palette.headerBg === "#090D16" ||
    matchingThemeDef.palette.headerBg === "#09090B" ||
    matchingThemeDef.palette.headerBg === "#0A0A0A" ||
    matchingThemeDef.palette.headerBg === "#36080F" ||
    matchingThemeDef.palette.headerBg === "#58111A" ||
    matchingThemeDef.palette.headerBg === "#1C1917";

  // Check customer login status
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/customer/auth/me");
      const data = await res.json();
      if (data.authenticated && data.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock background scrolling while mobile off-canvas drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const origOverflow = document.body.style.overflow;
      const origTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = origOverflow;
        document.body.style.touchAction = origTouchAction;
      };
    }
  }, [mobileMenuOpen]);

  // Measure fixed header height dynamically
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [showAnnouncement, brandName]);

  // Quick Guest Login
  const handleInstantGuestLogin = async () => {
    try {
      const res = await fetch("/api/customer/auth/guest", { method: "POST" });
      const data = await res.json();
      if (data.success && data.customer) {
        setCustomer(data.customer);
        setUserDropdownOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.warn("Guest login failed:", e);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/customer/auth/logout", { method: "POST" });
      setCustomer(null);
      setUserDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b backdrop-blur-md shadow-2xs"
        style={{
          backgroundColor: isDarkNav ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)",
          borderColor: isDarkNav ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Sleek Announcement Bar */}
        {showAnnouncement && (
          <div
            className="py-1 px-4 overflow-hidden transition-colors"
            style={{
              backgroundColor: matchingThemeDef.announcementBar.bg,
              color: matchingThemeDef.announcementBar.textColor,
            }}
          >
            <div className="avro-marquee text-[11px] font-medium tracking-wider select-none">
              {[0, 1].map((i) => (
                <span key={i} className="flex items-center gap-8 px-4 whitespace-nowrap">
                  {announcementText}
                  <span className="opacity-30">·</span>
                  {announcementText}
                  <span className="opacity-30">·</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ROW 1: Centered Logo + Utility Action Icons (Vedhika Style) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Hamburger Toggle (Left on Mobile, hidden on Desktop) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Desktop Left Search Quick Jump */}
          <div className="hidden md:flex items-center gap-3 flex-1">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-[#DEB660] transition-colors uppercase tracking-wider font-sans font-medium"
            >
              <Search className="w-4 h-4 text-slate-700" />
              <span>Search Catalog</span>
            </Link>
          </div>

          {/* Centered Brand Emblem & Wordmark (Vedhika Style) */}
          <div className="flex-shrink-0 text-center flex flex-col items-center">
            <Link href="/" className="inline-flex flex-col items-center group py-0.5" title={brandName}>
              <img
                src={theme?.logoUrl || "/aithrithi-nav-logo-maroon.png"}
                alt={brandName}
                className="h-9 sm:h-12 md:h-13 w-auto max-w-[170px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/aithrithi-nav-logo-maroon.png";
                }}
              />
            </Link>
          </div>

          {/* Right-Aligned Utility Icons (Search, Track, Wishlist, Account, Cart) — Vedhika 3-Icon Row on Mobile */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-2.5 flex-1">
            {/* Search Button */}
            <Link
              href="/shop"
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-slate-800 hover:text-[#DEB660] hover:bg-slate-50 transition-colors"
              title="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            {/* Track Order Icon (Visible on Mobile & Desktop — Vedhika Style) */}
            <Link
              href="/track"
              className="relative w-8.5 h-8.5 rounded-full flex items-center justify-center text-slate-800 hover:text-[#DEB660] hover:bg-slate-50 transition-colors"
              title="Track Order"
            >
              <Truck className="w-4.5 h-4.5" />
            </Link>

            {/* Wishlist Icon (Desktop only — on mobile accessible via Drawer & Bottom Nav) */}
            <Link
              href="/wishlist"
              className="hidden sm:flex relative w-8.5 h-8.5 rounded-full items-center justify-center text-slate-700 hover:text-[#DEB660] hover:bg-slate-50 transition-colors"
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-1.5 h-8.5 px-2.5 rounded-full transition-colors text-xs font-semibold ${
                  isDarkNav
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
                aria-label="User Account"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline max-w-[90px] truncate text-[11px]">
                  {customer ? (customer.isGuest ? "Guest" : customer.name.split(" ")[0]) : "Account"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 space-y-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {customer ? (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <strong className="block text-slate-900 truncate">{customer.name}</strong>
                        <span className="text-[11px] text-slate-500 truncate block">{customer.email}</span>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Order History & Account</span>
                      </Link>
                      <Link
                        href="/track"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>Track My Consignment</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-lg font-medium transition text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/login?mode=register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>Create Account</span>
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={handleInstantGuestLogin}
                        className="w-full flex items-center justify-between p-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg font-bold transition text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#58111A]" />
                          <span>Continue as Guest</span>
                        </div>
                        <span className="text-[10px] text-stone-500">Quick Access</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Link with Solid Black Circular Badge (Vedhika Style) */}
            <Link
              href="/cart"
              className="relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-800 hover:text-[#DEB660] hover:bg-slate-50 transition-colors"
              title="Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ROW 2: Boutique Navigation Menu (Visible on Mobile & Desktop) */}
        <div className="border-t border-[#EDEDED] py-2 sm:py-2.5 bg-white overflow-x-auto no-scrollbar">
          <nav className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-start md:justify-center gap-4 sm:gap-7 lg:gap-9 text-[11px] sm:text-[12px] font-bold sm:font-medium tracking-[0.14em] uppercase font-sans text-[#222222] whitespace-nowrap">
            <Link href="/" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Home</Link>
            <Link href="/shop?category=sarees" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Sarees</Link>
            <Link href="/shop?category=kurtis" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Kurtis</Link>
            <Link href="/shop?category=aithrithi-lite" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Aithrithi Lite</Link>
            <Link href="/shop?category=kanjivaram" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Kanjivaram</Link>
            <Link href="/shop" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Collections</Link>
            <Link href="/shop?featured=true" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0 text-amber-700 font-extrabold">New Arrivals</Link>
            <Link href="/about" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">About Us</Link>
            <Link href="/contact" className="hover:text-[#DEB660] transition-colors py-0.5 shrink-0">Stores & Contact</Link>
          </nav>
        </div>
      </header>

      {/* Luxury Mobile Off-Canvas Drawer Navigation (Vedhika Shopify Style) — Rendered at Root Level */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] md:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Off-Canvas Slide Drawer from Left */}
          <div className="fixed top-0 left-0 bottom-0 h-full w-[85vw] max-w-[320px] bg-white text-[#222222] shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto font-sans">
            {/* Drawer Top Header */}
            <div>
              <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FAF7F5]">
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-[#222222]">
                    {brandName || "Aithrithi.in"}
                  </span>
                  <span className="text-[8.5px] uppercase tracking-[0.2em] font-serif text-[#C5A880]">
                    Kerala's Designer Couture
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center text-[#222222] hover:bg-[#DEB660] hover:text-black transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar in Mobile Menu */}
              <div className="p-3.5 border-b border-[#F0F0F0]">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-none border border-[#EDEDED] bg-[#F9F9F9] text-xs text-slate-500 hover:border-[#DEB660] transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-sans">Search sarees, kurtis, silks...</span>
                </Link>
              </div>

              {/* Primary Boutique Navigation Menu */}
              <div className="py-2 px-3 space-y-0.5 text-xs font-semibold uppercase tracking-[0.12em] font-sans">
                {[
                  { label: "Home", href: "/", badge: null },
                  { label: "Sarees", href: "/shop?category=sarees", badge: "Silks" },
                  { label: "Kurtis", href: "/shop?category=kurtis", badge: "Festive" },
                  { label: "Aithrithi Lite", href: "/shop?category=aithrithi-lite", badge: "Luxe" },
                  { label: "Kanjivaram", href: "/shop?category=kanjivaram", badge: "Bridal" },
                  { label: "Collections", href: "/shop", badge: null },
                  { label: "New Arrivals", href: "/shop?featured=true", badge: "New" },
                  { label: "About Us", href: "/about", badge: null },
                  { label: "Stores & Contact", href: "/contact", badge: null },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-none transition-colors border-b border-[#F7F7F7] ${
                      pathname === item.href
                        ? "text-[#DEB660] font-bold bg-[#FAF7F5]"
                        : "text-[#222222] hover:text-[#DEB660] hover:bg-[#FAF7F5]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 bg-[#DEB660]/20 text-[#222222] rounded-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Section: Account, Tracking, Social */}
            <div className="p-4 border-t border-[#F0F0F0] bg-[#FAF7F5] space-y-3">
              <div className="space-y-1 text-xs">
                <Link
                  href="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-slate-700 hover:text-[#DEB660] transition-colors"
                >
                  <Truck className="w-3.5 h-3.5 text-[#DEB660]" />
                  <span>Track My Order</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1.5 text-slate-700 hover:text-[#DEB660] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-500 text-white rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Direct WhatsApp & Instagram Buttons in Drawer */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/${(customOverrides.whatsappNumber || theme?.supportPhone || "+919496590984").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Aithrithi! I would like to inquire about your collections.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-2 rounded-none bg-[#25D366] text-white font-sans font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={customOverrides.instagramUrl || "https://instagram.com/aithrithi.in"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-2 rounded-none bg-gradient-to-r from-rose-600 to-purple-600 text-white font-sans font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs"
                >
                  <Instagram className="w-3 h-3" />
                  <span>Instagram</span>
                </a>
              </div>

              {/* Sign In / Account status */}
              <div className="pt-2 border-t border-[#E5E5E5]">
                {customer ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">{customer.name}</span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 bg-[#222222] text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-none hover:bg-[#DEB660] hover:text-black transition-colors"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locked Navigation Viewport Spacer (Prevents Fixed Header Overlap) */}
      <div
        style={{ height: headerHeight ? `${headerHeight}px` : undefined }}
        className={!headerHeight ? (showAnnouncement ? "h-[76px] sm:h-[95px] md:h-[105px]" : "h-[50px] sm:h-[65px] md:h-[75px]") : undefined}
        aria-hidden="true"
      />

      {/* NATIVE MOBILE BOTTOM NAVIGATION BAR (Vedhika 3-Item Style: Home, Cart, Account) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl transition-all"
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-3 h-14 max-w-md mx-auto px-2">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname === "/"
                ? "text-black font-semibold"
                : "text-slate-700 hover:text-black"
            }`}
          >
            <Home className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[11px] mt-0.5 font-sans">Home</span>
          </Link>

          {/* 2. Cart (with solid black circular badge) */}
          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
              pathname === "/cart"
                ? "text-black font-semibold"
                : "text-slate-700 hover:text-black"
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 stroke-[1.75]" />
              <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            </div>
            <span className="text-[11px] mt-0.5 font-sans">Cart</span>
          </Link>

          {/* 3. Account */}
          <Link
            href={customer ? (customer.isGuest ? "/login" : "/account") : "/login"}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname.startsWith("/account") || pathname.startsWith("/login")
                ? "text-black font-semibold"
                : "text-slate-700 hover:text-black"
            }`}
          >
            <User className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[11px] mt-0.5 font-sans">Account</span>
          </Link>
        </div>
      </nav>

      {/* FLOATING SCROLL-TO-TOP BUTTON (Vedhika Style — Bottom Right Square Box) */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white border border-slate-300 text-slate-800 flex items-center justify-center shadow-md hover:bg-slate-50 transition-all rounded-none cursor-pointer"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
      </button>
    </>
  );
}
