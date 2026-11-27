export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_ADS = [
  {
    id: "ad-1",
    title: "Festive Exclusive Collection 2026",
    link: "/shop?collection=festive",
    description: "Handcrafted luxury silhouettes with bespoke artisanal accents.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    position: "HERO_BANNER",
    isActive: true,
  },
  {
    id: "ad-2",
    title: "Summer Chiffon & Pure Linen Edit",
    link: "/shop?category=apparel",
    description: "Breathable, lightweight fabrics crafted for effortless elegance.",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
    position: "PROMO_MIDDLE",
    isActive: true,
  },
  {
    id: "ad-3",
    title: "Artisanal Jewelry & Accessories Spotlight",
    link: "/shop?category=jewelry",
    description: "Antique temple finish and contemporary minimal aesthetics.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
    position: "FOOTER_SPOTLIGHT",
    isActive: true,
  },
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: "ads_banners_json" },
    });

    let items = DEFAULT_ADS;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, ads: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, link, description, imageUrl, position, isActive } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Banner title is required" }, { status: 400 });
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: "ads_banners_json" },
    });

    let items: any[] = DEFAULT_ADS;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    if (id) {
      items = items.map((item) =>
        item.id === id
          ? {
              ...item,
              title,
              link: link || "/shop",
              description: description || "",
              imageUrl: imageUrl || item.imageUrl,
              position: position || "HERO_BANNER",
              isActive: isActive !== undefined ? Boolean(isActive) : true,
            }
          : item
      );
    } else {
      const newItem = {
        id: `ad-${Date.now()}`,
        title,
        link: link || "/shop",
        description: description || "",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
        position: position || "HERO_BANNER",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      };
      items.unshift(newItem);
    }

    await prisma.storeSetting.upsert({
      where: { key: "ads_banners_json" },
      update: { value: JSON.stringify(items) },
      create: { key: "ads_banners_json", value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, ads: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Ad ID required" }, { status: 400 });
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: "ads_banners_json" },
    });

    let items: any[] = DEFAULT_ADS;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    items = items.filter((item) => item.id !== id);

    await prisma.storeSetting.upsert({
      where: { key: "ads_banners_json" },
      update: { value: JSON.stringify(items) },
      create: { key: "ads_banners_json", value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, ads: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
