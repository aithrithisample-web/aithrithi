export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { StoreNav } from "@/components/store-nav";
import StoreFooter from "@/components/store-footer";
import { ThemePreviewDock } from "@/components/theme-preview-dock";
import { WhatsAppFloatingWidget } from "@/components/whatsapp-floating-widget";
import { getStoreLicenseStatus } from "@/lib/license-client";
import { getCachedStoreTheme } from "@/lib/theme-cache";
import { StoreMaintenanceScreen } from "@/components/store-maintenance-screen";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let theme: any = null;
  try {
    theme = await getCachedStoreTheme();
  } catch (e) {
    // Database unseeded or unreachable
  }

  let licenseStatus;
  try {
    licenseStatus = await getStoreLicenseStatus();
  } catch (e) {
    licenseStatus = {
      valid: true,
      status: "ACTIVE",
      plan: "ENTERPRISE",
      entitlements: {} as any,
      domain: "localhost",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isGracePeriod: false,
    };
  }

  // If the license is expiring, expired, suspended, revoked, or under maintenance, show the luxury Maintenance Screen with AVRO logo
  const now = Date.now();
  const isPastExpiry = licenseStatus.expiresAt ? new Date(licenseStatus.expiresAt).getTime() <= now : false;
  const isUnderMaintenance =
    !licenseStatus.valid ||
    licenseStatus.status === "EXPIRED" ||
    licenseStatus.status === "REVOKED" ||
    licenseStatus.status === "SUSPENDED" ||
    licenseStatus.status === "MAINTENANCE" ||
    isPastExpiry;

  if (isUnderMaintenance) {
    const brandName = theme?.brandName || "Aithrithi";
    let customSocial: any = {};
    try {
      if (theme?.socialLinksJson) customSocial = JSON.parse(theme.socialLinksJson);
    } catch (e) {}
    const whatsappNumber = customSocial.whatsappNumber || theme?.supportPhone;

    return (
      <StoreMaintenanceScreen
        brandName={brandName}
        supportPhone={theme?.supportPhone}
        supportEmail={theme?.supportEmail}
        whatsappNumber={whatsappNumber}
        licenseStatus={licenseStatus}
      />
    );
  }

  // Active / Valid License: Normal Storefront
  return (
    <CartProvider>
      <WishlistProvider>
        <head>
          <link
            rel="icon"
            href={theme?.faviconUrl || "/favicon.svg"}
            type="image/svg+xml"
          />
          <link
            rel="apple-touch-icon"
            href={theme?.faviconUrl || "/favicon.svg"}
          />
        </head>
        <div
          className="min-h-screen flex flex-col transition-colors duration-300 pb-24 sm:pb-28 md:pb-0 overflow-x-hidden w-full max-w-full font-sans"
          style={{
            fontFamily: theme?.fontFamily || "'Plus Jakarta Sans', 'Cormorant Garamond', sans-serif",
            ["--color-primary" as any]: theme?.primaryColor || "#58111A",
            ["--color-accent" as any]: theme?.accentColor || "#C5A880",
          }}
        >
          <StoreNav theme={theme} />
          <main className="flex-grow w-full max-w-full overflow-x-hidden">{children}</main>
          <StoreFooter theme={theme} />
          <WhatsAppFloatingWidget theme={theme} />
          <ThemePreviewDock initialThemeCode={theme?.activeTheme} />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
