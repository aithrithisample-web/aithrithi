"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Receipt,
  Percent,
  HelpCircle,
} from "lucide-react";

interface HsnCode {
  id: string;
  code: string;
  gstRate: number;
  description?: string;
  category?: string;
}

export default function HsnCodesAdminPage() {
  const [hsnCodes, setHsnCodes] = useState<HsnCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HsnCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formState, setFormState] = useState({
    code: "",
    gstRate: 5,
    description: "",
    category: "",
  });

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadHsnCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hsn-codes");
      const data = await res.json();
      if (data.success) {
        setHsnCodes(data.hsnCodes || []);
      }
    } catch (e: any) {
      showToast("error", "Failed to load HSN codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHsnCodes();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormState({
      code: "",
      gstRate: 5,
      description: "",
      category: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: HsnCode) => {
    setEditingItem(item);
    setFormState({
      code: item.code,
      gstRate: item.gstRate,
      description: item.description || "",
      category: item.category || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.code.trim()) {
      showToast("error", "HSN code is required");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        code: formState.code.trim(),
        gstRate: Number(formState.gstRate),
        description: formState.description.trim(),
        category: formState.category.trim(),
      };
      if (editingItem) {
        payload.id = editingItem.id;
      }

      const res = await fetch("/api/admin/hsn-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setHsnCodes(data.hsnCodes);
        setIsModalOpen(false);
        showToast("success", editingItem ? "HSN code updated" : "New HSN code added");
      } else {
        showToast("error", data.error || "Failed to save HSN code");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save HSN code");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to remove HSN Code ${code}?`)) return;

    try {
      const res = await fetch(`/api/admin/hsn-codes?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setHsnCodes(data.hsnCodes);
        showToast("success", `HSN Code ${code} deleted`);
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const filteredCodes = hsnCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">HSN Codes & GST Rates</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              Tax Classification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Map Harmonized System of Nomenclature (HSN) codes to products for statutory GST invoicing and tax calculations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add HSN Code</span>
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
              placeholder="Search by HSN code, description, or category..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total HSN Entries: <span className="text-slate-900">{filteredCodes.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">HSN Code</th>
                <th className="py-3 px-4">GST Rate (%)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Product Class</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    Loading HSN codes...
                  </td>
                </tr>
              ) : filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No HSN codes found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCodes.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          item.gstRate === 0
                            ? "bg-slate-100 text-slate-700"
                            : item.gstRate <= 5
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.gstRate <= 12
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.gstRate <= 18
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <Percent className="w-3 h-3" />
                        {item.gstRate}% GST
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {item.category || <span className="text-slate-400 italic">General</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={item.description}>
                      {item.description || <span className="text-slate-400 italic">No description</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit HSN Code"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete HSN Code"
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
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  {editingItem ? "Edit HSN Code" : "Add New HSN Code"}
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
                  HSN / SAC Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6204, 6109, 7117"
                  value={formState.code}
                  onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Harmonized 4-digit, 6-digit or 8-digit tariff code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Statutory GST Rate (%) *
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[0, 3, 5, 12, 18, 28].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFormState({ ...formState, gstRate: rate })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black border transition cursor-pointer ${
                        formState.gstRate === rate
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                  value={formState.gstRate}
                  onChange={(e) => setFormState({ ...formState, gstRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Women's Apparel, Jewelry, Footwear"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Classification Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Official tariff description or store classification..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
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
                  {saving ? "Saving..." : editingItem ? "Update Code" : "Save HSN Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
