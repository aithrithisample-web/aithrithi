"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Video,
  Upload,
  Link as LinkIcon,
  ShoppingBag,
  Tag,
  AlertTriangle,
  X,
  Play,
  RotateCw,
  Star,
  Check,
  ChevronRight,
  PackagePlus,
  Percent,
  Eye,
  Sliders,
  DollarSign,
  Box,
  Palette,
  Sparkles,
  CheckSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductImageItem {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductVariantItem {
  id?: string;
  size: string;
  color: string;
  colorHex?: string;
  sku: string;
  price: string;
  stockQuantity: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState<"ALL" | "FEATURED" | "STANDARD">("ALL");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"GENERAL" | "MEDIA" | "VARIANTS" | "RELATED" | "COMBOS">("GENERAL");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("25");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [featured, setFeatured] = useState(false);

  // Variants & Inventory State
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [newVarSize, setNewVarSize] = useState("Free Size");
  const [newVarColor, setNewVarColor] = useState("Vermilion Red");
  const [newVarColorHex, setNewVarColorHex] = useState("#C21807");
  const [newVarStock, setNewVarStock] = useState("5");
  const [newVarPrice, setNewVarPrice] = useState("");
  const [newVarSku, setNewVarSku] = useState("");

  // Media Tab State (Images & Videos from system)
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Related Products State
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [relatedSearch, setRelatedSearch] = useState("");

  // Combo & Bundle Deal State
  const [isComboDeal, setIsComboDeal] = useState(false);
  const [comboTitle, setComboTitle] = useState("");
  const [comboDiscountPercent, setComboDiscountPercent] = useState("15");
  const [comboProductIds, setComboProductIds] = useState<string[]>([]);
  const [comboSearch, setComboSearch] = useState("");

  // Notification Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  const loadProducts = () => {
    setLoading(true);
    fetch(`/api/admin/products?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products || []);
          setCategories(data.categories || []);
          if (data.categories.length > 0 && !categoryId) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch((e) => showToast("error", "Failed to load products: " + e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProductId(null);
    setTitle("");
    setSlug("");
    setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    setCategoryId(categories[0]?.id || "");
    setRegularPrice("");
    setSalePrice("");
    setStockQuantity("25");
    setShortDescription("");
    setDescription("");
    setStatus("PUBLISHED");
    setFeatured(false);
    setImages([
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        altText: "Main product photo",
        isPrimary: true,
      },
    ]);
    setVideoUrl("");
    setVideoTitle("");
    setRelatedProductIds([]);
    setIsComboDeal(false);
    setComboTitle("");
    setComboDiscountPercent("15");
    setComboProductIds([]);
    setVariants([]);
    setNewVarSize("Free Size");
    setNewVarColor("Vermilion Red");
    setNewVarColorHex("#C21807");
    setNewVarStock("5");
    setNewVarPrice("");
    setNewVarSku("");
    setActiveTab("GENERAL");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (prod: any) => {
    setEditingProductId(prod.id);
    setTitle(prod.title || "");
    setSlug(prod.slug || "");
    setSku(prod.sku || "");
    setCategoryId(prod.categoryId || categories[0]?.id || "");
    setRegularPrice(String(prod.regularPrice || ""));
    setSalePrice(prod.salePrice ? String(prod.salePrice) : "");
    setStockQuantity(String(prod.stockQuantity ?? "0"));
    setShortDescription(prod.shortDescription || "");
    setDescription(prod.description || "");
    setStatus(prod.status || "PUBLISHED");
    setFeatured(Boolean(prod.featured));

    // Variants (Size, Color, Stock, SKU, Price)
    if (Array.isArray(prod.variants) && prod.variants.length > 0) {
      setVariants(
        prod.variants.map((v: any) => {
          let size = "";
          let color = "";
          let colorHex = "#C21807";
          if (v.attributesJson) {
            try {
              const attrs = JSON.parse(v.attributesJson);
              size = attrs.size || attrs.Size || "";
              color = attrs.color || attrs.Color || "";
              colorHex = attrs.colorHex || "#C21807";
            } catch {
              // ignore
            }
          }
          if (!size && !color && v.title) {
            const parts = v.title.split("/").map((s: string) => s.trim());
            if (parts.length >= 2) {
              size = parts[0];
              color = parts[1];
            } else {
              size = v.title;
            }
          }
          return {
            id: v.id,
            size: size || "Standard",
            color: color || "Default",
            colorHex: colorHex || "#C21807",
            sku: v.sku || "",
            price: String(v.price ?? prod.regularPrice ?? ""),
            stockQuantity: String(v.stockQuantity ?? 0),
          };
        })
      );
    } else {
      setVariants([]);
    }
    setNewVarPrice(String(prod.regularPrice || ""));
    setNewVarSku("");

    // Images
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      setImages(prod.images.map((img: any) => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary })));
    } else {
      setImages([]);
    }

    // Video
    setVideoUrl(prod.videoUrl || "");
    setVideoTitle(prod.videoTitle || "");

    // Related Products
    if (prod.relatedProductIds) {
      try {
        const parsed = JSON.parse(prod.relatedProductIds);
        setRelatedProductIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setRelatedProductIds(prod.relatedProductIds.split(",").map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setRelatedProductIds([]);
    }

    // Combos
    setIsComboDeal(Boolean(prod.isComboDeal));
    setComboTitle(prod.comboTitle || "");
    setComboDiscountPercent(String(prod.comboDiscountPercent || "15"));
    if (prod.comboProductIds) {
      try {
        const parsed = JSON.parse(prod.comboProductIds);
        setComboProductIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setComboProductIds(prod.comboProductIds.split(",").map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setComboProductIds([]);
    }

    setActiveTab("GENERAL");
    setIsModalOpen(true);
  };

  // Variant management handlers
  const handleAddVariant = () => {
    if (!newVarSize && !newVarColor) {
      showToast("error", "Please specify at least a Size or a Color for the variant.");
      return;
    }
    const autoSku =
      newVarSku.trim() ||
      `${sku || "SKU"}-${newVarSize || "VAR"}-${newVarColor || ""}-${variants.length + 1}`
        .replace(/[^A-Za-z0-9-]/g, "")
        .toUpperCase();

    const item: ProductVariantItem = {
      size: newVarSize.trim(),
      color: newVarColor.trim(),
      colorHex: newVarColorHex || "#C21807",
      sku: autoSku,
      price: newVarPrice || regularPrice || "0",
      stockQuantity: newVarStock || "0",
    };

    setVariants([...variants, item]);
    setNewVarSku("");
    showToast("success", `Variant "${item.size} / ${item.color}" added with ${item.stockQuantity} stock.`);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleUpdateVariantStock = (index: number, stock: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], stockQuantity: stock };
    setVariants(updated);
  };

  const handleUpdateVariantPrice = (index: number, pr: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], price: pr };
    setVariants(updated);
  };

  const handleBatchGenerateSizes = (sizesToGen: string[]) => {
    if (!newVarColor) {
      showToast("error", "Please specify a color name for generating sizes.");
      return;
    }
    const newItems: ProductVariantItem[] = sizesToGen.map((sz, idx) => ({
      size: sz,
      color: newVarColor,
      colorHex: newVarColorHex || "#C21807",
      sku: `${sku || "SKU"}-${sz}-${newVarColor}-${variants.length + idx + 1}`.replace(/[^A-Za-z0-9-]/g, "").toUpperCase(),
      price: regularPrice || "0",
      stockQuantity: newVarStock || "5",
    }));
    setVariants([...variants, ...newItems]);
    showToast("success", `Generated ${newItems.length} size variants for "${newVarColor}"!`);
  };

  // Upload Images / Videos from System
  const handleSystemFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideoFile = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "File upload failed.");
        return;
      }

      if (isVideoFile) {
        // Set video URL
        setVideoUrl(data.url);
        setVideoTitle(files[0].name.replace(/\.[^/.]+$/, ""));
        showToast("success", "Video clip uploaded from system successfully.");
      } else {
        // Append new images
        const newImages: ProductImageItem[] = data.assets.map((asset: any, index: number) => ({
          url: asset.fileUrl,
          altText: asset.altText || `${title} photo`,
          isPrimary: images.length === 0 && index === 0,
        }));
        setImages((prev) => [...prev, ...newImages]);
        showToast("success", `${newImages.length} image(s) uploaded from system.`);
      }
    } catch (err: any) {
      showToast("error", "Network error uploading file from system.");
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Set image as primary
  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  // Toggle Related Product Selection
  const toggleRelatedProduct = (targetId: string) => {
    setRelatedProductIds((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]
    );
  };

  // Toggle Combo Product Selection
  const toggleComboProduct = (targetId: string) => {
    setComboProductIds((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]
    );
  };

  // Save Product (Create or Update)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !regularPrice) {
      showToast("error", "Title and Regular Price are required.");
      return;
    }

    setSubmitting(true);

    const sumVariantStock = variants.reduce((acc, v) => acc + (parseInt(v.stockQuantity) || 0), 0);
    const finalStock = variants.length > 0 ? sumVariantStock : (parseInt(stockQuantity) || 0);

    const payload = {
      id: editingProductId,
      title,
      slug: slug || undefined,
      sku,
      categoryId,
      regularPrice: parseFloat(regularPrice),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stockQuantity: finalStock,
      shortDescription,
      description,
      status,
      featured,
      images,
      videoUrl,
      videoTitle,
      relatedProductIds,
      isComboDeal,
      comboProductIds,
      comboDiscountPercent: parseFloat(comboDiscountPercent) || 0,
      comboTitle,
      variants,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: editingProductId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to save product.");
        return;
      }

      showToast("success", data.message || "Product saved successfully.");
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast("error", "Network error saving product.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (prodId: string, prodTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${prodTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${prodId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "Product deleted successfully.");
        loadProducts();
      } else {
        showToast("error", data.error || "Failed to delete product.");
      }
    } catch (e) {
      showToast("error", "Network error deleting product.");
    }
  };

  // Calculations for Combo Deal Preview
  const basePriceNum = parseFloat(salePrice || regularPrice) || 0;
  const comboBundledProducts = products.filter((p) => comboProductIds.includes(p.id));
  const bundledSum = comboBundledProducts.reduce((sum, p) => sum + (p.salePrice || p.regularPrice), 0);
  const fullComboOriginalTotal = basePriceNum + bundledSum;
  const discountRate = (parseFloat(comboDiscountPercent) || 0) / 100;
  const comboBundlePrice = fullComboOriginalTotal * (1 - discountRate);
  const totalCustomerSavings = fullComboOriginalTotal - comboBundlePrice;

  // Quick 1-Click Toggle for Featured status
  const handleToggleFeatured = async (id: string, currentFeatured: boolean, productTitle: string) => {
    const newFeatured = !currentFeatured;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: newFeatured } : item))
    );

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured: newFeatured }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          "success",
          newFeatured
            ? `⭐ "${productTitle}" is now Featured on Homepage Bestsellers!`
            : `"${productTitle}" removed from Featured showcase.`
        );
      } else {
        // Revert on failure
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, featured: currentFeatured } : item))
        );
        showToast("error", data.error || "Failed to update featured status.");
      }
    } catch {
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, featured: currentFeatured } : item))
      );
      showToast("error", "Network error updating featured status.");
    }
  };

  // Filter products by search, category, and featured status
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchesFeatured =
      featuredFilter === "ALL"
        ? true
        : featuredFilter === "FEATURED"
        ? Boolean(p.featured)
        : !p.featured;
    return matchesCat && matchesFeatured;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-3 transition-all ${
            toast.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : "bg-rose-900 text-rose-100 border-rose-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-slate-800">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#2563EB]" />
            Products & Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure product catalog with system image uploads, video clips, combo deals, and related cross-sells.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/combos"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
          >
            <PackagePlus className="w-4 h-4 text-purple-600" />
            <span>Combo Deals Manager</span>
          </Link>

          <Link
            href="/admin/media"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Media Library</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{products.length}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Active catalog listings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">New Arrivals Showcase</span>
          <span className="text-2xl font-black text-amber-950 mt-1 block flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            {products.filter((p) => p.featured).length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Live on Homepage New Arrivals</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Published</span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">
            {products.filter((p) => p.status === "PUBLISHED").length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Live on storefront</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Combo Bundles</span>
          <span className="text-2xl font-black text-purple-950 mt-1 block">
            {products.filter((p) => p.isComboDeal).length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">High-AOV package deals</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Filter:</span>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="ALL">All Items</option>
            <option value="FEATURED">⭐ New Arrivals Only</option>
            <option value="STANDARD">Standard Catalog Only</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Product & Media</th>
                <th className="py-3 px-4">Category / SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock & Variants</th>
                <th className="py-3 px-4">New Arrival</th>
                <th className="py-3 px-4">Deals & Media</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    {loading ? "Loading product catalog..." : "No products found matching criteria."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      {/* Product & Thumbnail */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {primaryImg ? (
                              <img src={primaryImg} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                            {p.videoUrl && (
                              <span className="absolute bottom-1 right-1 bg-black/75 text-white p-0.5 rounded text-[8px] flex items-center">
                                <Play className="w-2.5 h-2.5 fill-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">{p.title}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 block">{p.category?.name || "Uncategorized"}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">{p.sku}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {p.salePrice ? (
                          <div>
                            <span className="font-black text-emerald-600 block">₹{p.salePrice}</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{p.regularPrice}</span>
                          </div>
                        ) : (
                          <span>₹{p.regularPrice}</span>
                        )}
                      </td>

                      {/* Stock & Variants */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stockQuantity > 5
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.stockQuantity > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {p.stockQuantity} in stock
                        </span>
                        {p.variants?.length > 0 && (
                          <span className="block text-[10px] text-indigo-600 font-bold mt-0.5">
                            {p.variants.length} size/color variants
                          </span>
                        )}
                      </td>

                      {/* New Arrival 1-Click Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p.id, Boolean(p.featured), p.title)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                            p.featured
                              ? "bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200"
                              : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                          }`}
                          title={p.featured ? "Click to remove from New Arrivals showcase" : "Click to mark as New Arrival on Homepage"}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.featured ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
                          <span>{p.featured ? "⭐ New Arrival" : "Standard"}</span>
                        </button>
                      </td>

                      {/* Deals & Media Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isComboDeal && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                              Combo Deal ({p.comboDiscountPercent}% Off)
                            </span>
                          )}
                          {p.videoUrl && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" /> Video
                            </span>
                          )}
                          {p.images && p.images.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                              {p.images.length} photos
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            p.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "PUBLISHED" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit Product, Media, Combo & Related"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: CREATE / EDIT PRODUCT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingProductId ? `Edit Product: ${title}` : "Add New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure images/videos from system, combo deals, and related cross-sells
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-bold flex-shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("GENERAL")}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  activeTab === "GENERAL"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>General & Pricing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("VARIANTS")}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  activeTab === "VARIANTS"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Size, Color & Stock</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                    variants.length > 0 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {variants.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("MEDIA")}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  activeTab === "MEDIA"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Photos & Videos from System ({images.length})</span>
                {videoUrl && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("RELATED")}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  activeTab === "RELATED"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Related Products ({relatedProductIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("COMBOS")}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  activeTab === "COMBOS"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5 text-purple-600" />
                <span>Combo & Bundle Deal {isComboDeal && "(Active)"}</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitProduct} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* ================= TAB 1: GENERAL & PRICING ================= */}
              {activeTab === "GENERAL" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Product Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Product title"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">URL Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="auto-generated-from-title"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Category *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">SKU Code</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Stock Quantity</label>
                        {variants.length > 0 && (
                          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            Auto-synced from {variants.length} variants
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        value={variants.length > 0 ? variants.reduce((a, b) => a + (parseInt(b.stockQuantity) || 0), 0) : stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        disabled={variants.length > 0}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                          variants.length > 0
                            ? "bg-indigo-50/60 border-indigo-200 text-indigo-900 cursor-not-allowed"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                      {variants.length > 0 && (
                        <p className="text-[10px] text-indigo-600 font-medium">
                          Multi-variant stock active. To adjust stock per size/colour, switch to the <strong>Size, Color & Stock</strong> tab.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Regular Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        required
                        placeholder="Regular price"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Sale / Discounted Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="Optional sale price"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Short Summary / Catchphrase</label>
                    <input
                      type="text"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief one-line highlight for cards and previews"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed specifications, features, in-box items..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  {/* Feature in New Arrivals (Curated Section) Toggle */}
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${featured ? "fill-amber-400 text-amber-500" : "text-amber-500"}`} />
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          Feature in New Arrivals Section (Homepage Showcase)
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600">
                        When enabled, this product is immediately featured in the &quot;New Arrivals&quot; curated gallery on the storefront homepage and mobile app.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-slate-700">Publish Status:</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: SYSTEM PHOTOS & VIDEOS ================= */}
              {activeTab === "MEDIA" && (
                <div className="space-y-6">
                  {/* Upload from System Box */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-[#2563EB]/60 transition text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Upload Product Photos & Videos from your System
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-0.5">
                        Select files directly from your computer. Supported formats: PNG, JPG, WEBP, GIF, MP4, WEBM.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={(e) => handleSystemFileUpload(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingMedia}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 font-bold text-xs shadow-xs transition"
                      >
                        {isUploadingMedia ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        <span>{isUploadingMedia ? "Uploading Files..." : "Browse Images from Computer"}</span>
                      </button>

                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(e) => handleSystemFileUpload(e, true)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingMedia}
                        onClick={() => videoInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-xs transition"
                      >
                        <Video className="w-4 h-4 text-emerald-400" />
                        <span>Upload Video from System</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Images Gallery */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        Product Gallery Photos ({images.length})
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Click the star to set an image as primary storefront cover
                      </span>
                    </div>

                    {images.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                        No photos added yet. Upload files from your system above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`group relative rounded-xl border-2 overflow-hidden aspect-square bg-slate-100 shadow-2xs transition ${
                              img.isPrimary ? "border-[#2563EB] ring-2 ring-blue-500/30" : "border-slate-200"
                            }`}
                          >
                            <img src={img.url} alt="Product" className="w-full h-full object-cover" />

                            {/* Primary Badge */}
                            {img.isPrimary && (
                              <span className="absolute top-1.5 left-1.5 bg-[#2563EB] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-white" /> Primary
                              </span>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              {!img.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(idx)}
                                  className="p-1.5 rounded-lg bg-white/90 text-[#2563EB] hover:bg-white transition"
                                  title="Make Primary Cover"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                                title="Delete Image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Video Section */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs">Product Video Showcase</h4>
                          <p className="text-[10px] text-slate-400">Embed YouTube/Vimeo or display an uploaded MP4</p>
                        </div>
                      </div>
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl("");
                            setVideoTitle("");
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Remove Video
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Video File URL or Embed Link</label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="Video file path or embed URL"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Video Caption / Title</label>
                        <input
                          type="text"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          placeholder="Video caption or title"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>

                    {/* Video Live Preview */}
                    {videoUrl && (
                      <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-md mx-auto shadow-md">
                        {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                          <iframe
                            src={videoUrl.replace("watch?v=", "embed/")}
                            className="w-full h-full"
                            title="Product Video"
                            allowFullScreen
                          />
                        ) : (
                          <video src={videoUrl} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB: SIZE, COLOR & STOCK VARIANTS ================= */}
              {activeTab === "VARIANTS" && (
                <div className="space-y-6">
                  {/* Informational Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-indigo-950 text-sm">
                        Product Variants & Individual Stock Management
                      </h4>
                      <p className="text-[11px] sm:text-xs text-indigo-800/90 leading-relaxed">
                        Configure different <strong>Sizes</strong>, <strong>Colours</strong>, and <strong>Stock Quantities</strong> for this product.
                        Customers on the mobile app and website will be able to select their exact size and colour with live inventory checks and individual pricing.
                      </p>
                    </div>
                  </div>

                  {/* Add Variant Box */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        Add New Size & Colour Variant
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        Each variant maintains isolated inventory and SKU
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Size Input & Presets */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Size / Dimension *</label>
                        <input
                          type="text"
                          value={newVarSize}
                          onChange={(e) => setNewVarSize(e.target.value)}
                          placeholder="e.g. Free Size, S, M, L, XL"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                        <div className="flex flex-wrap gap-1 pt-1">
                          {["Free Size", "XS", "S", "M", "L", "XL", "2XL", "3XL"].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setNewVarSize(sz)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                newVarSize === sz
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Input & Presets */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Colour / Shade *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newVarColorHex}
                            onChange={(e) => setNewVarColorHex(e.target.value)}
                            className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white shrink-0"
                            title="Pick exact hex color"
                          />
                          <input
                            type="text"
                            value={newVarColor}
                            onChange={(e) => setNewVarColor(e.target.value)}
                            placeholder="e.g. Vermilion Red"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                          {[
                            { name: "Vermilion Red", hex: "#C21807" },
                            { name: "Emerald Green", hex: "#046307" },
                            { name: "Antique Gold", hex: "#DEB660" },
                            { name: "Royal Blue", hex: "#1E3A8A" },
                            { name: "Deep Maroon", hex: "#58111A" },
                            { name: "Mustard Yellow", hex: "#EAB308" },
                            { name: "Coffee Brown", hex: "#4A2E18" },
                            { name: "Coral Orange", hex: "#F97316" },
                            { name: "Pure White", hex: "#FFFFFF" },
                            { name: "Jet Black", hex: "#18181B" },
                          ].map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => {
                                setNewVarColor(col.name);
                                setNewVarColorHex(col.hex);
                              }}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                                newVarColor === col.name
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: col.hex }} />
                              <span>{col.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Stock Count for this Variant *</label>
                        <input
                          type="number"
                          value={newVarStock}
                          onChange={(e) => setNewVarStock(e.target.value)}
                          min="0"
                          placeholder="e.g. 10"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                        <p className="text-[10px] text-slate-400">
                          Specific units available in this size & colour.
                        </p>
                      </div>

                      {/* Price & SKU */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Price (₹) & Custom SKU</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newVarPrice}
                          onChange={(e) => setNewVarPrice(e.target.value)}
                          placeholder={`Inherit ₹${regularPrice || "0"}`}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-1"
                        />
                        <input
                          type="text"
                          value={newVarSku}
                          onChange={(e) => setNewVarSku(e.target.value.toUpperCase())}
                          placeholder="Custom SKU (auto if blank)"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">⚡ 1-Click Fast Generator:</span>
                        <button
                          type="button"
                          onClick={() => handleBatchGenerateSizes(["S", "M", "L", "XL", "XXL"])}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Generate Sizes S, M, L, XL, XXL for &quot;{newVarColor}&quot;</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Variant</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Configured Variants */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Configured Variants ({variants.length})
                        </span>
                        {variants.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Total Inventory: {variants.reduce((acc, v) => acc + (parseInt(v.stockQuantity) || 0), 0)} units
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        You can edit stock count & price inline in the table below
                      </span>
                    </div>

                    {variants.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <Box className="w-10 h-10 text-slate-300 mx-auto" />
                        <h5 className="font-bold text-slate-700 text-xs">No product variants configured</h5>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Add sizes and colours using the form above to enable customer variant selection and separate inventory counts per size.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-4">Size</th>
                              <th className="py-2.5 px-4">Colour</th>
                              <th className="py-2.5 px-4">SKU</th>
                              <th className="py-2.5 px-4">Price (₹)</th>
                              <th className="py-2.5 px-4">Stock Quantity</th>
                              <th className="py-2.5 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {variants.map((v, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition">
                                <td className="py-3 px-4">
                                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white rounded-md font-bold text-xs shadow-2xs">
                                    {v.size || "Free Size"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                      style={{ backgroundColor: v.colorHex || "#C21807" }}
                                    />
                                    <span className="font-bold text-slate-800">{v.color || "Standard"}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                                  {v.sku || `${sku}-${idx + 1}`}
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={v.price}
                                    onChange={(e) => handleUpdateVariantPrice(idx, e.target.value)}
                                    placeholder={regularPrice || "0"}
                                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      value={v.stockQuantity}
                                      onChange={(e) => handleUpdateVariantStock(idx, e.target.value)}
                                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                    />
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        parseInt(v.stockQuantity) > 0
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-rose-50 text-rose-700 border border-rose-200"
                                      }`}
                                    >
                                      {parseInt(v.stockQuantity) > 0 ? "In Stock" : "Sold Out"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(idx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    title="Delete variant"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Summary Card */}
                  {variants.length > 0 && (
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>{variants.length} active variants configured.</strong> Total synchronized inventory will be <strong>{variants.reduce((acc, v) => acc + (parseInt(v.stockQuantity) || 0), 0)} units</strong>.
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
                        Click &quot;Save Product&quot; to apply
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: RELATED PRODUCTS ================= */}
              {activeTab === "RELATED" && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <LinkIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-900 text-xs">Cross-Sell & Related Products</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Assigned related products will be featured on this product&apos;s page under &quot;You May Also Like&quot;
                        and &quot;Customers Also Bought&quot; to increase average order volume.
                      </p>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={relatedSearch}
                      onChange={(e) => setRelatedSearch(e.target.value)}
                      placeholder="Filter catalog to find related products..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Product Selector Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                    {products
                      .filter((p) => p.id !== editingProductId)
                      .filter((p) => !relatedSearch || p.title.toLowerCase().includes(relatedSearch.toLowerCase()))
                      .map((p) => {
                        const isSelected = relatedProductIds.includes(p.id);
                        const img = p.images?.find((i: any) => i.isPrimary)?.url || p.images?.[0]?.url;

                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleRelatedProduct(p.id)}
                            className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 select-none ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {img ? (
                                <img src={img} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-extrabold text-slate-900 block truncate text-xs">{p.title}</span>
                              <span className="text-[11px] font-black text-emerald-600 block">
                                ₹{p.salePrice || p.regularPrice}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                                isSelected ? "bg-emerald-600 text-white" : "border border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="text-right text-[11px] font-bold text-slate-500">
                    Selected Related Products: <span className="text-emerald-600">{relatedProductIds.length}</span>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: COMBOS & BUNDLES ================= */}
              {activeTab === "COMBOS" && (
                <div className="space-y-6">
                  {/* Enable Switch Banner */}
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                        <PackagePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-purple-950">Enable Combo / Bundle Deal</h4>
                        <p className="text-[11px] text-purple-700">
                          Bundle this product with complementary items and offer a special bundle discount.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isComboDeal}
                        onChange={(e) => setIsComboDeal(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {isComboDeal && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Combo Package Title</label>
                          <input
                            type="text"
                            value={comboTitle}
                            onChange={(e) => setComboTitle(e.target.value)}
                            placeholder="Combo package title"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Combo Discount Percentage (%)</label>
                          <div className="relative">
                            <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={comboDiscountPercent}
                              onChange={(e) => setComboDiscountPercent(e.target.value)}
                              placeholder="Discount percentage"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Bundle Price Calculator */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 block">
                            BUNDLE PRICING CALCULATION
                          </span>
                          <span className="text-base font-extrabold text-white mt-0.5 block">
                            {comboTitle || "Special Combo Bundle"}
                          </span>
                          <span className="text-xs text-purple-200">
                            Includes main product + {comboProductIds.length} bundled items
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <span className="text-[10px] text-purple-300 block">Original Sum</span>
                            <span className="text-sm font-semibold text-purple-200 line-through">
                              ₹{fullComboOriginalTotal.toFixed(2)}
                            </span>
                          </div>

                          <div className="pl-4 border-l border-purple-700/80">
                            <span className="text-[10px] font-black uppercase text-emerald-400 block">
                              Bundle Offer Price
                            </span>
                            <span className="text-2xl font-black text-emerald-300">
                              ₹{comboBundlePrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 block">
                              Save ₹{totalCustomerSavings.toFixed(2)} ({comboDiscountPercent}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Select Bundled Items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-slate-900 text-xs">
                            Select Products Included in this Combo ({comboProductIds.length})
                          </h5>
                          <input
                            type="text"
                            value={comboSearch}
                            onChange={(e) => setComboSearch(e.target.value)}
                            placeholder="Filter catalog..."
                            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                          {products
                            .filter((p) => p.id !== editingProductId)
                            .filter((p) => !comboSearch || p.title.toLowerCase().includes(comboSearch.toLowerCase()))
                            .map((p) => {
                              const isSelected = comboProductIds.includes(p.id);
                              const img = p.images?.find((i: any) => i.isPrimary)?.url || p.images?.[0]?.url;

                              return (
                                <div
                                  key={p.id}
                                  onClick={() => toggleComboProduct(p.id)}
                                  className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 select-none ${
                                    isSelected
                                      ? "border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {img ? (
                                      <img src={img} alt={p.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-extrabold text-slate-900 block truncate text-xs">
                                      {p.title}
                                    </span>
                                    <span className="text-[11px] font-black text-purple-700 block">
                                      ₹{p.salePrice || p.regularPrice}
                                    </span>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                                      isSelected ? "bg-purple-600 text-white" : "border border-slate-300"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{submitting ? "Saving Product..." : editingProductId ? "Update Product" : "Publish Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
