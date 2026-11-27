export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { getStorePermissions } from "@/lib/permissions";
import { ShopFilterLayout } from "@/components/shop-filter-layout";

export default async function ShopCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { category, search, sort, q } = resolvedParams || {};
  const searchTerm = search || q;
  const permissions = await getStorePermissions();
  const allowReviews = permissions.check("productReviews").allowed;

  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    // Database unseeded or unreachable
  }

  // Build query
  const where: any = { status: "PUBLISHED" };
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { sku: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
        reviews: allowReviews
          ? {
              where: { isApproved: true },
              select: { rating: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // Database unseeded or unreachable
  }

  const activeCategoryObj = categories.find((c) => c.slug === category);
  const pageTitle = activeCategoryObj?.name || (searchTerm ? `Search: "${searchTerm}"` : "All Collections");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 font-sans">
      {/* Breadcrumb & Header Title (Vedhika Style) */}
      <div className="space-y-2 border-b border-[#F0F0F0] pb-6">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-stone-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">
            {pageTitle}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#222222]">
            {pageTitle}
          </h1>
          <p className="text-xs text-stone-500 font-sans">
            Handcrafted luxury couture curated with Kerala's master weavers
          </p>
        </div>
      </div>

      {/* Vedhika Style Product Filter & Grid System */}
      <ShopFilterLayout
        initialProducts={products}
        categories={categories}
        allowReviews={allowReviews}
      />
    </div>
  );
}
