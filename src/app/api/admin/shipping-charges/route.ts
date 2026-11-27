export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_SHIPPING_CHARGES = [
  { id: "ship-1", name: "Kerala (KL)", amount: 60, extraCharge: 0, isHomeArea: true, deliveryDays: "1-2 Business Days" },
  { id: "ship-2", name: "Tamil Nadu (TN)", amount: 100, extraCharge: 0, isHomeArea: false, deliveryDays: "2-3 Business Days" },
  { id: "ship-3", name: "Karnataka (KA)", amount: 120, extraCharge: 0, isHomeArea: false, deliveryDays: "2-4 Business Days" },
  { id: "ship-4", name: "Maharashtra (MH)", amount: 150, extraCharge: 0, isHomeArea: false, deliveryDays: "3-5 Business Days" },
  { id: "ship-5", name: "West Bengal (WB)", amount: 160, extraCharge: 0, isHomeArea: false, deliveryDays: "4-6 Business Days" },
  { id: "ship-6", name: "Delhi & NCR (DL)", amount: 140, extraCharge: 0, isHomeArea: false, deliveryDays: "3-5 Business Days" },
  { id: "ship-7", name: "Rest of India (National)", amount: 150, extraCharge: 30, isHomeArea: false, deliveryDays: "4-7 Business Days" },
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: "shipping_charges_json" },
    });

    let items = DEFAULT_SHIPPING_CHARGES;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, shippingCharges: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, amount, extraCharge, isHomeArea, deliveryDays } = body;

    if (!name || amount === undefined || amount === null) {
      return NextResponse.json({ success: false, error: "Region name and amount are required" }, { status: 400 });
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: "shipping_charges_json" },
    });

    let items: any[] = DEFAULT_SHIPPING_CHARGES;
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
              name,
              amount: Number(amount),
              extraCharge: Number(extraCharge || 0),
              isHomeArea: Boolean(isHomeArea),
              deliveryDays: deliveryDays || "3-5 Business Days",
            }
          : item
      );
    } else {
      const newItem = {
        id: `ship-${Date.now()}`,
        name,
        amount: Number(amount),
        extraCharge: Number(extraCharge || 0),
        isHomeArea: Boolean(isHomeArea),
        deliveryDays: deliveryDays || "3-5 Business Days",
      };
      items.push(newItem);
    }

    await prisma.storeSetting.upsert({
      where: { key: "shipping_charges_json" },
      update: { value: JSON.stringify(items) },
      create: { key: "shipping_charges_json", value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, shippingCharges: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Shipping charge ID required" }, { status: 400 });
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: "shipping_charges_json" },
    });

    let items: any[] = DEFAULT_SHIPPING_CHARGES;
    if (setting?.value) {
      try {
        items = JSON.parse(setting.value);
      } catch (e) {}
    }

    items = items.filter((item) => item.id !== id);

    await prisma.storeSetting.upsert({
      where: { key: "shipping_charges_json" },
      update: { value: JSON.stringify(items) },
      create: { key: "shipping_charges_json", value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true, shippingCharges: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
