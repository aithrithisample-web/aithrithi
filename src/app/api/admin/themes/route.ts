export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enforceApiFeatureAccess } from "@/lib/permissions";
import { invalidateStoreThemeCache } from "@/lib/theme-cache";

export async function GET() {
  try {
    let themeSetting = await prisma.storeThemeSetting.findFirst();
    if (!themeSetting) {
      themeSetting = await prisma.storeThemeSetting.create({
        data: {
          activeTheme: "VEDHIKA_BOUTIQUE",
          brandName: "Aithrithi.in",
          primaryColor: "#222222",
          accentColor: "#DEB660",
          fontFamily: "'Poppins', 'Jost', sans-serif",
          bannerHeadline: "The Art of Kerala Designer Couture",
          bannerSubheadline: "By Devika · Handcrafted pure tussar silks, artisanal sarees, and festive designer kurtis tailored for timeless royalty.",
          bannerImageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85",
          announcementBarText: "✦ Complimentary Express Shipping Across India · 100% Authentic Handcrafted Designer Couture · International Shipping Available ✦",
          showAnnouncementBar: true,
          socialLinksJson: JSON.stringify({
            backgroundColor: "#FAF7F5",
            cardBg: "#FFFFFF",
            textColor: "#222222",
            textMuted: "#7B6E70",
            buttonRadius: "rounded-none",
            badgeRadius: "rounded-none",
            heroBadge: "AITHRITHI.IN · THE FIRST DESIGNER FASHION STORE FROM KERALA",
            headlineHighlight: "Couture.",
            ctaPrimary: "SHOP NOW",
            ctaSecondary: "EXPLORE LITE",
            announcementBg: "#222222",
            announcementTextColor: "#FFFFFF",
            trustBadges: [
              { title: "Artisanal Heritage", subtitle: "Handcrafted by generational master artisans", icon: "award" },
              { title: "Pure Handloom Luxury", subtitle: "Ethically spun mulmul, tussar silks & organic dyes", icon: "heart" },
              { title: "Complimentary Express Delivery", subtitle: "Fast doorstep delivery across India", icon: "truck" },
              { title: "Effortless 7-Day Exchange", subtitle: "Doorstep pickup supported by style concierge", icon: "refresh" },
            ],
            customThemes: [],
          }),
        },
      });
    }

    let customThemes: any[] = [];
    let heroSlides: any[] = [];
    let trustBadges: any[] = [];
    let showTrustBadges: boolean = true;
    if (themeSetting?.socialLinksJson) {
      try {
        const parsed = JSON.parse(themeSetting.socialLinksJson);
        if (Array.isArray(parsed?.customThemes)) {
          customThemes = parsed.customThemes;
        }
        if (Array.isArray(parsed?.heroSlides)) {
          heroSlides = parsed.heroSlides;
        }
        if (Array.isArray(parsed?.trustBadges)) {
          trustBadges = parsed.trustBadges;
        }
        if (parsed?.showTrustBadges !== undefined) {
          showTrustBadges = parsed.showTrustBadges;
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, theme: themeSetting, customThemes, heroSlides, trustBadges, showTrustBadges });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const access = await enforceApiFeatureAccess("themeCustomization");
    if (!access.allowed) {
      return access.response;
    }

    const body = await req.json();
    const {
      activeTheme,
      brandName,
      logoUrl,
      faviconUrl,
      primaryColor,
      accentColor,
      fontFamily,
      bannerHeadline,
      bannerSubheadline,
      bannerImageUrl,
      heroBadge,
      heroCtaText,
      heroCtaLink,
      companyAddress,
      companyCity,
      companyState,
      companyPostalCode,
      companyCountry,
      supportEmail,
      supportPhone,
      taxId,
      announcementBarText,
      showAnnouncementBar,
      socialLinksJson,
      customThemes,
      heroSlides,
      footerText,
    } = body;

    const themeSetting = await prisma.storeThemeSetting.findFirst();

    // Prepare robust socialLinksJson preserving customThemes and heroSlides
    let socialObj: any = {};
    if (typeof socialLinksJson === "string") {
      try {
        socialObj = JSON.parse(socialLinksJson);
      } catch (e) {
        socialObj = {};
      }
    } else if (typeof socialLinksJson === "object" && socialLinksJson !== null) {
      socialObj = { ...socialLinksJson };
    }

    if (Array.isArray(customThemes)) {
      socialObj.customThemes = customThemes;
    } else if (Array.isArray(body?.customThemes)) {
      socialObj.customThemes = body.customThemes;
    } else if (themeSetting?.socialLinksJson && !socialObj.customThemes) {
      try {
        const existing = JSON.parse(themeSetting.socialLinksJson);
        if (Array.isArray(existing?.customThemes)) {
          socialObj.customThemes = existing.customThemes;
        }
      } catch (e) {}
    }

    if (Array.isArray(heroSlides)) {
      socialObj.heroSlides = heroSlides;
    } else if (Array.isArray(body?.heroSlides)) {
      socialObj.heroSlides = body.heroSlides;
    } else if (themeSetting?.socialLinksJson && !socialObj.heroSlides) {
      try {
        const existing = JSON.parse(themeSetting.socialLinksJson);
        if (Array.isArray(existing?.heroSlides)) {
          socialObj.heroSlides = existing.heroSlides;
        }
      } catch (e) {}
    }

    if (Array.isArray(body?.trustBadges)) {
      socialObj.trustBadges = body.trustBadges;
    }
    if (body?.showTrustBadges !== undefined) {
      socialObj.showTrustBadges = body.showTrustBadges;
    }
    if (body?.instagramUrl !== undefined) socialObj.instagramUrl = body.instagramUrl;
    if (body?.instagramHandle !== undefined) socialObj.instagramHandle = body.instagramHandle;
    if (body?.instagramButtonText !== undefined) socialObj.instagramButtonText = body.instagramButtonText;
    if (body?.instagramTitle !== undefined) socialObj.instagramTitle = body.instagramTitle;
    if (body?.instagramSubtitle !== undefined) socialObj.instagramSubtitle = body.instagramSubtitle;
    if (body?.showInstagramSection !== undefined) socialObj.showInstagramSection = body.showInstagramSection;
    if (Array.isArray(body?.instagramPosts)) socialObj.instagramPosts = body.instagramPosts;
    if (body?.showWhatsAppButton !== undefined) socialObj.showWhatsAppButton = body.showWhatsAppButton;
    if (body?.whatsappNumber !== undefined) socialObj.whatsappNumber = body.whatsappNumber;
    if (body?.whatsappMessage !== undefined) socialObj.whatsappMessage = body.whatsappMessage;
    if (body?.whatsappTooltip !== undefined) socialObj.whatsappTooltip = body.whatsappTooltip;
    if (body?.whatsappPosition !== undefined) socialObj.whatsappPosition = body.whatsappPosition;

    const finalSocialLinksJson = JSON.stringify(socialObj);

    const updated = await prisma.storeThemeSetting.upsert({
      where: { id: themeSetting ? themeSetting.id : "cuid_placeholder" },
      update: {
        activeTheme,
        brandName: (brandName !== undefined && brandName.trim().length > 0) ? brandName : themeSetting?.brandName,
        logoUrl,
        faviconUrl,
        primaryColor,
        accentColor,
        fontFamily,
        bannerHeadline,
        bannerSubheadline,
        bannerImageUrl,
        heroBadge,
        heroCtaText,
        heroCtaLink,
        companyAddress,
        companyCity,
        companyState,
        companyPostalCode,
        companyCountry,
        supportEmail,
        supportPhone,
        taxId,
        announcementBarText,
        showAnnouncementBar: Boolean(showAnnouncementBar),
        socialLinksJson: finalSocialLinksJson,
        footerText,
      },
      create: {
        activeTheme: activeTheme || "AVRO_SIGNATURE",
        brandName: brandName || "AVRO Store",
        logoUrl,
        faviconUrl,
        primaryColor: primaryColor || "#0A192F",
        accentColor: accentColor || "#2563EB",
        fontFamily: fontFamily || "Inter, sans-serif",
        bannerHeadline: bannerHeadline || "Find your next",
        bannerSubheadline: bannerSubheadline || "Shop top-rated essentials with fast delivery.",
        bannerImageUrl: bannerImageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
        heroBadge: heroBadge || "EXCLUSIVE COLLECTION",
        heroCtaText: heroCtaText || "Shop Catalog",
        heroCtaLink: heroCtaLink || "/shop",
        companyAddress,
        companyCity,
        companyState,
        companyPostalCode,
        companyCountry: companyCountry || "India",
        supportEmail,
        supportPhone,
        taxId,
        announcementBarText: announcementBarText || "⚡ Free Shipping on orders over ₹999",
        showAnnouncementBar: Boolean(showAnnouncementBar),
        socialLinksJson: finalSocialLinksJson,
        footerText: footerText || "© 2026 AVRO Store. Powered by AVRO.",
      },
    });

    invalidateStoreThemeCache();
    return NextResponse.json({
      success: true,
      message: "Theme customization saved & deployed!",
      theme: updated,
      customThemes: socialObj.customThemes || [],
    });
  } catch (err: any) {
    console.error("Theme PUT error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
