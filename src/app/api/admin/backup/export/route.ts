export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const [categories, products, orders, customers, coupons, themeSetting, storeSettings] =
      await Promise.all([
        prisma.category.findMany(),
        prisma.product.findMany({
          include: {
            images: true,
            variants: true,
          },
        }),
        prisma.order.findMany({
          include: {
            items: true,
          },
          take: 500,
          orderBy: { createdAt: "desc" },
        }),
        prisma.storeCustomer.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
          take: 500,
        }),
        prisma.coupon.findMany(),
        prisma.storeThemeSetting.findFirst(),
        prisma.storeSetting.findMany(),
      ]);

    const backupData = {
      exportMeta: {
        platform: "AVRO Commerce Suite",
        version: "2.4.0",
        exportedAt: new Date().toISOString(),
        storeName: themeSetting?.brandName || "Aithrithi / AVRO Store",
      },
      counts: {
        categories: categories.length,
        products: products.length,
        orders: orders.length,
        customers: customers.length,
        coupons: coupons.length,
      },
      data: {
        categories,
        products,
        orders,
        customers,
        coupons,
        themeSetting,
        storeSettings,
      },
    };

    const fileName = `avro-store-backup-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
