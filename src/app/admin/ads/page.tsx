"use client";

import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";

interface AdBanner {
  id: string;
  title: string;
  link: string;
  description?: string;
  imageUrl: string;
  position: string;
  isActive: boolean;
}

export default function AdsAdminPage() {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formState, setFormState] = useState({
    title: "",
    link: "/shop",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    position: "HERO_BANNER",
    isActive: true,
  });

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      if (data.success) {
        setAds(data.ads || []);
      }
    } catch (e: any) {
      showToast("error", "Failed to load advertising banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormState({
      title: "",
      link: "/shop",
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      position: "HERO_BANNER",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdBanner) => {
    setEditingItem(item);
    setFormState({
      title: item.title,
      link: item.link || "/shop",
      description: item.description || "",
      imageUrl: item.imageUrl,
      position: item.position || "HERO_BANNER",
      isActive: Boolean(item.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      showToast("error", "Banner title is required");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: formState.title.trim(),
        link: formState.link.trim(),
        description: formState.description.trim(),
        imageUrl: formState.imageUrl.trim(),
        position: formState.position,
        isActive: formState.isActive,
      };
      if (editingItem) {
        payload.id = editingItem.id;
      }

      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
        setIsModalOpen(false);
        showToast("success", editingItem ? "Banner updated" : "New promotional banner created");
      } else {
        showToast("error", data.error || "Failed to save banner");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
        showToast("success", `Banner "${title}" removed`);
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const filteredAds = ads.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.position && item.position.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border animate-in slide-in-from-top duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ads & Promotional Banners</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              Marketing & Visual Merchandising
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-conversion advertising banners, hero promotional slides, and spotlight creatives across the storefront.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Banner Ad</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banners by title, description or position..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Active Banners: <span className="text-slate-900">{filteredAds.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Banner Creative</th>
                <th className="py-3 px-4">Campaign Title & Copy</th>
                <th className="py-3 px-4">Display Position</th>
                <th className="py-3 px-4">Destination Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    Loading banner ads...
                  </td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    No banners found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredAds.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="w-20 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {item.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-blue-600 truncate max-w-xs">
                      {item.link}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 text-slate-500">
                          Paused
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  {editingItem ? "Edit Banner Ad" : "Create New Banner Ad"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campaign / Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Exclusive Collection 2026"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Position
                  </label>
                  <select
                    value={formState.position}
                    onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="HERO_BANNER">Hero Carousel / Banner</option>
                    <option value="PROMO_MIDDLE">Mid-Page Promotional Grid</option>
                    <option value="FOOTER_SPOTLIGHT">Footer Spotlight Card</option>
                    <option value="POPUP_MODAL">Announcement Modal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination URL
                  </label>
                  <input
                    type="text"
                    placeholder="/shop or /products/item"
                    value={formState.link}
                    onChange={(e) => setFormState({ ...formState, link: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subheadline / Promo Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short engaging caption displayed on top or below the banner..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Publish & Display on Storefront</span>
                    <span className="text-[11px] text-slate-500 block">
                      Turn off to temporarily hide this ad banner from shoppers without deleting it.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update Banner" : "Publish Banner Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
