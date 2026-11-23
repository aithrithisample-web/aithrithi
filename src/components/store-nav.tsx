"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  User,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Package,
  Home,
  Compass,
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

  const previewParam = searchParams?.get("theme") || searchParams?.get("previewTheme");
  const matchingThemeDef = resolveStoreTheme(previewParam || theme?.activeTheme, theme);

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
        className="sticky top-0 z-40 transition-all duration-300 border-b backdrop-blur-md shadow-2xs"
        style={{
          backgroundColor: isDarkNav ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
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

        {/* Sleek Minimal Navbar with Snug Typography Logo Fit */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          {/* Brand Typography Logo — Luxury Scale & Pixel-Perfect Navbar Fit */}
          <Link href="/" className="flex items-center group min-w-0 max-w-[170px] sm:max-w-[240px] flex-shrink py-0.5" title={brandName}>
            {matchingThemeDef.code === "AITHRITHI_MAROON" ? (
              <img
                src={isDarkNav ? "/aithrithi-nav-logo.png" : "/aithrithi-nav-logo-maroon.png"}
                alt="Aithrithi.in By Devika"
                className="h-9 sm:h-11 md:h-12 w-auto max-w-[160px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/aithrithi-nav-logo-maroon.png";
                }}
              />
            ) : (
              <>
                {theme?.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt={brandName}
                    className="h-9 sm:h-11 md:h-12 max-w-[100px] sm:max-w-[200px] w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-xs flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div className="flex flex-col min-w-0 ml-2">
                  <span
                    className={`font-serif font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight leading-none truncate transition-transform group-hover:scale-[1.01] ${
                      isDarkNav ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {brandName}
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Minimal Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold uppercase tracking-wider">
            <Link
              href="/"
              className={`transition-colors py-1 ${
                pathname === "/"
                  ? "font-bold text-blue-600"
                  : isDarkNav
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={pathname === "/" ? { color: matchingThemeDef.palette.accent } : {}}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`transition-colors py-1 ${
                pathname === "/shop"
                  ? "font-bold"
                  : isDarkNav
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={pathname === "/shop" ? { color: matchingThemeDef.palette.accent } : {}}
            >
              Catalog
            </Link>
            <Link
              href="/wishlist"
              className={`transition-colors py-1 ${
                pathname === "/wishlist"
                  ? "font-bold"
                  : isDarkNav
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={pathname === "/wishlist" ? { color: matchingThemeDef.palette.accent } : {}}
            >
              Wishlist
            </Link>
            <Link
              href="/track"
              className={`transition-colors py-1 ${
                pathname === "/track"
                  ? "font-bold"
                  : isDarkNav
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={pathname === "/track" ? { color: matchingThemeDef.palette.accent } : {}}
            >
              Track Order
            </Link>
            <Link
              href="/about"
              className={`transition-colors py-1 ${
                pathname === "/about"
                  ? "font-bold"
                  : isDarkNav
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={pathname === "/about" ? { color: matchingThemeDef.palette.accent } : {}}
            >
              About
            </Link>
          </nav>

          {/* Action Icons (Minimal, Touch-Optimized & Perfectly Fitted for iPhone 15) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Wishlist Link — on mobile, easily accessible via bottom navigation bar */}
            <Link
              href="/wishlist"
              className={`hidden sm:flex relative w-9 h-9 rounded-full items-center justify-center transition-colors ${
                isDarkNav
                  ? "hover:bg-white/10 text-slate-200"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link with Badge */}
            <Link
              href="/cart"
              className={`relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors ${
                isDarkNav
                  ? "hover:bg-white/10 text-slate-200"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
              title="Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-0.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: matchingThemeDef.palette.accent }}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown — on mobile, accessible via bottom navigation bar */}
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
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-extrabold text-slate-900 truncate">{customer.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{customer.email}</p>
                        {customer.isGuest && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase rounded">
                            Guest Shopper
                          </span>
                        )}
                      </div>

                      {!customer.isGuest && (
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold transition"
                        >
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>My Orders & Profile</span>
                        </Link>
                      )}

                      <Link
                        href="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold transition"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span>Saved Wishlist</span>
                        </div>
                        {wishlistCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      {customer.isGuest ? (
                        <Link
                          href="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 p-2 hover:bg-blue-50 text-blue-600 rounded-lg font-bold transition"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Create Full Account</span>
                        </Link>
                      ) : null}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-2 hover:bg-rose-50 text-rose-600 rounded-lg font-semibold transition text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-2 border-b border-slate-100">
                        <p className="font-bold text-slate-800">Welcome</p>
                        <p className="text-[10px] text-slate-400">Access orders, wishlist & discounts</p>
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sign In</span>
                      </Link>

                      <Link
                        href="/login?tab=register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition"
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

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                isDarkNav ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Sheet Navigation */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t transition-all duration-300 p-4 space-y-4 animate-in slide-in-from-top-2 shadow-2xl"
            style={{
              backgroundColor: isDarkNav ? "#0F172A" : "#FFFFFF",
              borderColor: isDarkNav ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
              color: isDarkNav ? "#F1F5F9" : "#0F172A",
            }}
          >
            {/* Quick Search Jump for Mobile */}
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition"
              style={{
                backgroundColor: isDarkNav ? "rgba(255,255,255,0.06)" : "#F8FAFC",
                borderColor: isDarkNav ? "rgba(255,255,255,0.12)" : "#E2E8F0",
                color: isDarkNav ? "#CBD5E1" : "#64748B",
              }}
            >
              <Compass className="w-4 h-4 opacity-60" />
              <span className="text-[12px]">Explore all collections & products...</span>
            </Link>

            {/* Navigation Links for Mobile */}
            <div className="space-y-1 text-sm font-semibold divide-y divide-black/5 dark:divide-white/5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] py-2 px-2 rounded-lg transition-colors ${
                  pathname === "/" ? "font-bold text-blue-600" : "opacity-85 hover:opacity-100"
                }`}
                style={pathname === "/" ? { color: matchingThemeDef.palette.accent } : {}}
              >
                <span>Home</span>
                {pathname === "/" && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] py-2 px-2 rounded-lg transition-colors ${
                  pathname === "/shop" ? "font-bold" : "opacity-85 hover:opacity-100"
                }`}
                style={pathname === "/shop" ? { color: matchingThemeDef.palette.accent } : {}}
              >
                <span>Shop All Collections</span>
                {pathname === "/shop" && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[44px] py-2 px-2 rounded-lg opacity-85 hover:opacity-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>My Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] py-2 px-2 rounded-lg transition-colors ${
                  pathname === "/track" ? "font-bold" : "opacity-85 hover:opacity-100"
                }`}
                style={pathname === "/track" ? { color: matchingThemeDef.palette.accent } : {}}
              >
                <span>Track Orders</span>
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between min-h-[44px] py-2 px-2 rounded-lg transition-colors ${
                  pathname === "/about" ? "font-bold" : "opacity-85 hover:opacity-100"
                }`}
                style={pathname === "/about" ? { color: matchingThemeDef.palette.accent } : {}}
              >
                <span>About Store</span>
              </Link>
            </div>

            {/* Mobile Auth Bottom Section */}
            <div
              className="pt-3 border-t space-y-2.5"
              style={{ borderColor: isDarkNav ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}
            >
              {customer ? (
                <div
                  className="p-3 rounded-2xl border space-y-2"
                  style={{
                    backgroundColor: isDarkNav ? "rgba(255,255,255,0.04)" : "#F8FAFC",
                    borderColor: isDarkNav ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{customer.name}</p>
                      <p className="text-[10px] opacity-60 font-mono truncate">{customer.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-rose-500 font-semibold hover:underline ml-2"
                    >
                      Sign Out
                    </button>
                  </div>
                  {!customer.isGuest && (
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: matchingThemeDef.palette.accent }}
                    >
                      Manage Orders & Profile
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 px-3 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    style={{ backgroundColor: matchingThemeDef.palette.primary }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?tab=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* NATIVE MOBILE BOTTOM NAVIGATION BAR FOR IPHONE 15 & ANDROID */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t shadow-2xl transition-all"
        style={{
          backgroundColor: isDarkNav ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.96)",
          borderColor: isDarkNav ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))",
        }}
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around h-13 max-w-md mx-auto px-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              pathname === "/"
                ? "text-blue-600 font-bold"
                : isDarkNav
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
            style={pathname === "/" ? { color: matchingThemeDef.palette.accent } : {}}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          {/* Shop */}
          <Link
            href="/shop"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              pathname === "/shop"
                ? "text-blue-600 font-bold"
                : isDarkNav
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
            style={pathname === "/shop" ? { color: matchingThemeDef.palette.accent } : {}}
          >
            <Compass className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5">Shop</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              pathname === "/wishlist"
                ? "text-rose-600 font-bold"
                : isDarkNav
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <div className="relative">
              <Heart className={`w-4.5 h-4.5 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              pathname === "/cart"
                ? "text-blue-600 font-bold"
                : isDarkNav
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
            style={pathname === "/cart" ? { color: matchingThemeDef.palette.accent } : {}}
          >
            <div className="relative">
              <ShoppingBag className="w-4.5 h-4.5" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: matchingThemeDef.palette.accent }}
                >
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Cart</span>
          </Link>

          {/* Account */}
          <Link
            href={customer ? (customer.isGuest ? "/login" : "/account") : "/login"}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              pathname.startsWith("/account") || pathname.startsWith("/login")
                ? "text-blue-600 font-bold"
                : isDarkNav
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
            style={
              pathname.startsWith("/account") || pathname.startsWith("/login")
                ? { color: matchingThemeDef.palette.accent }
                : {}
            }
          >
            <User className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5">{customer ? (customer.isGuest ? "Guest" : "Account") : "Sign In"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
