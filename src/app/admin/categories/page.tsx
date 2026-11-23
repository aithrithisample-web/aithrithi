"use client";

import { useEffect, useState, useRef } from "react";
import { Archive, Plus, Trash2, FolderTree, Image as ImageIcon, Edit2, Upload, CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formCat, setFormCat] = useState({
    name: "",
    slug: "",
    description: "",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  });

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormCat({
      name: "",
      slug: "",
      description: "",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingId(c.id);
    setFormCat({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      image: c.image || "",
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormCat((prev) => ({ ...prev, image: data.url }));
        showToast("success", "Category image uploaded from system.");
      } else {
        showToast("error", data.error || "Failed to upload image.");
      }
    } catch {
      showToast("error", "Network error uploading image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCat.name.trim()) {
      showToast("error", "Category name is required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          ...formCat,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        showToast("success", editingId ? `Category "${formCat.name}" updated!` : `Category "${formCat.name}" created!`);
        loadCategories();
      } else {
        showToast("error", data.error || "Failed to save category.");
      }
    } catch {
      showToast("error", "Network error saving category.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Products in this category will become uncategorized.`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", `Category "${name}" deleted.`);
        loadCategories();
      } else {
        showToast("error", data.error || "Failed to delete category.");
      }
    } catch {
      showToast("error", "Network error deleting category.");
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A192F]">Category Hierarchy & Collections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize catalog products into collections, banners, and storefront navigation menus. Fully synced with Storefront homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-xs text-slate-400 py-8">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <FolderTree className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No categories yet</h3>
            <p className="text-xs text-slate-500 mt-1">Create categories to showcase collections on your storefront.</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0A192F] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="h-36 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-100">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <FolderTree className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#0A192F]/80 text-white backdrop-blur-sm">
                    {c._count?.products || 0} Products
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{c.name}</h3>
                  <code className="text-[10.5px] text-slate-400 block mt-0.5 font-mono">/{c.slug}</code>
                  {c.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{c.description}</p>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-bold">● Active on Store</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#0A192F]">
                {editingId ? "Edit Category" : "Add Store Category"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formCat.name}
                  onChange={(e) => setFormCat({ ...formCat, name: e.target.value })}
                  placeholder="e.g. Handloom Sarees, Designer Kurtis"
                  className="w-full px-3 py-2 border rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formCat.slug}
                  onChange={(e) => setFormCat({ ...formCat, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Cover Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={formCat.image}
                    onChange={(e) => setFormCat({ ...formCat, image: e.target.value })}
                    placeholder="https://... or upload below"
                    className="flex-1 px-3 py-2 border rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition flex items-center gap-1.5 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formCat.image && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={formCat.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formCat.description}
                  onChange={(e) => setFormCat({ ...formCat, description: e.target.value })}
                  placeholder="Short description for collections showcase..."
                  className="w-full px-3 py-2 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A192F] text-white font-bold rounded-xl hover:bg-[#1E293B] shadow-sm"
                >
                  {editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
