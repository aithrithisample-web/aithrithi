export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_HSN_CODES = [
  { id: "hsn-1", code: "6204", gstRate: 5, description: "Women's suits, dresses, skirts, divided skirts", category: "Apparel" },
  { id: "hsn-2", code: "6203", gstRate: 5, description: "Men's suits, jackets, trousers, shorts", category: "Apparel" },
  { id: "hsn-3", code: "6109", gstRate: 5, description: "T-shirts, singlets and other vests, knitted or crocheted", category: "Knitwear" },
  { id: "hsn-4", code: "7117", gstRate: 3, description: "Imitation jewelry and fashion accessories", category: "Jewelry" },
  { id: "hsn-5", code: "4202", gstRate: 18, description: "Trunks, suitcases, handbags, wallets", category: "Bags & Leather" },
  { id: "hsn-6", code: "6403", gstRate: 12, description: "Footwear with outer soles of rubber, plastics or leather", category: "Footwear" },
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: "hsn_codes_json" },
    });

    let items = DEFAULT_HSN_CODES;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {
        // fallback
      }
    }

    return NextResponse.json({ success: true, hsnCodes: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, gstRate, description, category, id } = body;

    if (!code || gstRate === undefined || gstRate === null) {
      return NextResponse.json({ success: false, error: "HSN Code and GST Rate are required" }, { status: 400 });
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: "hsn_codes_json" },
    });

    let items: any[] = DEFAULT_HSN_CODES;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    if (id) {
      // Edit existing
      items = items.map((item) =>
        item.id === id
          ? { ...item, code, gstRate: Number(gstRate), description: description || "", category: category || "" }
          : item
      );
    } else {
      // Add new
      const newItem = {
        id: `hsn-${Date.now()}`,
        code,
        gstRate: Number(gstRate),
        description: description || "",
        category: category || "",
      };
      items.unshift(newItem);
    }

    await prisma.storeSetting.upsert({
      where: { key: "hsn_codes_json" },
      update: { value: JSON.stringify(items) },
      create: { key: "hsn_codes_json", value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, hsnCodes: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "HSN Code ID is required" }, { status: 400 });
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: "hsn_codes_json" },
    });

    let items: any[] = DEFAULT_HSN_CODES;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    items = items.filter((item) => item.id !== id);

    await prisma.storeSetting.upsert({
      where: { key: "hsn_codes_json" },
      update: { value: JSON.stringify(items) },
      create: { key: "hsn_codes_json", value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, hsnCodes: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
