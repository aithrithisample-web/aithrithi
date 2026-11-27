"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  Home,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface ShippingCharge {
  id: string;
  name: string;
  amount: number;
  extraCharge: number;
  isHomeArea: boolean;
  deliveryDays?: string;
}

export default function ShippingChargesAdminPage() {
  const [charges, setCharges] = useState<ShippingCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShippingCharge | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    amount: 100,
    extraCharge: 0,
    isHomeArea: false,
    deliveryDays: "2-4 Business Days",
  });

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCharges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping-charges");
      const data = await res.json();
      if (data.success) {
        setCharges(data.shippingCharges || []);
      }
    } catch (e: any) {
      showToast("error", "Failed to load shipping charges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormState({
      name: "",
      amount: 100,
      extraCharge: 0,
      isHomeArea: false,
      deliveryDays: "2-4 Business Days",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ShippingCharge) => {
    setEditingItem(item);
    setFormState({
      name: item.name,
      amount: item.amount,
      extraCharge: item.extraCharge || 0,
      isHomeArea: Boolean(item.isHomeArea),
      deliveryDays: item.deliveryDays || "2-4 Business Days",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      showToast("error", "Region or State name is required");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: formState.name.trim(),
        amount: Number(formState.amount),
        extraCharge: Number(formState.extraCharge),
        isHomeArea: formState.isHomeArea,
        deliveryDays: formState.deliveryDays.trim(),
      };
      if (editingItem) {
        payload.id = editingItem.id;
      }

      const res = await fetch("/api/admin/shipping-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setCharges(data.shippingCharges);
        setIsModalOpen(false);
        showToast("success", editingItem ? "Shipping rate updated" : "New shipping rate created");
      } else {
        showToast("error", data.error || "Failed to save rate");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save rate");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove shipping rate for ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping-charges?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCharges(data.shippingCharges);
        showToast("success", `Shipping rate for ${name} removed`);
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const filteredCharges = charges.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Regional Shipping Charges</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              State & Zone Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure state-wise, regional, and home-zone shipping rates applied at storefront checkout.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shipping Zone Rate</span>
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
              placeholder="Search by state or region..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Active Shipping Zones: <span className="text-slate-900">{filteredCharges.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">State / Regional Zone</th>
                <th className="py-3 px-4">Base Rate (₹)</th>
                <th className="py-3 px-4">Extra Surcharge (₹)</th>
                <th className="py-3 px-4">Home Area Status</th>
                <th className="py-3 px-4">Estimated Delivery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    Loading shipping rates...
                  </td>
                </tr>
              ) : filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    No shipping rates found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCharges.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ₹{item.amount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600">
                        {item.extraCharge > 0 ? `+ ₹${item.extraCharge}` : "₹0 (Free COD)"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isHomeArea ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Home className="w-3 h-3" />
                          Home State / Local Area
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 text-slate-600">
                          Outstation Zone
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.deliveryDays || "3-5 Business Days"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Shipping Rate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Shipping Rate"
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
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  {editingItem ? "Edit Shipping Zone Rate" : "Add New Shipping Rate"}
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
                  Region or State Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerala, Tamil Nadu, West Bengal, Rest of India"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Base Shipping Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formState.amount}
                    onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Extra Surcharge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.extraCharge}
                    onChange={(e) => setFormState({ ...formState, extraCharge: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Delivery Window
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1-2 Business Days, 3-5 Business Days"
                  value={formState.deliveryDays}
                  onChange={(e) => setFormState({ ...formState, deliveryDays: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isHomeArea}
                    onChange={(e) => setFormState({ ...formState, isHomeArea: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Mark as Home State / Local Zone</span>
                    <span className="text-[11px] text-slate-500 block">
                      Enables priority dispatch and discounted local courier charges for nearby customers.
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
                  {saving ? "Saving..." : editingItem ? "Update Rate" : "Save Shipping Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
